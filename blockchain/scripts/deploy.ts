import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CredentialNFT
  console.log("\n📜 Deploying CredentialNFT...");
  const CredentialNFT = await ethers.getContractFactory("CredentialNFT");
  const credentialNFT = await CredentialNFT.deploy();
  await credentialNFT.waitForDeployment();
  const credentialAddress = await credentialNFT.getAddress();
  console.log("✅ CredentialNFT deployed to:", credentialAddress);

  // Deploy CourseRegistry
  console.log("\n📚 Deploying CourseRegistry...");
  const CourseRegistry = await ethers.getContractFactory("CourseRegistry");
  const courseRegistry = await CourseRegistry.deploy();
  await courseRegistry.waitForDeployment();
  const registryAddress = await courseRegistry.getAddress();
  console.log("✅ CourseRegistry deployed to:", registryAddress);

  // Deploy PaymentEscrow
  console.log("\n💰 Deploying PaymentEscrow...");
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
  // Min escrow: 7 days, Max escrow: 90 days
  const minEscrowPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
  const maxEscrowPeriod = 90 * 24 * 60 * 60; // 90 days in seconds
  const paymentEscrow = await PaymentEscrow.deploy(
    registryAddress,
    minEscrowPeriod,
    maxEscrowPeriod
  );
  await paymentEscrow.waitForDeployment();
  const escrowAddress = await paymentEscrow.getAddress();
  console.log("✅ PaymentEscrow deployed to:", escrowAddress);

  // Deploy CourseCredentialManager
  console.log("\n🔗 Deploying CourseCredentialManager...");
  const CourseCredentialManager = await ethers.getContractFactory("CourseCredentialManager");
  const credentialManager = await CourseCredentialManager.deploy(
    registryAddress,
    credentialAddress
  );
  await credentialManager.waitForDeployment();
  const managerAddress = await credentialManager.getAddress();
  console.log("✅ CourseCredentialManager deployed to:", managerAddress);

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      CredentialNFT: credentialAddress,
      CourseRegistry: registryAddress,
      PaymentEscrow: escrowAddress,
      CourseCredentialManager: managerAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  const credentialTx = credentialNFT.deploymentTransaction();
  const registryTx = courseRegistry.deploymentTransaction();
  const escrowTx = paymentEscrow.deploymentTransaction();
  const managerTx = credentialManager.deploymentTransaction();
  
  if (credentialTx) await credentialTx.wait(5);
  if (registryTx) await registryTx.wait(5);
  if (escrowTx) await escrowTx.wait(5);
  if (managerTx) await managerTx.wait(5);

  console.log("\n🎉 Deployment completed!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Update frontend contract addresses");
  console.log("3. Set up subgraph for indexing");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

