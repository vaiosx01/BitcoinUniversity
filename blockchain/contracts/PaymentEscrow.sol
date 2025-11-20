// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CourseRegistry.sol";

/**
 * @title PaymentEscrow
 * @author Bitcoin University
 * @notice Secure escrow system for course payments with dispute resolution
 * @dev Holds course payments in escrow until completion or refund conditions are met.
 *      Supports partial payments, refunds, and automatic release upon course completion.
 */
contract PaymentEscrow is AccessControl, Pausable, ReentrancyGuard {
    /// @notice Role identifier for addresses that can resolve disputes
    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");

    /// @notice Reference to the CourseRegistry contract
    CourseRegistry public immutable courseRegistry;

    /**
     * @notice Escrow entry for a student's payment
     * @dev Tracks payment status and amounts
     */
    struct EscrowEntry {
        address student;               // Student who made the payment
        address educator;              // Educator receiving the payment
        uint256 courseId;              // Course ID
        uint256 amount;                // Total amount in escrow
        uint256 releasedAmount;        // Amount already released to educator
        uint256 refundedAmount;        // Amount refunded to student
        uint256 createdAt;            // Timestamp when escrow was created
        EscrowStatus status;           // Current status of the escrow
    }

    /**
     * @notice Escrow status enumeration
     */
    enum EscrowStatus {
        Pending,        // Payment received, waiting for completion
        Completed,      // Course completed, payment released
        Refunded,       // Payment refunded to student
        Disputed        // Payment is under dispute
    }

    /// @notice Mapping from (courseId, student) to escrow entry
    mapping(uint256 => mapping(address => EscrowEntry)) public escrows;
    /// @notice Total amount held in escrow across all entries
    uint256 public totalEscrowed;
    /// @notice Minimum escrow period before automatic release (in seconds)
    uint256 public minEscrowPeriod;
    /// @notice Maximum escrow period before dispute can be opened (in seconds)
    uint256 public maxEscrowPeriod;

    // Custom Errors
    /// @notice Thrown when course registry address is zero
    error InvalidCourseRegistry();
    /// @notice Thrown when escrow entry does not exist
    error EscrowNotFound();
    /// @notice Thrown when escrow is not in the expected status
    error InvalidEscrowStatus();
    /// @notice Thrown when amount is zero
    error InvalidAmount();
    /// @notice Thrown when payment transfer fails
    error PaymentTransferFailed();
    /// @notice Thrown when escrow period has not elapsed
    error EscrowPeriodNotElapsed();
    /// @notice Thrown when course is not completed
    error CourseNotCompleted();

    // Events
    /// @notice Emitted when payment is deposited into escrow
    /// @param courseId The course ID
    /// @param student The student making the payment
    /// @param amount The amount deposited
    event PaymentDeposited(
        uint256 indexed courseId,
        address indexed student,
        uint256 amount
    );

    /// @notice Emitted when payment is released to educator
    /// @param courseId The course ID
    /// @param student The student who paid
    /// @param educator The educator receiving payment
    /// @param amount The amount released
    event PaymentReleased(
        uint256 indexed courseId,
        address indexed student,
        address indexed educator,
        uint256 amount
    );

    /// @notice Emitted when payment is refunded to student
    /// @param courseId The course ID
    /// @param student The student receiving refund
    /// @param amount The amount refunded
    event PaymentRefunded(
        uint256 indexed courseId,
        address indexed student,
        uint256 amount
    );

    /// @notice Emitted when escrow status changes
    /// @param courseId The course ID
    /// @param student The student address
    /// @param oldStatus The previous status
    /// @param newStatus The new status
    event EscrowStatusChanged(
        uint256 indexed courseId,
        address indexed student,
        EscrowStatus oldStatus,
        EscrowStatus newStatus
    );

    /**
     * @notice Initializes the contract
     * @param _courseRegistry Address of the CourseRegistry contract
     * @param _minEscrowPeriod Minimum escrow period in seconds (default: 7 days)
     * @param _maxEscrowPeriod Maximum escrow period in seconds (default: 90 days)
     */
    constructor(
        address _courseRegistry,
        uint256 _minEscrowPeriod,
        uint256 _maxEscrowPeriod
    ) {
        if (_courseRegistry == address(0)) revert InvalidCourseRegistry();
        if (_minEscrowPeriod == 0 || _maxEscrowPeriod <= _minEscrowPeriod) {
            revert InvalidAmount();
        }

        courseRegistry = CourseRegistry(_courseRegistry);
        minEscrowPeriod = _minEscrowPeriod;
        maxEscrowPeriod = _maxEscrowPeriod;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISPUTE_RESOLVER_ROLE, msg.sender);
    }

    /**
     * @notice Deposits payment into escrow for a course enrollment
     * @dev Called when student enrolls. Payment is held until course completion or refund.
     * @param courseId The course ID
     * @param student The student making the payment
     */
    function depositPayment(uint256 courseId, address student)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        if (msg.value == 0) revert InvalidAmount();

        // Get course info - access public mapping fields
        (, , , address educator, , , , , , ) = courseRegistry.courses(courseId);
        if (educator == address(0)) revert EscrowNotFound();

        EscrowEntry storage entry = escrows[courseId][student];

        // If entry doesn't exist, create it
        if (entry.createdAt == 0) {
            entry.student = student;
            entry.educator = educator;
            entry.courseId = courseId;
            entry.amount = msg.value;
            entry.releasedAmount = 0;
            entry.refundedAmount = 0;
            entry.createdAt = block.timestamp;
            entry.status = EscrowStatus.Pending;
        } else {
            // Add to existing escrow
            entry.amount += msg.value;
            if (entry.status != EscrowStatus.Pending) {
                entry.status = EscrowStatus.Pending;
            }
        }

        totalEscrowed += msg.value;

        emit PaymentDeposited(courseId, student, msg.value);
    }

    /**
     * @notice Releases payment to educator upon course completion
     * @dev Can be called automatically or manually after course completion.
     *      Requires minimum escrow period to have elapsed.
     * @param courseId The course ID
     * @param student The student who paid
     */
    function releasePayment(uint256 courseId, address student)
        external
        whenNotPaused
        nonReentrant
    {
        EscrowEntry storage entry = escrows[courseId][student];
        if (entry.createdAt == 0) revert EscrowNotFound();
        if (entry.status != EscrowStatus.Pending) revert InvalidEscrowStatus();

        // Verify course is completed
        CourseRegistry.Enrollment memory enrollment = courseRegistry.getEnrollment(courseId, student);
        if (!enrollment.completed || enrollment.student == address(0)) {
            revert CourseNotCompleted();
        }

        // Check minimum escrow period
        if (block.timestamp < entry.createdAt + minEscrowPeriod) {
            revert EscrowPeriodNotElapsed();
        }

        uint256 releaseAmount = entry.amount - entry.releasedAmount - entry.refundedAmount;
        if (releaseAmount == 0) revert InvalidAmount();

        entry.releasedAmount += releaseAmount;
        entry.status = EscrowStatus.Completed;
        totalEscrowed -= releaseAmount;

        (bool success, ) = payable(entry.educator).call{value: releaseAmount}("");
        if (!success) revert PaymentTransferFailed();

        emit PaymentReleased(courseId, student, entry.educator, releaseAmount);
        emit EscrowStatusChanged(courseId, student, EscrowStatus.Pending, EscrowStatus.Completed);
    }

    /**
     * @notice Refunds payment to student
     * @dev Can be called by student or dispute resolver. Requires valid conditions.
     * @param courseId The course ID
     * @param student The student to refund
     */
    function refundPayment(uint256 courseId, address student)
        external
        whenNotPaused
        nonReentrant
    {
        EscrowEntry storage entry = escrows[courseId][student];
        if (entry.createdAt == 0) revert EscrowNotFound();
        if (entry.status == EscrowStatus.Refunded) revert InvalidEscrowStatus();

        // Only student or dispute resolver can refund
        bool canRefund = msg.sender == student || hasRole(DISPUTE_RESOLVER_ROLE, msg.sender);
        if (!canRefund) revert InvalidEscrowStatus();

        uint256 refundAmount = entry.amount - entry.releasedAmount - entry.refundedAmount;
        if (refundAmount == 0) revert InvalidAmount();

        EscrowStatus oldStatus = entry.status;
        entry.refundedAmount += refundAmount;
        entry.status = EscrowStatus.Refunded;
        totalEscrowed -= refundAmount;

        (bool success, ) = payable(student).call{value: refundAmount}("");
        if (!success) revert PaymentTransferFailed();

        emit PaymentRefunded(courseId, student, refundAmount);
        emit EscrowStatusChanged(courseId, student, oldStatus, EscrowStatus.Refunded);
    }

    /**
     * @notice Opens a dispute for an escrow entry
     * @dev Only student or educator can open disputes. Dispute resolver can resolve.
     * @param courseId The course ID
     * @param student The student address
     */
    function openDispute(uint256 courseId, address student)
        external
        whenNotPaused
    {
        EscrowEntry storage entry = escrows[courseId][student];
        if (entry.createdAt == 0) revert EscrowNotFound();
        if (entry.status != EscrowStatus.Pending) revert InvalidEscrowStatus();

        // Only student, educator, or dispute resolver can open dispute
        bool canDispute = msg.sender == student || 
                        msg.sender == entry.educator || 
                        hasRole(DISPUTE_RESOLVER_ROLE, msg.sender);
        if (!canDispute) revert InvalidEscrowStatus();

        EscrowStatus oldStatus = entry.status;
        entry.status = EscrowStatus.Disputed;

        emit EscrowStatusChanged(courseId, student, oldStatus, EscrowStatus.Disputed);
    }

    /**
     * @notice Resolves a dispute by releasing or refunding payment
     * @dev Only dispute resolver can resolve disputes
     * @param courseId The course ID
     * @param student The student address
     * @param releaseToEducator True to release to educator, false to refund to student
     */
    function resolveDispute(
        uint256 courseId,
        address student,
        bool releaseToEducator
    ) external onlyRole(DISPUTE_RESOLVER_ROLE) whenNotPaused nonReentrant {
        EscrowEntry storage entry = escrows[courseId][student];
        if (entry.createdAt == 0) revert EscrowNotFound();
        if (entry.status != EscrowStatus.Disputed) revert InvalidEscrowStatus();

        uint256 amount = entry.amount - entry.releasedAmount - entry.refundedAmount;
        if (amount == 0) revert InvalidAmount();

        if (releaseToEducator) {
            entry.releasedAmount += amount;
            entry.status = EscrowStatus.Completed;
            totalEscrowed -= amount;

            (bool success, ) = payable(entry.educator).call{value: amount}("");
            if (!success) revert PaymentTransferFailed();

            emit PaymentReleased(courseId, student, entry.educator, amount);
            emit EscrowStatusChanged(courseId, student, EscrowStatus.Disputed, EscrowStatus.Completed);
        } else {
            entry.refundedAmount += amount;
            entry.status = EscrowStatus.Refunded;
            totalEscrowed -= amount;

            (bool success, ) = payable(student).call{value: amount}("");
            if (!success) revert PaymentTransferFailed();

            emit PaymentRefunded(courseId, student, amount);
            emit EscrowStatusChanged(courseId, student, EscrowStatus.Disputed, EscrowStatus.Refunded);
        }
    }

    /**
     * @notice Gets escrow entry details
     * @param courseId The course ID
     * @param student The student address
     * @return entry The EscrowEntry struct
     */
    function getEscrow(uint256 courseId, address student)
        external
        view
        returns (EscrowEntry memory)
    {
        return escrows[courseId][student];
    }

    /**
     * @notice Updates escrow period settings
     * @dev Only admin can update
     * @param _minEscrowPeriod New minimum escrow period
     * @param _maxEscrowPeriod New maximum escrow period
     */
    function updateEscrowPeriods(
        uint256 _minEscrowPeriod,
        uint256 _maxEscrowPeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_minEscrowPeriod == 0 || _maxEscrowPeriod <= _minEscrowPeriod) {
            revert InvalidAmount();
        }
        minEscrowPeriod = _minEscrowPeriod;
        maxEscrowPeriod = _maxEscrowPeriod;
    }

    /**
     * @notice Pauses the contract
     * @dev Only admin can pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     * @dev Only admin can unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Allows contract to receive ETH
     */
    receive() external payable {
        // Allow contract to receive ETH for escrow deposits
    }
}

