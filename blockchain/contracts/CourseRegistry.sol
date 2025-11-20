// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CourseRegistry
 * @author Bitcoin University
 * @notice Manages course listings, enrollments, and completion tracking on-chain
 * @dev This contract handles the full lifecycle of educational courses including
 *      creation, enrollment, payment processing, and completion tracking.
 *      Uses AccessControl for role-based permissions and ReentrancyGuard for security.
 */
contract CourseRegistry is AccessControl, Pausable, ReentrancyGuard {
    /// @notice Role identifier for educators who can create and manage courses
    bytes32 public constant EDUCATOR_ROLE = keccak256("EDUCATOR_ROLE");
    /// @notice Role identifier for administrators with elevated permissions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Counter for generating unique course IDs
    uint256 private _nextCourseId;

    // Custom Errors - More gas efficient than require strings
    /// @notice Thrown when attempting to create a course with invalid title
    error InvalidTitle();
    /// @notice Thrown when duration is zero or invalid
    error InvalidDuration();
    /// @notice Thrown when course is not active
    error CourseNotActive();
    /// @notice Thrown when payment amount is insufficient
    error InsufficientPayment();
    /// @notice Thrown when student is already enrolled
    error AlreadyEnrolled();
    /// @notice Thrown when course does not exist
    error CourseNotFound();
    /// @notice Thrown when grade is invalid (must be 0-100)
    error InvalidGrade();
    /// @notice Thrown when student is not enrolled
    error NotEnrolled();
    /// @notice Thrown when course is already completed
    error AlreadyCompleted();
    /// @notice Thrown when payment transfer fails
    error PaymentTransferFailed();

    /**
     * @notice Course structure storing all course information
     * @dev Packed efficiently to minimize storage costs
     */
    struct Course {
        uint256 id;                    // Course unique identifier
        string title;                  // Course title
        string description;            // Course description
        address educator;              // Address of the course educator
        uint256 duration;              // Course duration in days
        uint256 price;                 // Course price in wei
        bool active;                   // Whether the course is currently active
        string metadataURI;            // IPFS URI to full course metadata
        uint256 createdAt;             // Timestamp when course was created
        uint256 enrollmentCount;       // Total number of enrollments
    }

    /**
     * @notice Enrollment structure tracking student progress
     * @dev Stores enrollment and completion data for each student-course pair
     */
    struct Enrollment {
        address student;               // Address of enrolled student
        uint256 courseId;              // ID of the enrolled course
        uint256 enrolledAt;            // Timestamp of enrollment
        uint256 completedAt;           // Timestamp of completion (0 if not completed)
        bool completed;                // Whether the course has been completed
        uint8 grade;                   // Final grade (0-100)
    }

    // Storage Mappings
    /// @notice Mapping from course ID to Course struct
    mapping(uint256 => Course) public courses;
    /// @notice Mapping from (courseId, student) to Enrollment struct
    mapping(uint256 => mapping(address => Enrollment)) public enrollments;
    /// @notice Mapping from student address to array of enrolled course IDs
    mapping(address => uint256[]) private _studentEnrollments;

    // Events
    /// @notice Emitted when a new course is created
    /// @param courseId The unique identifier of the created course
    /// @param educator The address of the educator who created the course
    /// @param title The title of the course
    event CourseCreated(uint256 indexed courseId, address indexed educator, string title);
    
    /// @notice Emitted when a course is updated (status change, etc.)
    /// @param courseId The unique identifier of the updated course
    event CourseUpdated(uint256 indexed courseId);
    
    /// @notice Emitted when a student enrolls in a course
    /// @param courseId The unique identifier of the course
    /// @param student The address of the enrolled student
    /// @param amount The amount paid for enrollment
    event StudentEnrolled(uint256 indexed courseId, address indexed student, uint256 amount);
    
    /// @notice Emitted when a student completes a course
    /// @param courseId The unique identifier of the completed course
    /// @param student The address of the student who completed the course
    /// @param grade The final grade received (0-100)
    event CourseCompleted(uint256 indexed courseId, address indexed student, uint8 grade);

    /**
     * @notice Initializes the contract with default admin roles
     * @dev Grants DEFAULT_ADMIN_ROLE, ADMIN_ROLE, and EDUCATOR_ROLE to deployer
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EDUCATOR_ROLE, msg.sender);
    }

    /**
     * @notice Creates a new course
     * @dev Only educators can create courses. Course must have valid title and duration.
     * @param title The title of the course (must be non-empty)
     * @param description A detailed description of the course
     * @param duration The duration of the course in days (must be > 0)
     * @param price The price of the course in wei
     * @param metadataURI IPFS URI containing additional course metadata
     * @return courseId The unique identifier of the newly created course
     */
    function createCourse(
        string memory title,
        string memory description,
        uint256 duration,
        uint256 price,
        string memory metadataURI
    ) external onlyRole(EDUCATOR_ROLE) whenNotPaused returns (uint256) {
        if (bytes(title).length == 0) revert InvalidTitle();
        if (duration == 0) revert InvalidDuration();

        uint256 courseId = _nextCourseId++;
        courses[courseId] = Course({
            id: courseId,
            title: title,
            description: description,
            educator: msg.sender,
            duration: duration,
            price: price,
            active: true,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            enrollmentCount: 0
        });

        emit CourseCreated(courseId, msg.sender, title);
        return courseId;
    }

    /**
     * @notice Enrolls the caller in a course
     * @dev Student must send sufficient payment. Course must be active and student must not be already enrolled.
     *      Uses checks-effects-interactions pattern and safe payment transfer.
     * @param courseId The unique identifier of the course to enroll in
     */
    function enrollStudent(uint256 courseId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant
    {
        Course storage course = courses[courseId];
        
        // Validate course exists
        if (course.educator == address(0)) revert CourseNotFound();
        if (!course.active) revert CourseNotActive();
        if (msg.value < course.price) revert InsufficientPayment();
        if (enrollments[courseId][msg.sender].student != address(0)) revert AlreadyEnrolled();

        // Effects: Update state before external calls
        enrollments[courseId][msg.sender] = Enrollment({
            student: msg.sender,
            courseId: courseId,
            enrolledAt: block.timestamp,
            completedAt: 0,
            completed: false,
            grade: 0
        });

        _studentEnrollments[msg.sender].push(courseId);
        course.enrollmentCount++;

        // Interactions: Transfer payment to educator (using call for better security)
        (bool success, ) = payable(course.educator).call{value: msg.value}("");
        if (!success) revert PaymentTransferFailed();

        emit StudentEnrolled(courseId, msg.sender, msg.value);
    }

    /**
     * @notice Marks a course as completed for a student
     * @dev Only educators can mark courses as completed. Student must be enrolled and not already completed.
     * @param courseId The unique identifier of the course
     * @param student The address of the student who completed the course
     * @param grade The final grade (0-100)
     */
    function completeCourse(
        uint256 courseId,
        address student,
        uint8 grade
    ) external onlyRole(EDUCATOR_ROLE) {
        if (grade > 100) revert InvalidGrade();
        
        Enrollment storage enrollment = enrollments[courseId][student];
        if (enrollment.student == address(0)) revert NotEnrolled();
        if (enrollment.completed) revert AlreadyCompleted();

        enrollment.completed = true;
        enrollment.completedAt = block.timestamp;
        enrollment.grade = grade;

        emit CourseCompleted(courseId, student, grade);
    }

    /**
     * @notice Gets all course IDs a student is enrolled in
     * @param student The address of the student
     * @return Array of course IDs the student is enrolled in
     */
    function getStudentEnrollments(address student) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return _studentEnrollments[student];
    }

    /**
     * @notice Gets enrollment details for a specific student-course pair
     * @param courseId The unique identifier of the course
     * @param student The address of the student
     * @return enrollment The enrollment struct containing all enrollment data
     */
    function getEnrollment(uint256 courseId, address student)
        external
        view
        returns (Enrollment memory)
    {
        return enrollments[courseId][student];
    }

    /**
     * @notice Gets the total number of courses created
     * @return The total number of courses
     */
    function getTotalCourses() external view returns (uint256) {
        return _nextCourseId;
    }

    /**
     * @notice Toggles the active status of a course
     * @dev Only the course educator can toggle the status
     * @param courseId The unique identifier of the course
     */
    function toggleCourseStatus(uint256 courseId) 
        external 
        onlyRole(EDUCATOR_ROLE) 
    {
        if (courses[courseId].educator == address(0)) revert CourseNotFound();
        courses[courseId].active = !courses[courseId].active;
        emit CourseUpdated(courseId);
    }

    /**
     * @notice Pauses the contract, disabling most functionality
     * @dev Only admins can pause the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract, re-enabling functionality
     * @dev Only admins can unpause the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}

