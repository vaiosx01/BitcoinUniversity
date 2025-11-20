import { expect } from "chai";
import { ethers } from "hardhat";
import { CourseRegistry, CredentialNFT, CourseCredentialManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { hashString, parseEther } from "./helpers";

describe("CourseCredentialManager", function () {
  let courseRegistry: CourseRegistry;
  let credentialNFT: CredentialNFT;
  let credentialManager: CourseCredentialManager;
  let owner: SignerWithAddress;
  let educator: SignerWithAddress;
  let student: SignerWithAddress;
  let manager: SignerWithAddress;

  // Calculate role hashes - same as in contracts
  const EDUCATOR_ROLE = hashString("EDUCATOR_ROLE");
  const ISSUER_ROLE = hashString("ISSUER_ROLE");
  const MANAGER_ROLE = hashString("MANAGER_ROLE");

  beforeEach(async function () {
    [owner, educator, student, manager] = await ethers.getSigners();

    // Deploy CredentialNFT
    const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
    credentialNFT = (await CredentialNFT.deploy()) as unknown as CredentialNFT;
    await credentialNFT.waitForDeployment();

    // Deploy CourseRegistry
    const CourseRegistry = await ethers.getContractFactory("CourseRegistry");
    courseRegistry = (await CourseRegistry.deploy()) as unknown as CourseRegistry;
    await courseRegistry.waitForDeployment();

    // Deploy CourseCredentialManager
    const CourseCredentialManager = await ethers.getContractFactory("CourseCredentialManager");
    credentialManager = (await CourseCredentialManager.deploy(
      await courseRegistry.getAddress(),
      await credentialNFT.getAddress()
    )) as unknown as CourseCredentialManager;
    await credentialManager.waitForDeployment();

    // Setup roles
    await courseRegistry.grantRole(EDUCATOR_ROLE, educator.address);
    await credentialNFT.grantRole(ISSUER_ROLE, await credentialManager.getAddress());
    await credentialManager.grantRole(MANAGER_ROLE, manager.address);
  });

  describe("Deployment", function () {
    it("Should set correct contract addresses", async function () {
      expect(await credentialManager.courseRegistry()).to.equal(await courseRegistry.getAddress());
      expect(await credentialManager.credentialNFT()).to.equal(await credentialNFT.getAddress());
    });

    it("Should grant manager role to deployer", async function () {
      expect(await credentialManager.hasRole(await credentialManager.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await credentialManager.hasRole(MANAGER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Credential Configuration", function () {
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

    it("Should set credential configuration", async function () {
      await expect(
        credentialManager
          .connect(manager)
          .setCredentialConfig(
            courseId,
            true,
            70, // minimum grade
            "Certificate",
            "Blockchain",
            365 // expiration days
          )
      )
        .to.emit(credentialManager, "CredentialConfigUpdated")
        .withArgs(courseId, true, 70);

      const config = await credentialManager.getCredentialConfig(courseId);
      expect(config.enabled).to.be.true;
      expect(config.minimumGrade).to.equal(70);
      expect(config.credentialType).to.equal("Certificate");
      expect(config.field).to.equal("Blockchain");
      expect(config.expirationDays).to.equal(365);
    });

    it("Should not allow non-managers to set config", async function () {
      await expect(
        credentialManager
          .connect(educator)
          .setCredentialConfig(courseId, true, 70, "Certificate", "Blockchain", 365)
      ).to.be.revertedWithCustomError(credentialManager, "AccessControlUnauthorizedAccount");
    });

    it("Should allow updating configuration", async function () {
      await credentialManager
        .connect(manager)
        .setCredentialConfig(courseId, true, 70, "Certificate", "Blockchain", 365);

      await credentialManager
        .connect(manager)
        .setCredentialConfig(courseId, false, 80, "Diploma", "Computer Science", 0);

      const config = await credentialManager.getCredentialConfig(courseId);
      expect(config.enabled).to.be.false;
      expect(config.minimumGrade).to.equal(80);
      expect(config.credentialType).to.equal("Diploma");
    });
  });

  describe("Automatic Credential Issuance", function () {
    let courseId: bigint;
    const price = parseEther("0.1");

    beforeEach(async function () {
      // Create course
      const tx = await courseRegistry
        .connect(educator)
        .createCourse("Test Course", "Description", 30, price, "ipfs://test");
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      courseId = courseRegistry.interface.parseLog(event!)?.args[0] || 0n;

      // Configure credential
      await credentialManager
        .connect(manager)
        .setCredentialConfig(
          courseId,
          true,
          70,
          "Certificate",
          "Blockchain",
          0 // non-expiring
        );

      // Enroll student
      await courseRegistry
        .connect(student)
        .enrollStudent(courseId, { value: price });

      // Complete course
      await courseRegistry
        .connect(educator)
        .completeCourse(courseId, student.address, 85);
    });

    it("Should issue credential automatically on completion", async function () {
      const tokenURI = "ipfs://credential123";
      const metadataHash = hashString("metadata");

      await expect(
        credentialManager
          .connect(manager)
          .issueCredentialOnCompletion(
            courseId,
            student.address,
            85,
            tokenURI,
            metadataHash
          )
      )
        .to.emit(credentialManager, "CredentialAutoIssued")
        .withArgs(courseId, student.address, 0n, 85);

      const tokenId = await credentialManager.getIssuedCredential(courseId, student.address);
      expect(tokenId).to.equal(0);

      const credential = await credentialNFT.getCredential(tokenId);
      expect(credential.credentialType).to.equal("Certificate");
      expect(credential.field).to.equal("Blockchain");
      expect(credential.recipient).to.equal(student.address);
    });

    it("Should not issue if grade below minimum", async function () {
      // Create a new course and enroll a different student for this test
      const tx2 = await courseRegistry
        .connect(educator)
        .createCourse("Course 2", "Desc", 30, parseEther("0.1"), "ipfs://test2");
      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      const courseId2 = courseRegistry.interface.parseLog(event2!)?.args[0] || 0n;

      await credentialManager
        .connect(manager)
        .setCredentialConfig(courseId2, true, 70, "Certificate", "Blockchain", 0);

      // Enroll and complete with low grade
      await courseRegistry
        .connect(student)
        .enrollStudent(courseId2, { value: parseEther("0.1") });

      await courseRegistry
        .connect(educator)
        .completeCourse(courseId2, student.address, 65);

      const tokenURI = "ipfs://credential123";
      const metadataHash = hashString("metadata");

      await expect(
        credentialManager
          .issueCredentialOnCompletion(courseId2, student.address, 65, tokenURI, metadataHash)
      ).to.be.revertedWithCustomError(credentialManager, "GradeTooLow");
    });

    it("Should not issue if auto-issuance disabled", async function () {
      await credentialManager
        .connect(manager)
        .setCredentialConfig(courseId, false, 70, "Certificate", "Blockchain", 0);

      const tokenURI = "ipfs://credential123";
      const metadataHash = hashString("metadata");

      await expect(
        credentialManager
          .issueCredentialOnCompletion(courseId, student.address, 85, tokenURI, metadataHash)
      ).to.be.revertedWithCustomError(credentialManager, "AutoIssuanceDisabled");
    });

    it("Should not allow duplicate credential issuance", async function () {
      const tokenURI = "ipfs://credential123";
      const metadataHash = hashString("metadata");

      // Issue first credential
      const tx = await credentialManager
        .issueCredentialOnCompletion(courseId, student.address, 85, tokenURI, metadataHash);
      const receipt = await tx.wait();
      
      // Get tokenId from event
      const event = receipt?.logs.find(
        (log: any) => {
          try {
            const parsed = credentialManager.interface.parseLog(log);
            return parsed?.name === "CredentialAutoIssued";
          } catch {
            return false;
          }
        }
      );
      
      let issuedTokenId = 0n;
      if (event) {
        const parsed = credentialManager.interface.parseLog(event);
        issuedTokenId = parsed?.args[2] || 0n; // tokenId is the third argument
      }
      
      // Verify tokenId was stored (tokenId 0 is valid for first credential)
      const storedTokenId = await credentialManager.getIssuedCredential(courseId, student.address);
      expect(storedTokenId).to.equal(issuedTokenId);

      // Try to issue again - should fail
      const tokenURI2 = "ipfs://credential456";
      const metadataHash2 = hashString("metadata2");

      await expect(
        credentialManager
          .issueCredentialOnCompletion(courseId, student.address, 85, tokenURI2, metadataHash2)
      ).to.be.revertedWithCustomError(credentialManager, "CredentialAlreadyIssued");
    });

    it("Should not issue if course not completed", async function () {
      // Create new course and enroll but don't complete
      const tx2 = await courseRegistry
        .connect(educator)
        .createCourse("Course 2", "Desc", 30, price, "ipfs://test2");
      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs.find(
        (log: any) => courseRegistry.interface.parseLog(log)?.name === "CourseCreated"
      );
      const courseId2 = courseRegistry.interface.parseLog(event2!)?.args[0] || 0n;

      await courseRegistry
        .connect(student)
        .enrollStudent(courseId2, { value: price });

      await credentialManager
        .connect(manager)
        .setCredentialConfig(courseId2, true, 70, "Certificate", "Blockchain", 0);

      const tokenURI = "ipfs://credential123";
      const metadataHash = hashString("metadata");

      await expect(
        credentialManager
          .issueCredentialOnCompletion(courseId2, student.address, 85, tokenURI, metadataHash)
      ).to.be.revertedWithCustomError(credentialManager, "CourseNotCompleted");
    });

    it("Should handle expiration correctly", async function () {
      await credentialManager
        .connect(manager)
        .setCredentialConfig(courseId, true, 70, "Certificate", "Blockchain", 365);

      const tokenURI = "ipfs://credential123";
      const metadataHash = hashString("metadata");

      await credentialManager
        .issueCredentialOnCompletion(courseId, student.address, 85, tokenURI, metadataHash);

      const tokenId = await credentialManager.getIssuedCredential(courseId, student.address);
      const credential = await credentialNFT.getCredential(tokenId);
      
      // Check expiration is approximately 365 days from now
      const currentTime = BigInt(await ethers.provider.getBlock("latest").then(b => b?.timestamp || 0));
      const expectedExpiration = currentTime + BigInt(365 * 24 * 60 * 60);
      expect(credential.expiresAt).to.be.closeTo(expectedExpiration, 300); // Allow 5 minutes tolerance
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause", async function () {
      await credentialManager.connect(owner).pause();
      expect(await credentialManager.paused()).to.be.true;

      await credentialManager.connect(owner).unpause();
      expect(await credentialManager.paused()).to.be.false;
    });
  });
});

