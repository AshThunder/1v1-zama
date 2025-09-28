# Contract Integration Guide

This document describes how to integrate the frontend with the OptimizedFHEGame smart contract.

## 📋 Overview

OptimizedFHEGame is a smart contract based on Zama FHE technology that supports creating and managing encrypted Player vs Player guessing games. The frontend interacts with the contract through React hooks and Wagmi.

## 🏗️ Architecture Diagram

```
Frontend (React + TypeScript)
    ↓
Web3 Layer (Wagmi + RainbowKit)
    ↓
Smart Contract (OptimizedFHEGame.sol)
    ↓
FHE Layer (Zama Protocol)
```

## 🔧 Configuration Steps

### 1. Contract Configuration

The OptimizedFHEGame contract is deployed on Sepolia testnet:

```typescript
export const CONTRACT_CONFIG = {
  address: '0x8Fac2e25DFF0B248A19A66Ae8D530613c8Ff6780' as `0x${string}`,
  abi: OptimizedFHEGameABI,
  chainId: 11155111, // Sepolia
};
```

### 2. Network Configuration

Configure Sepolia testnet in `src/config/wagmi.ts`:

```typescript
import { sepolia } from 'wagmi/chains';

const config = createConfig({
  chains: [sepolia],
  connectors: [
    // RainbowKit connectors
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
```

### 3. FHE SDK Configuration

Load Zama FHE SDK via CDN in `index.html`:

```html
<script src="https://unpkg.com/fhevmjs@0.5.2/bundle/bundle.web.js"></script>
```

Initialize FHE instance:

```typescript
const instance = await window.fhevm.createInstance({
  chainId: 11155111, // Sepolia
  networkUrl: 'https://devnet.zama.ai/',
  gatewayUrl: 'https://gateway.devnet.zama.ai/'
```

## 🎯 Core Feature Integration

### Game Creation

```typescript
// Encrypt player choice using FHE SDK
async function encryptChoice(choice: number, contractAddress: string, userAddress: string) {
  const instance = await window.fhevm.createInstance({
    chainId: 11155111,
    networkUrl: 'https://devnet.zama.ai/',
    gatewayUrl: 'https://gateway.devnet.zama.ai/'
  });
  
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add32(choice); // 1 or 2
  return input.encrypt();
}

// Create game with encrypted choice
const { writeContract } = useWriteContract();

async function createGame(choice: number, betAmount: string) {
  const { handles, inputProof } = await encryptChoice(choice, CONTRACT_ADDRESS, userAddress);
  
  await writeContract({
    address: CONTRACT_ADDRESS,
    abi: OptimizedFHEGameABI,
    functionName: 'createGame',
    args: [handles[0], inputProof],
    value: parseEther(betAmount)
  });
```

### Game Joining

```typescript
// Join existing game with encrypted choice
async function joinGame(gameId: number, choice: number, betAmount: string) {
  const { handles, inputProof } = await encryptChoice(choice, CONTRACT_ADDRESS, userAddress);
  
  await writeContract({
    address: CONTRACT_ADDRESS,
    abi: OptimizedFHEGameABI,
    functionName: 'joinGame',
    args: [gameId, handles[0], inputProof],
    value: parseEther(betAmount)
  });
}
```

### Reading Game Data

```typescript
// Get available games for joining
const { data: gameCounter } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: OptimizedFHEGameABI,
  functionName: 'gameCounter'
});

// Get specific game data
const { data: gameData } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: OptimizedFHEGameABI,
  functionName: 'games',
  args: [gameId]
});

// Check if game is available for joining
const isGameAvailable = gameData?.player2 === '0x0000000000000000000000000000000000000000';
```

## 🔐 FHE Integration Details

### Data Format Conversion

The FHE SDK returns Uint8Array data that must be converted to hex strings for contract compatibility:

```typescript
function uint8ArrayToHex(uint8Array: Uint8Array): string {
  return '0x' + Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert encrypted data and input proof
const encryptedData = uint8ArrayToHex(handles[0]);
const inputProofHex = uint8ArrayToHex(inputProof);
```

### Error Handling

```typescript
// Handle FHE encryption errors
try {
  const { handles, inputProof } = await encryptChoice(choice, CONTRACT_ADDRESS, userAddress);
  // Proceed with contract call
} catch (error) {
  console.error('FHE encryption failed:', error);
  // Show user-friendly error message
  toast.error('Failed to encrypt choice. Please try again.');
}

// Handle contract transaction errors
const { writeContract, error, isError } = useWriteContract();

if (isError) {
  console.error('Contract transaction failed:', error);
  toast.error('Transaction failed. Please check your wallet and try again.');
}
```

## 📱 Frontend Components Integration

### CreateGame Component

```typescript
import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';

export function CreateGame() {
  const [choice, setChoice] = useState<number>(1);
  const [betAmount, setBetAmount] = useState<string>('0.01');
  const [isCreating, setIsCreating] = useState(false);
  
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const handleCreateGame = async () => {
    if (!address) return;
    
    setIsCreating(true);
    try {
      const { handles, inputProof } = await encryptChoice(choice, CONTRACT_ADDRESS, address);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: OptimizedFHEGameABI,
        functionName: 'createGame',
        args: [handles[0], inputProof],
        value: parseEther(betAmount)
      });
    } catch (error) {
      console.error('Game creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Your Choice:</label>
        <div className="flex gap-2">
          <button 
            onClick={() => setChoice(1)}
            className={choice === 1 ? 'selected' : ''}
          >
            1
          </button>
          <button 
            onClick={() => setChoice(2)}
            className={choice === 2 ? 'selected' : ''}
          >
            2
          </button>
        </div>
      </div>
      
      <div>
        <label>Bet Amount (ETH):</label>
        <input 
          type="number" 
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          step="0.001"
          min="0.001"
        />
      </div>
      
      <button 
        onClick={handleCreateGame}
        disabled={isCreating || !address}
      >
        {isCreating ? 'Creating Game...' : 'Create Game'}
      </button>
    </div>
  );
}
```

### JoinGame Component

```typescript
export function JoinGame() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [choice, setChoice] = useState<number>(1);
  const [isJoining, setIsJoining] = useState(false);
  
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  // Fetch available games
  const { data: gameCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: OptimizedFHEGameABI,
    functionName: 'gameCounter'
  });

  const handleJoinGame = async () => {
    if (!address || !selectedGameId) return;
    
    setIsJoining(true);
    try {
      // Get game data to match bet amount
      const gameData = await readContract({
        address: CONTRACT_ADDRESS,
        abi: OptimizedFHEGameABI,
        functionName: 'games',
        args: [selectedGameId]
      });
      
      const { handles, inputProof } = await encryptChoice(choice, CONTRACT_ADDRESS, address);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: OptimizedFHEGameABI,
        functionName: 'joinGame',
        args: [selectedGameId, handles[0], inputProof],
        value: gameData.betAmount
      });
    } catch (error) {
      console.error('Game joining failed:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Game selection UI */}
      {/* Choice selection UI */}
      <button 
        onClick={handleJoinGame}
        disabled={isJoining || !address || !selectedGameId}
      >
        {isJoining ? 'Joining Game...' : 'Join Game'}
      </button>
    </div>
  );
}
```

## 🚀 Deployment Checklist

### Contract Deployment
- [x] OptimizedFHEGame deployed to Sepolia: `0x8Fac2e25DFF0B248A19A66Ae8D530613c8Ff6780`
- [x] Contract verified and functional
- [x] FHE integration working with encrypted choices

### Frontend Configuration
- [x] Contract address updated in configuration
- [x] FHE SDK loaded via CDN
- [x] Wagmi configured for Sepolia testnet
- [x] RainbowKit wallet integration active

### Testing Requirements
- [ ] Test game creation with encrypted choices
- [ ] Test game joining with bet amount matching
- [ ] Test automatic game resolution
- [ ] Test winner prize distribution
- [ ] Test error handling for invalid inputs

## 🔍 Troubleshooting

### Common Issues

1. **Encryption Process Errors**
   - Verify FHE SDK initialization: confirm `window.fhevm` is available
   - Check network settings align with Sepolia testnet configuration
   - Validate wallet connection and user address accessibility

2. **Blockchain Transaction Errors**
   - Confirm correct contract address deployment
   - Validate sufficient wallet balance for transaction fees and bet amounts
   - Verify matching bet values when joining existing games

3. **Game Resolution Issues**
   - Games automatically complete upon second player participation
   - Confirm successful transaction completion for both participants
   - Prize distribution equals combined bet amounts to the winner

### FHE Integration Plan

1. **Install Zama FHE Client Library**
   ```bash
   npm install @zama-fhe/fhevmjs
   ```

2. **Initialize FHE Instance**
   ```typescript
   import { createFhevmInstance } from '@zama-fhe/fhevmjs';
   
   const fhevmInstance = await createFhevmInstance({
     chainId: 8009, // Zama testnet chain ID
     gatewayUrl: 'https://gateway.zama.ai',
   });
   ```

3. **Encrypt User Input**
   ```typescript
   const encryptNumber = async (number: number) => {
     const encrypted = await fhevmInstance.encrypt32(number);
     return {
       encryptedData: encrypted.data,
       inputProof: encrypted.inputProof,
     };
   };
   ```

4. **Update submitNumber Function**
   ```typescript
   const submitNumber = async (gameId: bigint, number: number, entryFeeETH: string) => {
     const { encryptedData, inputProof } = await encryptNumber(number);
     
     writeContract({
       address: CONTRACT_CONFIG.address,
       abi: contractABI.abi,
       functionName: 'submitNumber',
       args: [gameId, encryptedData, inputProof],
       value: parseEther(entryFeeETH),
     });
   };
   ```

## 📊 Event Listening

### Game Creation Events

```typescript
import { useWatchContractEvent } from 'wagmi';

useWatchContractEvent({
  address: CONTRACT_CONFIG.address,
  abi: contractABI.abi,
  eventName: 'GameCreated',
  onLogs(logs) {
    logs.forEach((log) => {
      console.log('New game created:', log.args);
      // Refresh game list
      refetchActiveGames();
    });
  },
});
```

### Winner Determined Events

```typescript
useWatchContractEvent({
  address: CONTRACT_CONFIG.address,
  abi: contractABI.abi,
  eventName: 'WinnerDetermined',
  onLogs(logs) {
    logs.forEach((log) => {
      console.log('Winner determined:', log.args);
      // Update game status and leaderboard
    });
  },
});
```

## ⚠️ Important Notes

### 1. Error Handling

```typescript
const { createGame, error } = useCreateGame();

if (error) {
  console.error('Contract error:', error);
  // Display user-friendly error message
}
```

### 2. Transaction Confirmation

```typescript
const { isCreating, isSuccess, transactionHash } = useCreateGame();

// isCreating: Transaction being sent or confirmed
// isSuccess: Transaction successfully confirmed
// transactionHash: Transaction hash for blockchain explorer viewing
```

### 3. Data Refresh

Manual data refresh is needed after contract state changes:

```typescript
const { refetch: refetchGames } = useGetActiveGames();
const { refetch: refetchStats } = useGetPlayerStats(address);

// Refresh after successful transaction
useEffect(() => {
  if (isSuccess) {
    refetchGames();
    refetchStats();
  }
}, [isSuccess]);
```

## 🔗 Related Files

- `src/contracts/config.ts` - Contract configuration and type definitions
- `src/contracts/UniqueNumberGameFactory.json` - Contract ABI
- `src/hooks/contract/useGameContract.ts` - Game-related hooks
- `src/hooks/contract/useStatsContract.ts` - Statistics-related hooks
- `src/config/wagmi.ts` - Web3 configuration

## 📚 Reference Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Zama FHE Documentation](https://docs.zama.ai/fhevm)
- [Viem Documentation](https://viem.sh/)