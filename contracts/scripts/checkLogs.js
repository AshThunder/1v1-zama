const hre = require("hardhat");

async function main() {
  const provider = new hre.ethers.JsonRpcProvider("https://sepolia.infura.io/v3/5814c6b854994d8e9b28254e66950eda");

  const abi = [
    "event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount)",
    "event GameChallenged(uint256 indexed gameId, address indexed player2, uint256 betAmount)",
    "event DecryptionRequested(uint256 indexed gameId, uint256 indexed requestId)",
    "event GameRevealed(uint256 indexed gameId, address indexed winner, uint256 prizeAmount)"
  ];

  const contract = new hre.ethers.Contract(
    "0x9e4fDc01ED76DA781222ccE4427C3d2e2fC01198",
    abi,
    provider
  );

  console.log("=== Checking DecryptionRequested events ===");
  const decryptionLogs = await contract.queryFilter("DecryptionRequested", 0, "latest");
  console.log("Decryption requests:", decryptionLogs.length);
  decryptionLogs.forEach((log, i) => {
    console.log(`Request ${i}: GameId=${log.args[0]}, RequestId=${log.args[1]}, Block=${log.blockNumber}`);
  });

  console.log("\n=== Checking GameRevealed events ===");
  const revealedLogs = await contract.queryFilter("GameRevealed", 0, "latest");
  console.log("Game reveals:", revealedLogs.length);
  revealedLogs.forEach((log, i) => {
    console.log(`Reveal ${i}: GameId=${log.args[0]}, Winner=${log.args[1]}, Prize=${hre.ethers.formatEther(log.args[2])} ETH, Block=${log.blockNumber}`);
  });
}

main();
