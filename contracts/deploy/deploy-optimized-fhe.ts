import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("Deploying OptimizedFHEGame with account:", deployer);

  // Official Sepolia decryption oracle address
  const sepoliaOracle = "0xa02Cda4Ca3a71D7C46997716F4283aa851C28812";

  const deployment = await deploy("OptimizedFHEGame", {
    from: deployer,
    args: [sepoliaOracle],
    log: true,
    autoMine: true,
  });

  console.log("OptimizedFHEGame deployed to:", deployment.address);
  console.log("Admin:", deployer);
  console.log("Oracle:", sepoliaOracle);
  console.log("Transaction hash:", deployment.transactionHash);
};

export default func;
func.tags = ["OptimizedFHEGame"];
