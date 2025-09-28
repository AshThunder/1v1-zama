const hre = require("hardhat");

async function main() {
  // Use direct RPC provider to avoid Hardhat provider limitations
  const provider = new hre.ethers.JsonRpcProvider("https://eth-sepolia.public.blastapi.io");

  const abi = [
    "event GameRevealed(uint256 indexed gameId, address indexed winner, uint256 prize)",
    "event PrizeAvailable(uint256 indexed gameId, address indexed winner, uint256 amount)",
    "event DecryptionRequested(uint256 indexed gameId, uint256 indexed requestId)"
  ];

  const contractAddress = "0x9e4fDc01ED76DA781222ccE4427C3d2e2fC01198"; // your deployed contract

  const iface = new hre.ethers.Interface(abi);

  // Event topics
  const gameRevealedTopic = iface.getEvent("GameRevealed").topicHash;
  const prizeAvailableTopic = iface.getEvent("PrizeAvailable").topicHash;
  const decryptionRequestedTopic = iface.getEvent("DecryptionRequested").topicHash;

  // Fetch DecryptionRequested logs
  console.log("\n📢 DecryptionRequested Events:");
  try {
    const decryptionLogs = await provider.getLogs({
      address: contractAddress,
      topics: [decryptionRequestedTopic],
      fromBlock: 0,
      toBlock: "latest"
    });
    
    if (decryptionLogs.length === 0) {
      console.log("  No DecryptionRequested events found");
    } else {
      decryptionLogs.forEach(log => {
        const parsed = iface.parseLog(log);
        console.log(`  gameId=${parsed.args[0].toString()}, requestId=${parsed.args[1].toString()}`);
      });
    }
  } catch (error) {
    console.log("  Error fetching DecryptionRequested logs:", error.message);
  }

  // Fetch GameRevealed logs
  console.log("\n📢 GameRevealed Events:");
  try {
    const revealedLogs = await provider.getLogs({
      address: contractAddress,
      topics: [gameRevealedTopic],
      fromBlock: 0,
      toBlock: "latest"
    });
    
    if (revealedLogs.length === 0) {
      console.log("  No GameRevealed events found");
    } else {
      revealedLogs.forEach(log => {
        const parsed = iface.parseLog(log);
        console.log(`  gameId=${parsed.args[0].toString()}, winner=${parsed.args[1]}, prize=${parsed.args[2].toString()}`);
      });
    }
  } catch (error) {
    console.log("  Error fetching GameRevealed logs:", error.message);
  }

  // Fetch PrizeAvailable logs
  console.log("\n📢 PrizeAvailable Events:");
  try {
    const prizeLogs = await provider.getLogs({
      address: contractAddress,
      topics: [prizeAvailableTopic],
      fromBlock: 0,
      toBlock: "latest"
    });
    
    if (prizeLogs.length === 0) {
      console.log("  No PrizeAvailable events found");
    } else {
      prizeLogs.forEach(log => {
        const parsed = iface.parseLog(log);
        console.log(`  gameId=${parsed.args[0].toString()}, winner=${parsed.args[1]}, amount=${parsed.args[2].toString()}`);
      });
    }
  } catch (error) {
    console.log("  Error fetching PrizeAvailable logs:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
