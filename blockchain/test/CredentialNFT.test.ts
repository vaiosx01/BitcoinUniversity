import { expect } from "chai";
import { ethers } from "hardhat";
import { CredentialNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { hashString } from "./helpers";

describe("CredentialNFT", function () {
  let credentialNFT: CredentialNFT;
  let owner: SignerWithAddress;
  let issuer: SignerWithAddress;
  let student: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const ISSUER_ROLE = hashString("ISSUER_ROLE");

  beforeEach(async function () {
    [owner, issuer, student, otherAccount] = await ethers.getSigners();

    const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
    credentialNFT = (await CredentialNFT.deploy()) as unknown as CredentialNFT;
    await credentialNFT.waitForDeployment();

    // Grant issuer role
    await credentialNFT.grantRole(ISSUER_ROLE, issuer.address);
  });

  describe("Credential Issuance", function () {
    it("Should issue a credential successfully", async function () {
      const tokenURI = "ipfs://QmTest123";
      const metadataHash = hashString("metadata");

      await expect(
        credentialNFT
          .connect(issuer)
          .issueCredential(
            student.address,
            "Bachelor of Science",
            "Computer Science",
            tokenURI,
            metadataHash,
            0 // Non-expiring
          )
      )
        .to.emit(credentialNFT, "CredentialIssued")
        .withArgs(0, student.address, issuer.address, "Bachelor of Science", "Computer Science");

      expect(await credentialNFT.ownerOf(0)).to.equal(student.address);
    });

    it("Should not allow non-issuers to issue credentials", async function () {
      await expect(
        credentialNFT
          .connect(otherAccount)
          .issueCredential(
            student.address,
            "Bachelor of Science",
            "Computer Science",
            "ipfs://test",
            hashString("test"),
            0
          )
      ).to.be.reverted;
    });
  });

  describe("Soulbound Functionality", function () {
    it("Should prevent transfers between addresses", async function () {
      const tokenURI = "ipfs://test";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await credentialNFT
        .connect(issuer)
        .issueCredential(
          student.address,
          "Bachelor",
          "CS",
          tokenURI,
          metadataHash,
          0
        );

      await expect(
        credentialNFT.connect(student).transferFrom(student.address, otherAccount.address, 0)
      ).to.be.revertedWithCustomError(credentialNFT, "SoulboundToken");
    });
  });

  describe("Credential Verification", function () {
    it("Should verify valid credentials", async function () {
      const tokenURI = "ipfs://test";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await credentialNFT
        .connect(issuer)
        .issueCredential(
          student.address,
          "Bachelor",
          "CS",
          tokenURI,
          metadataHash,
          0
        );

      expect(await credentialNFT.verifyCredential(0)).to.be.true;
    });

    it("Should not verify revoked credentials", async function () {
      const tokenURI = "ipfs://test";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await credentialNFT
        .connect(issuer)
        .issueCredential(
          student.address,
          "Bachelor",
          "CS",
          tokenURI,
          metadataHash,
          0
        );

      await credentialNFT.connect(issuer).revokeCredential(0);

      expect(await credentialNFT.verifyCredential(0)).to.be.false;
    });
  });

  describe("ERC-5192 Soulbound Interface", function () {
    it("Should return true for locked() on existing tokens", async function () {
      const tokenURI = "ipfs://test";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await credentialNFT
        .connect(issuer)
        .issueCredential(
          student.address,
          "Bachelor",
          "CS",
          tokenURI,
          metadataHash,
          0
        );

      expect(await credentialNFT.locked(0)).to.be.true;
    });

    it("Should support ERC-5192 interface", async function () {
      const SOULBOUND_INTERFACE_ID = "0xb45a3c0e";
      expect(await credentialNFT.supportsInterface(SOULBOUND_INTERFACE_ID)).to.be.true;
    });
  });

  describe("Additional Functions", function () {
    it("Should return total credentials count", async function () {
      expect(await credentialNFT.getTotalCredentials()).to.equal(0);

      const tokenURI = "ipfs://test";
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await credentialNFT
        .connect(issuer)
        .issueCredential(
          student.address,
          "Bachelor",
          "CS",
          tokenURI,
          metadataHash,
          0
        );

      expect(await credentialNFT.getTotalCredentials()).to.equal(1);
    });
  });
});

