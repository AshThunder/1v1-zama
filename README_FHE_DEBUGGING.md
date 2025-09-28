# OptimizedFHEGame - Debugging Guide & DevOps Instructions

## Overview

This document provides comprehensive debugging steps and DevOps instructions for the OptimizedFHEGame contract, which includes fixes for stuck payouts, admin controls, and consent-based refunds.

## Contract Features

### ✅ Implemented Features
- **Admin Controls**: `setDecryptionOracle()`, `transferAdmin()` with `onlyAdmin` modifier
- **Oracle Management**: Constructor initialization with oracle address
- **Public Game Conclusion**: `concludeGame(gameId)` for re-requesting stuck decryptions
- **Consent-based Refunds**: Both players must consent before funds are returned
- **Improved Bookkeeping**: Proper cleanup in `decryptionCallback`
- **Event Emissions**: `DecryptionRequested`, `RefundConsented`, `RefundExecuted`, etc.
- **Security**: Preserves `FHE.checkSignatures()` - no forged callbacks allowed

### ⚠️ Centralization Risks
- Admin can change oracle address (consider multisig/DAO in production)
- Oracle controls decryption timing (inherent to FHE architecture)

## Deployment Instructions

### 1. Deploy Contract

```bash
# Compile contracts
cd contracts
npx hardhat compile

# Deploy with oracle address
npx hardhat run scripts/deploy-and-verify.ts --network sepolia

# Or use the deploy script
npx hardhat deploy --network sepolia --tags OptimizedFHEGame --reset
```

### 2. Set Up FHE Relayer/KMS

```bash
# Install Zama FHE relayer SDK
npm install @zama-fhe/relayer-sdk

# Initialize relayer (example script)
```

```typescript
import { createInstance, initSDK } from '@zama-fhe/relayer-sdk';
import { SepoliaConfig } from '@fhevm/solidity/config/ZamaConfig.sol';

async function setupRelayer() {
  // Initialize SDK with Sepolia config
  await initSDK(SepoliaConfig);
  
  // Create relayer instance
  const relayer = await createInstance(SepoliaConfig);
  
  console.log('Relayer initialized for Sepolia testnet');
  return relayer;
}
```

### 3. Configure Oracle Address

```bash
# Update oracle address if needed (admin only)
npx hardhat run --network sepolia scripts/set-oracle.ts
```

## Debugging Checklist

### 🔍 Event Monitoring

Monitor these events to debug game flow:

```solidity
event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount);
event GameChallenged(uint256 indexed gameId, address indexed player2, uint256 betAmount);
event DecryptionRequested(uint256 indexed gameId, uint256 indexed requestId);
event GameRevealed(uint256 indexed gameId, address indexed winner, uint256 prize);
event RefundConsented(uint256 indexed gameId, address indexed player);
event RefundExecuted(uint256 indexed gameId, uint256 amount);
```

### 🐛 Common Issues & Solutions

#### Issue 1: Stuck Decryption
**Symptoms**: Game status remains `Challenged`, no `GameRevealed` event
**Debug Steps**:
1. Check `DecryptionRequested` event was emitted
2. Verify oracle is running and processing requests
3. Check oracle address is correct: `await contract.decryptionOracle()`
4. Use `concludeGame(gameId)` to re-request decryption

**Solution**:
```bash
# Re-request decryption
npx hardhat run scripts/conclude-game.ts --network sepolia
```

#### Issue 2: Oracle Not Responding
**Symptoms**: `DecryptionRequested` emitted but no callback
**Debug Steps**:
1. Verify relayer/KMS is running
2. Check network connectivity
3. Verify oracle has proper permissions
4. Check gas limits for callback transaction

**Solution**:
```bash
# Check oracle status
curl -X GET "https://oracle-endpoint/status"

# Restart relayer if needed
npm run restart-relayer
```

#### Issue 3: Players Want Refund
**Symptoms**: Oracle offline, players stuck in `Challenged` game
**Debug Steps**:
1. Verify game is in `Challenged` status
2. Check both players consent: `game.games(gameId).player1ConsentRefund`
3. Monitor `RefundConsented` and `RefundExecuted` events

**Solution**:
```solidity
// Both players call this
await contract.consentRefund(gameId);
```

### 📊 Monitoring Script

```typescript
// monitor-games.ts
import { ethers } from "hardhat";

async function monitorGames() {
  const contract = await ethers.getContractAt("OptimizedFHEGame", CONTRACT_ADDRESS);
  
  // Monitor stuck games
  const filter = contract.filters.DecryptionRequested();
  const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks
  
  for (const event of events) {
    const gameId = event.args[0];
    const game = await contract.getGame(gameId);
    
    if (game.status === 1) { // Still Challenged
      console.log(`⚠️  Game ${gameId} stuck in Challenged status`);
      console.log(`   Players: ${game.player1}, ${game.player2}`);
      console.log(`   Bet: ${ethers.formatEther(game.betAmount)} ETH`);
    }
  }
}
```

### 🔧 Admin Operations

```bash
# Set new oracle (admin only)
npx hardhat run scripts/admin/set-oracle.ts --network sepolia

# Transfer admin role (admin only)
npx hardhat run scripts/admin/transfer-admin.ts --network sepolia

# Emergency conclude stuck games
npx hardhat run scripts/admin/conclude-stuck-games.ts --network sepolia
```

## Testing Instructions

### Run Test Suite

```bash
cd contracts
npx hardhat test test/OptimizedFHEGame.test.ts
```

### Manual Testing Flow

1. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy-and-verify.ts --network sepolia
   ```

2. **Create Game**
   ```bash
   # Use frontend or direct contract call
   await contract.createGame(encryptedChoice, proof, { value: betAmount });
   ```

3. **Challenge Game**
   ```bash
   await contract.challengeGame(gameId, encryptedGuess, proof, { value: betAmount });
   ```

4. **Verify Events**
   - `GameCreated` ✅
   - `GameChallenged` ✅
   - `DecryptionRequested` ✅

5. **Wait for Oracle Callback**
   - Monitor for `GameRevealed` event
   - Check winner received funds

6. **Test Refund (if oracle fails)**
   ```bash
   await contract.consentRefund(gameId); // Both players
   ```

## Production Deployment Checklist

- [ ] Deploy with proper oracle address
- [ ] Set up monitoring for stuck games
- [ ] Configure admin multisig (recommended)
- [ ] Test full game flow end-to-end
- [ ] Set up alerting for failed decryptions
- [ ] Document emergency procedures
- [ ] Train operators on `concludeGame()` usage

## Emergency Procedures

### Oracle Failure
1. Identify stuck games via monitoring
2. Contact affected players
3. Guide players through consent refund process
4. Fix oracle and redeploy if needed

### Admin Key Compromise
1. Transfer admin to secure multisig immediately
2. Update oracle if compromised
3. Audit recent admin transactions

## Support Contacts

- **FHE Issues**: Zama Discord/Support
- **Contract Issues**: Check GitHub issues
- **Oracle Issues**: Check relayer logs

## Useful Commands

```bash
# Check contract state
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("OptimizedFHEGame", "CONTRACT_ADDRESS")
> await contract.admin()
> await contract.decryptionOracle()
> await contract.gameCounter()

# Monitor events
npx hardhat run scripts/monitor-events.ts --network sepolia

# Emergency conclude all stuck games
npx hardhat run scripts/emergency-conclude.ts --network sepolia
```

This debugging guide should help operators maintain the OptimizedFHEGame contract and handle any issues that arise with the FHE decryption process.
