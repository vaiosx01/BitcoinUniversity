import { expect } from "chai";
import { ethers } from "hardhat";
import { CourseRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { hashString, parseEther } from "./helpers";

describe("CourseRegistry", function () {
  let courseRegistry: CourseRegistry;
  let owner: SignerWithAddress;
  let educator: SignerWithAddress;
  let student: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const EDUCATOR_ROLE = hashString("EDUCATOR_ROLE");
  const ADMIN_ROLE = hashString("ADMIN_ROLE");

  beforeEach(async function () {
    [owner, educator, student, otherAccount] = await ethers.getSigners();

    const CourseRegistry = await ethers.getContractFactory("CourseRegistry");
    courseRegistry = (await CourseRegistry.deploy()) as unknown as CourseRegistry;
    await courseRegistry.waitForDeployment();

    // Grant educator role
    await courseRegistry.grantRole(EDUCATOR_ROLE, educator.address);
  });

  describe("Deployment", function () {
    it("Should set the right roles", async function () {
      expect(await courseRegistry.hasRole(await courseRegistry.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await courseRegistry.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await courseRegistry.hasRole(EDUCATOR_ROLE, owner.address)).to.be.true;
    });

    it("Should start with zero courses", async function () {
      expect(await courseRegistry.getTotalCourses()).to.equal(0);
    });
  });

  describe("Course Creation", function () {
    it("Should create a course successfully", async function () {
      const title = "Introduction to Blockchain";
      const description = "Learn the basics of blockchain technology";
      const duration = 30; // days
      const price = parseEther("0.1");
      const metadataURI = "ipfs://QmTest123";

      await expect(
        courseRegistry
          .connect(educator)
          .createCourse(title, description, duration, price, metadataURI)
      )
        .to.emit(courseRegistry, "CourseCreated")
        .withArgs(0, educator.address, title);

      const course = await courseRegistry.courses(0);
      expect(course.id).to.equal(0);
      expect(course.title).to.equal(title);
      expect(course.educator).to.equal(educator.address);
      expect(course.price).to.equal(price);
      expect(course.active).to.be.true;
    });

    it("Should not allow non-educators to create courses", async function () {
      await expect(
        courseRegistry
          .connect(student)
          .createCourse("Test", "Test", 30, parseEther("0.1"), "ipfs://test")
      ).to.be.revertedWithCustomError(courseRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should revert with empty title", async function () {
      await expect(
        courseRegistry
          .connect(educator)
          .createCourse("", "Description", 30, parseEther("0.1"), "ipfs://test")
      ).to.be.revertedWithCustomError(courseRegistry, "InvalidTitle");
    });

    it("Should revert with zero duration", async function () {
      await expect(
        courseRegistry
          .connect(educator)
          .createCourse("Title", "Description", 0, parseEther("0.1"), "ipfs://test")
      ).to.be.revertedWithCustomError(courseRegistry, "InvalidDuration");
    });

    it("Should increment course ID correctly", async function () {
      await courseRegistry
        .connect(educator)
        .createCourse("Course 1", "Desc", 30, parseEther("0.1"), "ipfs://1");

      await courseRegistry
        .connect(educator)
        .createCourse("Course 2", "Desc", 30, parseEther("0.1"), "ipfs://2");

      const course1 = await courseRegistry.courses(0);
      const course2 = await courseRegistry.courses(1);

      expect(course1.id).to.equal(0);
      expect(course2.id).to.equal(1);
      expect(await courseRegistry.getTotalCourses()).to.equal(2);
    });
  });

  describe("Student Enrollment", function () {
    let courseId: bigint;
    const price = parseEther("0.1");

    beforeEach(async function () {
      const tx = await courseRegistry
        .connect(educator)
        .createCourse("Test Course", "Description", 30, price, "ipfs://test");
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      courseId = courseRegistry.interface.parseLog(event!)?.args[0] || 0n;
    });

    it("Should enroll student with correct payment", async function () {
      await expect(
        courseRegistry
          .connect(student)
          .enrollStudent(courseId, { value: price })
      )
        .to.emit(courseRegistry, "StudentEnrolled")
        .withArgs(courseId, student.address, price);

      const enrollment = await courseRegistry.getEnrollment(courseId, student.address);
      expect(enrollment.student).to.equal(student.address);
      expect(enrollment.courseId).to.equal(courseId);
      expect(enrollment.completed).to.be.false;

      const course = await courseRegistry.courses(courseId);
      expect(course.enrollmentCount).to.equal(1);
    });

    it("Should not enroll with insufficient payment", async function () {
      await expect(
        courseRegistry
          .connect(student)
          .enrollStudent(courseId, { value: parseEther("0.05") })
      ).to.be.revertedWithCustomError(courseRegistry, "InsufficientPayment");
    });

    it("Should not enroll in inactive course", async function () {
      await courseRegistry.connect(educator).toggleCourseStatus(courseId);

      await expect(
        courseRegistry
          .connect(student)
          .enrollStudent(courseId, { value: price })
      ).to.be.revertedWithCustomError(courseRegistry, "CourseNotActive");
    });

    it("Should not allow duplicate enrollment", async function () {
      await courseRegistry
        .connect(student)
        .enrollStudent(courseId, { value: price });

      await expect(
        courseRegistry
          .connect(student)
          .enrollStudent(courseId, { value: price })
      ).to.be.revertedWithCustomError(courseRegistry, "AlreadyEnrolled");
    });

    it("Should transfer payment to educator", async function () {
      const educatorBalanceBefore = await ethers.provider.getBalance(educator.address);

      await courseRegistry
        .connect(student)
        .enrollStudent(courseId, { value: price });

      const educatorBalanceAfter = await ethers.provider.getBalance(educator.address);
      expect(educatorBalanceAfter - educatorBalanceBefore).to.equal(price);
    });

    it("Should track student enrollments", async function () {
      await courseRegistry
        .connect(student)
        .enrollStudent(courseId, { value: price });

      const enrollments = await courseRegistry.getStudentEnrollments(student.address);
      expect(enrollments.length).to.equal(1);
      expect(enrollments[0]).to.equal(courseId);
    });
  });

  describe("Course Completion", function () {
    let courseId: bigint;
    const price = parseEther("0.1");

    beforeEach(async function () {
      const tx = await courseRegistry
        .connect(educator)
        .createCourse("Test Course", "Description", 30, price, "ipfs://test");
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      courseId = courseRegistry.interface.parseLog(event!)?.args[0] || 0n;

      await courseRegistry
        .connect(student)
        .enrollStudent(courseId, { value: price });
    });

    it("Should complete course with valid grade", async function () {
      const grade = 85;

      await expect(
        courseRegistry
          .connect(educator)
          .completeCourse(courseId, student.address, grade)
      )
        .to.emit(courseRegistry, "CourseCompleted")
        .withArgs(courseId, student.address, grade);

      const enrollment = await courseRegistry.getEnrollment(courseId, student.address);
      expect(enrollment.completed).to.be.true;
      expect(enrollment.grade).to.equal(grade);
      expect(enrollment.completedAt).to.be.greaterThan(0);
    });

    it("Should not allow non-educators to complete courses", async function () {
      await expect(
        courseRegistry
          .connect(student)
          .completeCourse(courseId, student.address, 85)
      ).to.be.revertedWithCustomError(courseRegistry, "AccessControlUnauthorizedAccount");
    });

    it("Should revert with invalid grade (>100)", async function () {
      await expect(
        courseRegistry
          .connect(educator)
          .completeCourse(courseId, student.address, 101)
      ).to.be.revertedWithCustomError(courseRegistry, "InvalidGrade");
    });

    it("Should revert if student not enrolled", async function () {
      await expect(
        courseRegistry
          .connect(educator)
          .completeCourse(courseId, otherAccount.address, 85)
      ).to.be.revertedWithCustomError(courseRegistry, "NotEnrolled");
    });

    it("Should not allow completing already completed course", async function () {
      await courseRegistry
        .connect(educator)
        .completeCourse(courseId, student.address, 85);

      await expect(
        courseRegistry
          .connect(educator)
          .completeCourse(courseId, student.address, 90)
      ).to.be.revertedWithCustomError(courseRegistry, "AlreadyCompleted");
    });
  });

  describe("Course Status Management", function () {
    let courseId: bigint;

    beforeEach(async function () {
      const tx = await courseRegistry
        .connect(educator)
        .createCourse("Test Course", "Description", 30, parseEther("0.1"), "ipfs://test");
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      courseId = courseRegistry.interface.parseLog(event!)?.args[0] || 0n;
    });

    it("Should toggle course status", async function () {
      let course = await courseRegistry.courses(courseId);
      expect(course.active).to.be.true;

      await expect(
        courseRegistry.connect(educator).toggleCourseStatus(courseId)
      )
        .to.emit(courseRegistry, "CourseUpdated")
        .withArgs(courseId);

      course = await courseRegistry.courses(courseId);
      expect(course.active).to.be.false;

      await courseRegistry.connect(educator).toggleCourseStatus(courseId);
      course = await courseRegistry.courses(courseId);
      expect(course.active).to.be.true;
    });

    it("Should not allow non-educators to toggle status", async function () {
      await expect(
        courseRegistry.connect(student).toggleCourseStatus(courseId)
      ).to.be.revertedWithCustomError(courseRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause contract", async function () {
      await courseRegistry.connect(owner).pause();
      expect(await courseRegistry.paused()).to.be.true;

      await courseRegistry.connect(owner).unpause();
      expect(await courseRegistry.paused()).to.be.false;
    });

    it("Should not allow operations when paused", async function () {
      await courseRegistry.connect(owner).pause();

      await expect(
        courseRegistry
          .connect(educator)
          .createCourse("Test", "Desc", 30, parseEther("0.1"), "ipfs://test")
      ).to.be.revertedWithCustomError(courseRegistry, "EnforcedPause");
    });

    it("Should not allow non-admins to pause", async function () {
      await expect(
        courseRegistry.connect(educator).pause()
      ).to.be.revertedWithCustomError(courseRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple enrollments correctly", async function () {
      const price = parseEther("0.1");
      const tx = await courseRegistry
        .connect(educator)
        .createCourse("Test Course", "Description", 30, price, "ipfs://test");
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      const courseId = courseRegistry.interface.parseLog(event!)?.args[0] || 0n;

      // Enroll multiple students
      const students = [student, otherAccount];
      for (let i = 0; i < students.length; i++) {
        await courseRegistry
          .connect(students[i])
          .enrollStudent(courseId, { value: price });
      }

      const course = await courseRegistry.courses(courseId);
      expect(course.enrollmentCount).to.equal(2);
    });

    it("Should return empty array for student with no enrollments", async function () {
      const enrollments = await courseRegistry.getStudentEnrollments(student.address);
      expect(enrollments.length).to.equal(0);
    });
  });
});

