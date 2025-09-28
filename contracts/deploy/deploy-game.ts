import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying PlayerVsPlayerGuessingGame to", hre.network.name);
  console.log("Deployer address:", deployer);

  // Deploy PlayerVsPlayerGuessingGame contract
  const deployedGameFactory = await deploy("PlayerVsPlayerGuessingGame", {
    from: deployer,
    log: true,
    waitConfirmations: hre.network.name === "sepolia" ? 5 : 1, // Wait for confirmations on Sepolia
  });

  console.log(`PlayerVsPlayerGuessingGame contract deployed at: ${deployedGameFactory.address}`);

  // Verify contract on Etherscan if on Sepolia
  if (hre.network.name === "sepolia") {
    console.log("Waiting for block confirmations before verification...");
    
    try {
      await hre.run("verify:verify", {
        address: deployedGameFactory.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error);
    }

    // Check FHEVM compatibility
    console.log("Checking FHEVM compatibility...");
    try {
      await hre.run("fhevm:check-fhevm-compatibility", {
        network: "sepolia",
        address: deployedGameFactory.address,
      });
      console.log("FHEVM compatibility check completed!");
    } catch (error) {
      console.log("FHEVM compatibility check failed:", error);
    }
  }

  // Log deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Contract: PlayerVsPlayerGuessingGame`);
  console.log(`Address: ${deployedGameFactory.address}`);
  console.log(`Deployer: ${deployer}`);
  console.log(`Gas Used: ${deployedGameFactory.receipt?.gasUsed || "N/A"}`);
  
  if (hre.network.name === "sepolia") {
    console.log(`\n🔗 View on Etherscan: https://sepolia.etherscan.io/address/${deployedGameFactory.address}`);
    console.log(`\n⚠️  Save this address for future interactions!`);
  }
};

export default func;
func.id = "deploy_player_vs_player_guessing_game";
func.tags = ["PlayerVsPlayerGuessingGame", "Game"];
func.dependencies = []; // No dependencies required