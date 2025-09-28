import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("Deploying SimplePlayerVsPlayerGame with account:", deployer);

  const deployment = await deploy("SimplePlayerVsPlayerGame", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("SimplePlayerVsPlayerGame deployed to:", deployment.address);
  console.log("Transaction hash:", deployment.transactionHash);
};

export default func;
func.tags = ["SimplePlayerVsPlayerGame"];
