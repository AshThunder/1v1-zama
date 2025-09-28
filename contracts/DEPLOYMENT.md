# UniqueNumberGameFactory Sepolia Deployment Guide

This guide explains how to deploy the UniqueNumberGameFactory contract to Sepolia testnet.

## 📋 Prerequisites

### 1. Environment Variables Setup

First, set up the necessary environment variables:

```bash
# Set up Hardhat variables
npx hardhat vars setup

# Recommended method 1: Use private key (more secure)
npx hardhat vars set PRIVATE_KEY
# Enter private key without 0x prefix

# Method 2: Use mnemonic
npx hardhat vars set MNEMONIC
# Enter 12 or 24 word mnemonic phrase

# Required API keys
npx hardhat vars set INFURA_API_KEY      # Infura API key
npx hardhat vars set ETHERSCAN_API_KEY   # Etherscan API key (for contract verification)
```

### 2. Sepolia ETH

Ensure your wallet has enough Sepolia ETH:
- Get from: [Sepolia Faucet](https://sepoliafaucet.com/)
- Deployment requires approximately: 0.01-0.02 ETH

### 3. API Keys

- **Infura**: Get free API key from [Infura](https://infura.io/)
- **Etherscan**: Get free API key from [Etherscan](https://etherscan.io/apis)

## 🚀 Deployment Steps

### 1. Compile Contracts

```bash
# Clean and compile contracts
npm run clean
npm run compile
```

### 2. Deploy to Sepolia

Three deployment methods available:

#### Method 1: Use Custom Script (Recommended)
```bash
npm run deploy:sepolia
```

#### Method 2: Use Hardhat Deploy Plugin
```bash
npm run deploy:hardhat-deploy
```

#### Method 3: Run Script Directly
```bash
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

### Deployment Script Features

Custom deployment script (`scripts/deploy-sepolia.ts`) will automatically:
- ✅ Check deployer account balance (at least 0.01 ETH)
- ✅ Estimate gas costs
- ✅ Deploy UniqueNumberGameFactory contract
- ✅ Verify deployment success and test basic functionality
- ✅ Display detailed deployment summary
- ✅ Provide Etherscan verification command

Hardhat Deploy script (`deploy/deploy-game.ts`) additionally provides:
- ✅ Wait for 5 block confirmations
- ✅ Automatic Etherscan verification
- ✅ FHEVM compatibility check

### 3. Verify Deployment

#### Automatic Verification
Deployment script automatically performs the following verifications:
- Contract initial state check (gameCounter = 0)
- Basic function call test (getTotalGamesCount)
- Deployment success confirmation

#### Manual Verification
```bash
# Verify contract source code on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# Check FHEVM compatibility (when using Hardhat Deploy method)
npx hardhat fhevm:check-fhevm-compatibility --network sepolia --address <CONTRACT_ADDRESS>
```

## 🎮 Interacting with Contract

### View Available Tasks

```bash
npx hardhat --network sepolia --help
```

### Basic Operations

```bash
# 1. Create new game
npx hardhat game:create \
  --min 1 \
  --max 10 \
  --players 3 \
  --fee "0.01" \
  --duration 3600 \
  --network sepolia

# 2. View game information
npx hardhat game:info --id 0 --network sepolia

# 3. List recent games
npx hardhat game:list --count 5 --network sepolia

# 4. Manually trigger calculation (after deadline)
npx hardhat game:calculate --id 0 --network sepolia

# 5. Claim prize (winner)
npx hardhat game:claim --id 0 --network sepolia
```

## 📝 Deployment Example

### Complete Deployment Process Example

```bash
# 1. Set environment variables (recommended to use private key method)
npx hardhat vars set PRIVATE_KEY        # Enter private key without 0x prefix
npx hardhat vars set INFURA_API_KEY     # Enter Infura API key
npx hardhat vars set ETHERSCAN_API_KEY  # Enter Etherscan API key

# 2. Compile contracts
npm run clean
npm run compile

# 3. Deploy contract (recommended method)
npm run deploy:sepolia

# 4. Manually verify source code (if needed)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deployment Output Example

After successful deployment, you will see output similar to:

```
Starting UniqueNumberGameFactory deployment to Sepolia...
Deploying with account: 0x1234...
Account balance: 0.1 ETH

Deploying UniqueNumberGameFactory contract...
Estimated gas for deployment: 2,345,678
Transaction hash: 0xabcd...
Waiting for deployment confirmation...

✅ Deployment successful!
Contract address: 0x5678...
Gas used: 2,300,000
Gas price: 20.5 gwei
Transaction cost: 0.047 ETH

🔍 Verifying contract deployment...
Initial game counter: 0
Total games count: 0
✅ Contract is working correctly!

=== DEPLOYMENT SUMMARY ===
Network: Sepolia Testnet
Contract: UniqueNumberGameFactory
Address: 0x5678...
Deployer: 0x1234...
Explorer: https://sepolia.etherscan.io/address/0x5678...

📋 NEXT STEPS:
1. Update frontend contract address in src/contracts/config.ts
2. Verify contract on Etherscan (optional):
   npx hardhat verify --network sepolia 0x5678...
3. Test basic functionality:
   npx hardhat --network sepolia task:create-game --address 0x5678...

⚠️  IMPORTANT: Save the contract address for future use!
```

## ⚠️ Important Notes

### FHE Encryption Differences

**Local Testing vs Sepolia**:
- **Local**: Uses mock encryption, fast testing
- **Sepolia**: Uses real FHE encryption, requires complete client setup

### Number Submission Limitations

Submitting encrypted numbers on Sepolia requires:
1. Complete FHE client setup
2. Key generation and management
3. Encrypted input creation

Recommended workflow:
1. Complete game logic testing locally
2. Test deployment and basic functionality on Sepolia
3. Integrate FHE client for complete testing

### Gas Costs

Operations on Sepolia consume more gas:
- Contract deployment: ~0.01-0.02 ETH
- Create game: ~0.001-0.002 ETH
- FHE operations: More than regular operations

### Network Latency

Sepolia operations are slower than local testing:
- Transaction confirmation: 15-30 seconds
- Block time: ~15 seconds
- Decryption callback: May take several minutes

## 🔧 Troubleshooting

### Common Errors and Solutions

#### 1. "insufficient balance" / "insufficient funds for gas"
**Cause**: Insufficient account balance
**Solution**: 
- Get more test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- Check account balance: `npx hardhat accounts --network sepolia`

#### 2. "nonce too low" error
**Cause**: Transaction nonce conflict
**Solution**: 
- Wait a few minutes and retry
- Check for pending transactions

#### 3. "gas estimation failed" error
**Cause**: Contract deployment parameter error or network issue
**Solution**: 
- Confirm contract compiles correctly: `npm run compile`
- Check network connection
- Try increasing gas limit

#### 4. "network not supported" error
**Cause**: Network configuration error
**Solution**: 
- Verify Sepolia configuration in `hardhat.config.ts`
- Check if Infura API key is correct

#### 5. "private key not found" / "invalid mnemonic" error
**Cause**: Private key or mnemonic not set correctly
**Solution**: 
- Reset: `npx hardhat vars set PRIVATE_KEY`
- Ensure private key doesn't include `0x` prefix
- Mnemonic should be 12 or 24 words

#### 6. "Contract verification failed"
**Cause**: Etherscan verification failure
**Solution**: 
- Check Etherscan API key: `npx hardhat vars get ETHERSCAN_API_KEY`
- Wait a few blocks before retrying verification
- Confirm network configuration is correct

#### 7. "FHEVM compatibility check failed"
**Cause**: FHE compatibility issue
**Solution**: 
- Confirm contract inherits `SepoliaConfig`
- Check `@fhevm/solidity` library version

### Debugging Tools

```bash
# View configured environment variables
npx hardhat vars get PRIVATE_KEY       # Check if private key is set
npx hardhat vars get INFURA_API_KEY    # Check Infura API key
npx hardhat vars get ETHERSCAN_API_KEY # Check Etherscan API key

# View account information
npx hardhat accounts --network sepolia # Show deployer account address

# Check network connection
npx hardhat compile --network sepolia  # Test network connection and compilation

# View deployment history (if using hardhat-deploy)
npx hardhat deployments --network sepolia

# Enable verbose logging
DEBUG=* npm run deploy:sepolia
```

## 🔗 Useful Links

- [Sepolia Faucet](https://sepoliafaucet.com/) - Get test ETH
- [Sepolia Explorer](https://sepolia.etherscan.io/) - Block explorer
- [Infura Dashboard](https://infura.io/dashboard) - API management
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm) - Detailed FHE documentation

## 📊 Deployment Checklist

### Pre-deployment Checks
- [ ] Set environment variables (`PRIVATE_KEY` or `MNEMONIC`, `INFURA_API_KEY`, `ETHERSCAN_API_KEY`)
- [ ] Get enough Sepolia ETH (at least 0.01 ETH)
- [ ] Contract compiles without errors (`npm run compile`)
- [ ] Network configuration is correct (`hardhat.config.ts`)

### Deployment Process Checks
- [ ] Deployment successful and contract address obtained
- [ ] Reasonable gas costs (typically 0.01-0.02 ETH)
- [ ] Transaction visible on Sepolia Etherscan
- [ ] Contract basic functionality verification passed

### Post-deployment Checks
- [ ] Contract verified on Etherscan successfully (optional)
- [ ] FHEVM compatibility check passed (when using hardhat-deploy)
- [ ] Can call basic query functions (`getTotalGamesCount()`)
- [ ] Deployment records and contract address saved

### Frontend Integration Checks
- [ ] Update frontend contract address configuration
- [ ] Test frontend connection to contract
- [ ] Verify basic functionality works normally in frontend

**🎉 Deployment complete! Be sure to save the contract address for future use.**

---

## 📋 Deployment Record Template

```
=== UniqueNumberGameFactory Deployment Record ===
Deployment Date: [YYYY-MM-DD HH:mm:ss]
Network: Sepolia Testnet
Contract Name: UniqueNumberGameFactory
Contract Address: [0x...]
Deployer Address: [0x...]
Transaction Hash: [0x...]
Block Number: [#...]
Gas Used: [gas_used]
Gas Price: [gas_price] gwei
Deployment Cost: [cost] ETH

Verification Status:
✅ Deployment successful
✅ Basic functionality test passed
[ ] Etherscan verification
[ ] Frontend integration complete

Notes: [Any important notes]
```