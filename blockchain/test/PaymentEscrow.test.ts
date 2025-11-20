import { expect } from "chai";
import { ethers } from "hardhat";
import { CourseRegistry, PaymentEscrow } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { hashString, parseEther } from "./helpers";

describe("PaymentEscrow", function () {
  let courseRegistry: CourseRegistry;
  let paymentEscrow: PaymentEscrow;
  let owner: SignerWithAddress;
  let educator: SignerWithAddress;
  let student: SignerWithAddress;
  let resolver: SignerWithAddress;

  const EDUCATOR_ROLE = hashString("EDUCATOR_ROLE");
  const DISPUTE_RESOLVER_ROLE = hashString("DISPUTE_RESOLVER_ROLE");

  const MIN_ESCROW_PERIOD = 7 * 24 * 60 * 60; // 7 days
  const MAX_ESCROW_PERIOD = 90 * 24 * 60 * 60; // 90 days

  beforeEach(async function () {
    [owner, educator, student, resolver] = await ethers.getSigners();

    // Deploy CourseRegistry
    const CourseRegistry = await ethers.getContractFactory("CourseRegistry");
    courseRegistry = (await CourseRegistry.deploy()) as unknown as CourseRegistry;
    await courseRegistry.waitForDeployment();

    // Deploy PaymentEscrow
    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = (await PaymentEscrow.deploy(
      await courseRegistry.getAddress(),
      MIN_ESCROW_PERIOD,
      MAX_ESCROW_PERIOD
    )) as unknown as PaymentEscrow;
    await paymentEscrow.waitForDeployment();

    // Setup roles
    await courseRegistry.grantRole(EDUCATOR_ROLE, educator.address);
    await paymentEscrow.grantRole(DISPUTE_RESOLVER_ROLE, resolver.address);
  });

  describe("Deployment", function () {
    it("Should set correct course registry", async function () {
      expect(await paymentEscrow.courseRegistry()).to.equal(await courseRegistry.getAddress());
    });

    it("Should set correct escrow periods", async function () {
      expect(await paymentEscrow.minEscrowPeriod()).to.equal(MIN_ESCROW_PERIOD);
      expect(await paymentEscrow.maxEscrowPeriod()).to.equal(MAX_ESCROW_PERIOD);
    });
  });

  describe("Payment Deposit", function () {
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

    it("Should deposit payment into escrow", async function () {
      await expect(
        paymentEscrow
          .connect(student)
          .depositPayment(courseId, student.address, { value: price })
      )
        .to.emit(paymentEscrow, "PaymentDeposited")
        .withArgs(courseId, student.address, price);

      const escrow = await paymentEscrow.getEscrow(courseId, student.address);
      expect(escrow.student).to.equal(student.address);
      expect(escrow.amount).to.equal(price);
      expect(escrow.status).to.equal(0); // Pending
    });

    it("Should allow additional deposits", async function () {
      await paymentEscrow
        .connect(student)
        .depositPayment(courseId, student.address, { value: price });

      const additionalAmount = parseEther("0.05");
      await paymentEscrow
        .connect(student)
        .depositPayment(courseId, student.address, { value: additionalAmount });

      const escrow = await paymentEscrow.getEscrow(courseId, student.address);
      expect(escrow.amount).to.equal(price + additionalAmount);
    });

    it("Should update total escrowed", async function () {
      await paymentEscrow
        .connect(student)
        .depositPayment(courseId, student.address, { value: price });

      expect(await paymentEscrow.totalEscrowed()).to.equal(price);
    });
  });

  describe("Payment Release", function () {
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

      // Deposit payment into escrow
      await paymentEscrow
        .connect(student)
        .depositPayment(courseId, student.address, { value: price });

      // Enroll student in the course (separate from escrow)
      await courseRegistry
        .connect(student)
        .enrollStudent(courseId, { value: price });
    });

    it("Should release payment after completion and min period", async function () {
      // Complete course
      await courseRegistry
        .connect(educator)
        .completeCourse(courseId, student.address, 85);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [MIN_ESCROW_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      const educatorBalanceBefore = await ethers.provider.getBalance(educator.address);

      await expect(
        paymentEscrow
          .connect(educator)
          .releasePayment(courseId, student.address)
      )
        .to.emit(paymentEscrow, "PaymentReleased")
        .withArgs(courseId, student.address, educator.address, price);

      const educatorBalanceAfter = await ethers.provider.getBalance(educator.address);
      // Account for gas costs - balance should increase by at least the price minus small gas fee
      const balanceIncrease = educatorBalanceAfter - educatorBalanceBefore;
      expect(balanceIncrease).to.be.at.least(price - parseEther("0.001"));

      const escrow = await paymentEscrow.getEscrow(courseId, student.address);
      expect(escrow.status).to.equal(1); // Completed
      expect(escrow.releasedAmount).to.equal(price);
    });

    it("Should not release before min period", async function () {
      await courseRegistry
        .connect(educator)
        .completeCourse(courseId, student.address, 85);

      await expect(
        paymentEscrow
          .connect(educator)
          .releasePayment(courseId, student.address)
      ).to.be.revertedWithCustomError(paymentEscrow, "EscrowPeriodNotElapsed");
    });

    it("Should not release if course not completed", async function () {
      await ethers.provider.send("evm_increaseTime", [MIN_ESCROW_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        paymentEscrow
          .connect(educator)
          .releasePayment(courseId, student.address)
      ).to.be.revertedWithCustomError(paymentEscrow, "CourseNotCompleted");
    });
  });

  describe("Payment Refund", function () {
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

      await paymentEscrow
        .connect(student)
        .depositPayment(courseId, student.address, { value: price });
    });

    it("Should refund to student", async function () {
      const studentBalanceBefore = await ethers.provider.getBalance(student.address);

      await expect(
        paymentEscrow
          .connect(student)
          .refundPayment(courseId, student.address)
      )
        .to.emit(paymentEscrow, "PaymentRefunded")
        .withArgs(courseId, student.address, price);

      const studentBalanceAfter = await ethers.provider.getBalance(student.address);
      // Account for gas, so check it's close
      expect(studentBalanceAfter).to.be.greaterThan(studentBalanceBefore);

      const escrow = await paymentEscrow.getEscrow(courseId, student.address);
      expect(escrow.status).to.equal(2); // Refunded
    });

    it("Should allow dispute resolver to refund", async function () {
      await expect(
        paymentEscrow
          .connect(resolver)
          .refundPayment(courseId, student.address)
      )
        .to.emit(paymentEscrow, "PaymentRefunded")
        .withArgs(courseId, student.address, price);
    });
  });

  describe("Dispute Resolution", function () {
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

      await paymentEscrow
        .connect(student)
        .depositPayment(courseId, student.address, { value: price });
    });

    it("Should open dispute", async function () {
      await expect(
        paymentEscrow
          .connect(student)
          .openDispute(courseId, student.address)
      )
        .to.emit(paymentEscrow, "EscrowStatusChanged")
        .withArgs(courseId, student.address, 0, 3); // Pending to Disputed

      const escrow = await paymentEscrow.getEscrow(courseId, student.address);
      expect(escrow.status).to.equal(3); // Disputed
    });

    it("Should resolve dispute by releasing to educator", async function () {
      await paymentEscrow
        .connect(student)
        .openDispute(courseId, student.address);

      const educatorBalanceBefore = await ethers.provider.getBalance(educator.address);

      await expect(
        paymentEscrow
          .connect(resolver)
          .resolveDispute(courseId, student.address, true)
      )
        .to.emit(paymentEscrow, "PaymentReleased")
        .withArgs(courseId, student.address, educator.address, price);

      const educatorBalanceAfter = await ethers.provider.getBalance(educator.address);
      // Account for gas costs - balance should increase by at least the price minus small gas fee
      const balanceIncrease = educatorBalanceAfter - educatorBalanceBefore;
      expect(balanceIncrease).to.be.at.least(price - parseEther("0.001"));
    });

    it("Should resolve dispute by refunding to student", async function () {
      await paymentEscrow
        .connect(student)
        .openDispute(courseId, student.address);

      await expect(
        paymentEscrow
          .connect(resolver)
          .resolveDispute(courseId, student.address, false)
      )
        .to.emit(paymentEscrow, "PaymentRefunded")
        .withArgs(courseId, student.address, price);
    });

    it("Should not allow non-resolver to resolve", async function () {
      await paymentEscrow
        .connect(student)
        .openDispute(courseId, student.address);

      await expect(
        paymentEscrow
          .connect(educator)
          .resolveDispute(courseId, student.address, true)
      ).to.be.revertedWithCustomError(paymentEscrow, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause", async function () {
      await paymentEscrow.connect(owner).pause();
      expect(await paymentEscrow.paused()).to.be.true;

      await paymentEscrow.connect(owner).unpause();
      expect(await paymentEscrow.paused()).to.be.false;
    });
  });
});

