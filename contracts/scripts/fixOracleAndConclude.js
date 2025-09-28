const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  const contractAddress = "0x9e4fDc01ED76DA781222ccE4427C3d2e2fC01198"; // your deployed game
  const oracleAddress = "0xa02Cda4Ca3a71D7C46997716F4283aa851C28812"; // official Sepolia oracle

  const game = await hre.ethers.getContractAt("OptimizedFHEGame", contractAddress, deployer);

  console.log("Updating oracle...");
  const tx1 = await game.setDecryptionOracle(oracleAddress, { gasLimit: 100000 });
  await tx1.wait();
  console.log("✅ Oracle set to", oracleAddress);

  console.log("Re-requesting decryption for game 0...");
  const tx2 = await game.concludeGame(0, { gasLimit: 800000 });
  const receipt = await tx2.wait();

  // Look for DecryptionRequested event in logs
  for (const log of receipt.logs) {
    try {
      const parsed = game.interface.parseLog(log);
      if (parsed.name === "DecryptionRequested") {
        console.log("📢 DecryptionRequested Event:");
        console.log("  gameId   =", parsed.args[0].toString());
        console.log("  requestId=", parsed.args[1].toString());
      }
    } catch (e) {
      // ignore unrelated logs
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
