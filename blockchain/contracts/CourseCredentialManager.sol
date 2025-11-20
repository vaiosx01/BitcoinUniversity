// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CourseRegistry.sol";
import "./CredentialNFT.sol";

/**
 * @title CourseCredentialManager
 * @author Bitcoin University
 * @notice Manages the automatic issuance of credentials upon course completion
 * @dev This contract acts as a bridge between CourseRegistry and CredentialNFT,
 *      automatically issuing credentials when students complete courses with passing grades.
 */
contract CourseCredentialManager is AccessControl, Pausable, ReentrancyGuard {
    /// @notice Role identifier for addresses that can manage credential issuance rules
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /// @notice Reference to the CourseRegistry contract
    CourseRegistry public immutable courseRegistry;
    /// @notice Reference to the CredentialNFT contract
    CredentialNFT public immutable credentialNFT;

    /**
     * @notice Configuration for automatic credential issuance per course
     * @dev Maps courseId to credential issuance configuration
     */
    struct CredentialConfig {
        bool enabled;                  // Whether automatic issuance is enabled
        uint8 minimumGrade;            // Minimum grade required to receive credential (0-100)
        string credentialType;         // Type of credential to issue
        string field;                  // Field of study for the credential
        uint256 expirationDays;        // Days until credential expires (0 for non-expiring)
    }

    /// @notice Mapping from course ID to credential configuration
    mapping(uint256 => CredentialConfig) public credentialConfigs;
    /// @notice Mapping from (courseId, student) to issued credential token ID
    /// @dev Uses 0 as sentinel value - if tokenId is 0, check if it's actually issued via NFT contract
    mapping(uint256 => mapping(address => uint256)) public issuedCredentials;
    
    /// @notice Mapping to track if a credential has been issued (to handle tokenId 0 case)
    mapping(uint256 => mapping(address => bool)) private _hasIssuedCredential;

    // Custom Errors
    /// @notice Thrown when course registry address is zero
    error InvalidCourseRegistry();
    /// @notice Thrown when credential NFT address is zero
    error InvalidCredentialNFT();
    /// @notice Thrown when credential config does not exist
    error CredentialConfigNotFound();
    /// @notice Thrown when automatic issuance is not enabled for course
    error AutoIssuanceDisabled();
    /// @notice Thrown when student grade is below minimum required
    error GradeTooLow();
    /// @notice Thrown when credential already issued for this course-student pair
    error CredentialAlreadyIssued();
    /// @notice Thrown when course is not completed
    error CourseNotCompleted();

    // Events
    /// @notice Emitted when a credential is automatically issued upon course completion
    /// @param courseId The course ID that was completed
    /// @param student The student who completed the course
    /// @param tokenId The credential token ID that was issued
    /// @param grade The grade received in the course
    event CredentialAutoIssued(
        uint256 indexed courseId,
        address indexed student,
        uint256 indexed tokenId,
        uint8 grade
    );

    /// @notice Emitted when credential configuration is updated for a course
    /// @param courseId The course ID
    /// @param enabled Whether automatic issuance is enabled
    /// @param minimumGrade The minimum grade required
    event CredentialConfigUpdated(
        uint256 indexed courseId,
        bool enabled,
        uint8 minimumGrade
    );

    /**
     * @notice Initializes the contract with required addresses
     * @param _courseRegistry Address of the CourseRegistry contract
     * @param _credentialNFT Address of the CredentialNFT contract
     */
    constructor(address _courseRegistry, address _credentialNFT) {
        if (_courseRegistry == address(0)) revert InvalidCourseRegistry();
        if (_credentialNFT == address(0)) revert InvalidCredentialNFT();

        courseRegistry = CourseRegistry(_courseRegistry);
        credentialNFT = CredentialNFT(_credentialNFT);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    /**
     * @notice Sets or updates credential configuration for a course
     * @dev Only managers can configure credential issuance rules
     * @param courseId The course ID to configure
     * @param enabled Whether automatic issuance is enabled
     * @param minimumGrade Minimum grade required (0-100)
     * @param credentialType Type of credential to issue
     * @param field Field of study
     * @param expirationDays Days until expiration (0 for non-expiring)
     */
    function setCredentialConfig(
        uint256 courseId,
        bool enabled,
        uint8 minimumGrade,
        string memory credentialType,
        string memory field,
        uint256 expirationDays
    ) external onlyRole(MANAGER_ROLE) {
        if (minimumGrade > 100) revert GradeTooLow();

        credentialConfigs[courseId] = CredentialConfig({
            enabled: enabled,
            minimumGrade: minimumGrade,
            credentialType: credentialType,
            field: field,
            expirationDays: expirationDays
        });

        emit CredentialConfigUpdated(courseId, enabled, minimumGrade);
    }

    /**
     * @notice Automatically issues a credential when a course is completed
     * @dev Can be called by anyone, but typically called by CourseRegistry upon completion.
     *      Checks if student passed and credential config exists.
     * @param courseId The course ID that was completed
     * @param student The student who completed the course
     * @param grade The grade received (0-100)
     * @param tokenURI IPFS URI for credential metadata
     * @param metadataHash Hash of credential metadata
     * @return tokenId The credential token ID that was issued
     */
    function issueCredentialOnCompletion(
        uint256 courseId,
        address student,
        uint8 grade,
        string memory tokenURI,
        bytes32 metadataHash
    ) external whenNotPaused nonReentrant returns (uint256) {
        // Verify course is completed
        CourseRegistry.Enrollment memory enrollment = courseRegistry.getEnrollment(courseId, student);
        
        if (enrollment.student == address(0)) revert CourseNotCompleted();
        if (!enrollment.completed) revert CourseNotCompleted();
        if (enrollment.grade != grade) revert GradeTooLow(); // Verify grade matches

        // Check if credential already issued
        if (_hasIssuedCredential[courseId][student]) {
            revert CredentialAlreadyIssued();
        }

        // Get credential configuration
        CredentialConfig memory config = credentialConfigs[courseId];
        if (!config.enabled) revert AutoIssuanceDisabled();
        if (grade < config.minimumGrade) revert GradeTooLow();

        // Calculate expiration
        uint256 expiresAt = config.expirationDays == 0 
            ? 0 
            : block.timestamp + (config.expirationDays * 1 days);

        // Issue credential
        uint256 tokenId = credentialNFT.issueCredential(
            student,
            config.credentialType,
            config.field,
            tokenURI,
            metadataHash,
            expiresAt
        );

        // Record issuance
        issuedCredentials[courseId][student] = tokenId;
        _hasIssuedCredential[courseId][student] = true;

        emit CredentialAutoIssued(courseId, student, tokenId, grade);

        return tokenId;
    }

    /**
     * @notice Gets the credential token ID issued for a course-student pair
     * @param courseId The course ID
     * @param student The student address
     * @return tokenId The credential token ID (0 if not issued)
     */
    function getIssuedCredential(uint256 courseId, address student)
        external
        view
        returns (uint256)
    {
        return issuedCredentials[courseId][student];
    }

    /**
     * @notice Gets credential configuration for a course
     * @param courseId The course ID
     * @return config The CredentialConfig struct
     */
    function getCredentialConfig(uint256 courseId)
        external
        view
        returns (CredentialConfig memory)
    {
        return credentialConfigs[courseId];
    }

    /**
     * @notice Pauses the contract, disabling credential issuance
     * @dev Only admins can pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract, re-enabling credential issuance
     * @dev Only admins can unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

