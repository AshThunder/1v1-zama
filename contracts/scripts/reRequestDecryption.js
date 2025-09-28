const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get game ID from environment variable or default to 0
  const gameId = process.env.GAME_ID || "0";
  console.log("Processing game ID:", gameId);

  const contractAddress = "0x9e4fDc01ED76DA781222ccE4427C3d2e2fC01198";
  const game = await hre.ethers.getContractAt("OptimizedFHEGame", contractAddress, deployer);

  // Check current game status
  const gameData = await game.games(gameId);
  console.log("Current game status:", gameData[4].toString()); // status is at index 4
  console.log("Player1:", gameData[1]);
  console.log("Player2:", gameData[2]);
  console.log("Bet Amount:", hre.ethers.formatEther(gameData[3]), "ETH");

  if (gameData[4] === 0n) { // GameStatus.Open = 0
    console.log("❌ Game does not exist or is not started yet. Status:", gameData[4].toString());
    return;
  }

  if (gameData[4] !== 1n) { // GameStatus.Challenged = 1
    console.log("❌ Game is not in Challenged status. Current status:", gameData[4].toString());
    console.log("Status meanings: 0=Open, 1=Challenged, 2=Revealed, 3=PrizeClaimed");
    return;
  }

  console.log("Re-requesting decryption for game", gameId, "...");
  try {
    const tx = await game.concludeGame(gameId, { gasLimit: 800000 });
    const receipt = await tx.wait();
    console.log("✅ Transaction successful:", tx.hash);

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
  } catch (error) {
    console.error("❌ Transaction failed:", error.message);
    if (error.message.includes("Not ready")) {
      console.log("Game is not ready for decryption");
    } else if (error.message.includes("Pending")) {
      console.log("Decryption is already pending");
    } else if (error.message.includes("Oracle not set")) {
      console.log("Oracle address is not set");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
