import { ethers } from "hardhat";
import { OptimizedFHEGame } from "../types";

async function main() {
  console.log("🚀 Starting OptimizedFHEGame deployment and verification...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Mock oracle address for testing - in production, use actual FHE oracle
  const mockOracle = "0x1234567890123456789012345678901234567890";
  console.log("Using oracle address:", mockOracle);

  // Deploy contract
  console.log("\n📦 Deploying OptimizedFHEGame...");
  const OptimizedFHEGameFactory = await ethers.getContractFactory("OptimizedFHEGame");
  const game = await OptimizedFHEGameFactory.deploy(mockOracle);
  await game.waitForDeployment();
  
  const gameAddress = await game.getAddress();
  console.log("✅ OptimizedFHEGame deployed to:", gameAddress);
  console.log("Admin:", await game.admin());
  console.log("Oracle:", await game.decryptionOracle());

  // Verify basic functionality
  console.log("\n🔍 Verifying contract functionality...");
  
  // Test 1: Create a game
  console.log("Test 1: Creating a game...");
  const betAmount = ethers.parseEther("0.01");
  const mockEncryptedChoice = "0x" + "00".repeat(32);
  const mockProof = "0x" + "00".repeat(64);
  
  const createTx = await game.createGame(mockEncryptedChoice, mockProof, { value: betAmount });
  const createReceipt = await createTx.wait();
  
  // Find GameCreated event
  const gameCreatedEvent = createReceipt?.logs.find(log => {
    try {
      const parsed = game.interface.parseLog(log);
      return parsed?.name === "GameCreated";
    } catch {
      return false;
    }
  });
  
  if (gameCreatedEvent) {
    const parsed = game.interface.parseLog(gameCreatedEvent);
    console.log("✅ Game created with ID:", parsed?.args[0]);
  }

  // Test 2: Challenge the game
  console.log("Test 2: Challenging the game...");
  const [, challenger] = await ethers.getSigners();
  const mockEncryptedGuess = "0x" + "11".repeat(32);
  
  const challengeTx = await game.connect(challenger).challengeGame(0, mockEncryptedGuess, mockProof, { value: betAmount });
  const challengeReceipt = await challengeTx.wait();
  
  // Find DecryptionRequested event
  const decryptionRequestedEvent = challengeReceipt?.logs.find(log => {
    try {
      const parsed = game.interface.parseLog(log);
      return parsed?.name === "DecryptionRequested";
    } catch {
      return false;
    }
  });
  
  if (decryptionRequestedEvent) {
    const parsed = game.interface.parseLog(decryptionRequestedEvent);
    console.log("✅ DecryptionRequested emitted - Game ID:", parsed?.args[0], "Request ID:", parsed?.args[1]);
  }

  // Test 3: Verify game state
  console.log("Test 3: Verifying game state...");
  const gameData = await game.getGame(0);
  console.log("Game status:", gameData.status); // Should be 1 (Challenged)
  console.log("Player 1:", gameData.player1);
  console.log("Player 2:", gameData.player2);
  console.log("Bet amount:", ethers.formatEther(gameData.betAmount));

  // Test 4: Test concludeGame function
  console.log("Test 4: Testing concludeGame function...");
  try {
    const concludeTx = await game.concludeGame(0);
    const concludeReceipt = await concludeTx.wait();
    
    const decryptionEvent = concludeReceipt?.logs.find(log => {
      try {
        const parsed = game.interface.parseLog(log);
        return parsed?.name === "DecryptionRequested";
      } catch {
        return false;
      }
    });
    
    if (decryptionEvent) {
      console.log("✅ concludeGame successfully requested decryption");
    }
  } catch (error) {
    console.log("⚠️  concludeGame failed (expected if decryption already pending):", (error as Error).message);
  }

  // Test 5: Test consent refund mechanism
  console.log("Test 5: Testing consent refund mechanism...");
  
  // Create a new game for refund testing
  const refundGameTx = await game.createGame(mockEncryptedChoice, mockProof, { value: betAmount });
  await refundGameTx.wait();
  
  const refundChallengeTx = await game.connect(challenger).challengeGame(1, mockEncryptedGuess, mockProof, { value: betAmount });
  await refundChallengeTx.wait();
  
  // Player 1 consents to refund
  const consent1Tx = await game.consentRefund(1);
  const consent1Receipt = await consent1Tx.wait();
  
  const refundConsentedEvent = consent1Receipt?.logs.find(log => {
    try {
      const parsed = game.interface.parseLog(log);
      return parsed?.name === "RefundConsented";
    } catch {
      return false;
    }
  });
  
  if (refundConsentedEvent) {
    console.log("✅ Player 1 consented to refund");
  }
  
  // Player 2 consents to refund (should trigger execution)
  const consent2Tx = await game.connect(challenger).consentRefund(1);
  const consent2Receipt = await consent2Tx.wait();
  
  const refundExecutedEvent = consent2Receipt?.logs.find(log => {
    try {
      const parsed = game.interface.parseLog(log);
      return parsed?.name === "RefundExecuted";
    } catch {
      return false;
    }
  });
  
  if (refundExecutedEvent) {
    const parsed = game.interface.parseLog(refundExecutedEvent);
    console.log("✅ Refund executed - Game ID:", parsed?.args[0], "Amount:", ethers.formatEther(parsed?.args[1]));
  }

  // Test 6: Test admin functions
  console.log("Test 6: Testing admin functions...");
  
  const newOracle = "0x9876543210987654321098765432109876543210";
  const oracleTx = await game.setDecryptionOracle(newOracle);
  const oracleReceipt = await oracleTx.wait();
  
  const oracleUpdatedEvent = oracleReceipt?.logs.find(log => {
    try {
      const parsed = game.interface.parseLog(log);
      return parsed?.name === "OracleUpdated";
    } catch {
      return false;
    }
  });
  
  if (oracleUpdatedEvent) {
    console.log("✅ Oracle updated successfully");
  }

  console.log("\n🎉 Deployment and verification completed!");
  console.log("\n📋 Summary:");
  console.log("Contract Address:", gameAddress);
  console.log("Admin:", await game.admin());
  console.log("Oracle:", await game.decryptionOracle());
  console.log("Game Counter:", await game.gameCounter());
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Set up FHE relayer/KMS with proper oracle address");
  console.log("2. Update frontend contract address to:", gameAddress);
  console.log("3. Test full game flow with real FHE encryption");
  console.log("4. Monitor DecryptionRequested events for stuck games");
  
  return {
    contractAddress: gameAddress,
    admin: await game.admin(),
    oracle: await game.decryptionOracle()
  };
}

// Handle both direct execution and module export
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

export { main as deployAndVerify };
