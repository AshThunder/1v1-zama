const hre = require("hardhat");

async function main() {
  console.log("Testing PlayerVsPlayerGuessingGame contract with simple approach...");
  
  // Contract address from deployment
  const contractAddress = "0xd397173949f5796551C11B4619A6301752EEc712";
  
  // Get the contract factory and attach to deployed contract
  const PlayerVsPlayerGuessingGame = await hre.ethers.getContractFactory("PlayerVsPlayerGuessingGame");
  const contract = PlayerVsPlayerGuessingGame.attach(contractAddress);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  try {
    // Test 1: Get current game counter
    console.log("\n--- Test 1: Get game counter ---");
    const gameCounter = await contract.gameCounter();
    console.log("Current game counter:", gameCounter.toString());
    
    // Test 2: Create a game with direct call (bypassing FHEVM plugin)
    console.log("\n--- Test 2: Create game ---");
    const choice = 1; // Player 1 chooses 1
    const betAmount = hre.ethers.parseEther("0.00001"); // 0.00001 ETH bet
    
    // Mock encrypted input (bytes32 format)
    const mockEncryptedChoice = `0x${choice.toString(16).padStart(64, '0')}`;
    const mockProof = "0x";
    
    console.log("Creating game with:");
    console.log("- Choice:", choice);
    console.log("- Bet amount:", hre.ethers.formatEther(betAmount), "ETH");
    console.log("- Mock encrypted choice:", mockEncryptedChoice);
    
    // Use populateTransaction to avoid FHEVM plugin interference
    const txData = await contract.createGame.populateTransaction(mockEncryptedChoice, mockProof);
    
    // Send transaction directly
    const tx = await signer.sendTransaction({
      to: contractAddress,
      data: txData.data,
      value: betAmount,
      gasLimit: 500000, // Set explicit gas limit
    });
    
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Parse logs manually
    const gameCreatedTopic = contract.interface.getEvent("GameCreated").topicHash;
    const gameCreatedLog = receipt.logs.find(log => log.topics[0] === gameCreatedTopic);
    
    if (gameCreatedLog) {
      const parsedLog = contract.interface.parseLog(gameCreatedLog);
      const gameId = parsedLog.args.gameId;
      console.log("Game created with ID:", gameId.toString());
      
      // Test 3: Get game details
      console.log("\n--- Test 3: Get game details ---");
      const gameDetails = await contract.getGame(gameId);
      console.log("Game details:");
      console.log("- Game ID:", gameDetails[0].toString());
      console.log("- Player 1:", gameDetails[1]);
      console.log("- Player 2:", gameDetails[2]);
      console.log("- Status:", gameDetails[3].toString());
      console.log("- Bet Amount:", hre.ethers.formatEther(gameDetails[4]), "ETH");
      console.log("- Winner:", gameDetails[5]);
      console.log("- Is Revealed:", gameDetails[6]);
      console.log("- Timestamp:", gameDetails[7].toString());
      
      // Test 4: Get available games
      console.log("\n--- Test 4: Get available games ---");
      const availableGames = await contract.getAvailableGames();
      console.log("Available games:", availableGames.map(id => id.toString()));
    }
    
  } catch (error) {
    console.error("Error during testing:", error);
    
    // Try to get more details about the error
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.data) {
      console.error("Data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
