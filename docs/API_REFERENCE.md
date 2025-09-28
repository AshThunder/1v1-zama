# API Reference Documentation

This comprehensive guide details all available methods and events within the OptimizedFHEGame smart contract architecture.

## 📋 Contract Interface Overview

### Primary Functions
- ✅ **Match Creation** - `createGame()`
- ✅ **Match Participation** - `joinGame()`
- ✅ **Match Resolution** - Automated upon second participant joining

### Query Operations
- ✅ **Match Discovery** - Contract state reading for available matches
- ✅ **Match Information** - `games()` mapping accessibility
- ✅ **Participant Analytics** - Individual match outcome data

## 🔧 Core Functions

### `createGame()`

Initiates a new Player vs Player match with encrypted selection.

```solidity
function createGame(
    bytes calldata encryptedChoice,
    bytes calldata inputProof
) public payable
```

**Parameters:**
- `encryptedChoice`: FHE encrypted participant selection (1 or 2)
- `inputProof`: Zero-knowledge validation proof for encrypted selection

**Prerequisites:**
- ETH transmission required as wager amount (msg.value > 0)
- Selection must undergo Zama FHE SDK encryption
- Input proof must maintain validity for encrypted selection

**Functionality:**
- Establishes match with sender designated as player1
- Preserves encrypted selection and wager amount
- Match remains accessible for second participant entry

**Event:**
```solidity
event GameCreated(
    uint256 indexed gameId,
    address indexed creator,
    uint256 betAmount
);
```

### `joinGame()`

Participates in existing match as second player with encrypted selection.

```solidity
function joinGame(
    uint256 _gameId,
    bytes calldata encryptedChoice,
    bytes calldata inputProof
) public payable
```

**Parameters:**
- `_gameId`: Target match identifier for participation
- `encryptedChoice`: FHE encrypted participant selection (1 or 2)
- `inputProof`: Zero-knowledge validation proof for encrypted selection

**Prerequisites:**
- Match must exist and await second participant
- Exact wager amount matching must be transmitted
- Selection requires Zama FHE SDK encryption
- Input proof must maintain validity for encrypted selection

**Functionality:**
- Incorporates sender as player2
- Preserves encrypted selection
- Automatically processes match resolution and determines victor
- Transfers complete wager amount to victor

**Event:**
```solidity
event GameResolved(
    uint256 indexed gameId,
    address indexed winner,
    uint256 prizeAmount
);
```

## 📊 Match Data Architecture

### Match Structure
```solidity
struct Game {
    address player1;        // Primary participant (creator)
    address player2;        // Secondary participant (challenger)
    uint256 betAmount;      // Wager amount in wei
    euint32 choice1;        // Encrypted selection of player1
    euint32 choice2;        // Encrypted selection of player2
    address winner;         // Victor address (assigned after resolution)
    bool isCompleted;       // Match completion status
}
```

### Match States
- **Pending**: Match created, awaiting second participant
- **Resolved**: Both participants joined, match concluded

## 📊 Query Operations

### Match Access

#### `games(uint256 gameId)`
```solidity
mapping(uint256 => Game) public games;
```
Direct access to match data via match identifier.

#### `gameCounter()`
```solidity
uint256 public gameCounter;
```
Total quantity of matches created.

### Frontend Integration

To retrieve available matches for participation:
```javascript
// Read matches from contract
const gameCounter = await contract.gameCounter();
const availableMatches = [];

for (let i = 1; i <= gameCounter; i++) {
    const match = await contract.games(i);
    if (match.player2 === "0x0000000000000000000000000000000000000000") {
        availableMatches.push({ id: i, ...match });
    }
}
## 🔐 FHE Integration

### Encryption Methodology

Participants must encrypt their selections utilizing Zama FHE SDK:

```javascript
// Frontend encryption implementation
import { FhevmInstance } from 'fhevmjs';

async function encryptChoice(choice, contractAddress) {
    const instance = await FhevmInstance.create({
        chainId: 11155111, // Sepolia
        networkUrl: 'https://devnet.zama.ai/',
        gatewayUrl: 'https://gateway.devnet.zama.ai/'
    });
    
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add32(choice); // 1 or 2
    
    return input.encrypt();
}
```

### Contract Address

**Sepolia Testnet**: `0x8Fac2e25DFF0B248A19A66Ae8D530613c8Ff6780`

## 📝 Implementation Examples

### Match Creation

```javascript
// Encrypt selection initially
const { handles, inputProof } = await encryptChoice(1, contractAddress);

// Create match with 0.01 ETH wager
await contract.createGame(handles[0], inputProof, {
    value: ethers.parseEther("0.01")
});
```

### Match Participation

```javascript
// Encrypt selection
const { handles, inputProof } = await encryptChoice(2, contractAddress);

// Join match with corresponding wager amount
const match = await contract.games(gameId);
await contract.joinGame(gameId, handles[0], inputProof, {
    value: match.betAmount
});
```

### Game Struct
```solidity
struct Game {
    uint256 gameId;
    address creator;
    GameStatus status;
    string roomName;
    uint32 minNumber;
    uint32 maxNumber;
    uint32 maxPlayers;
    uint256 entryFee;
    uint256 deadline;
    uint32 playerCount;
    euint32 encryptedWinner;
    uint32 decryptedWinner;
}
```

## 🎯 Events

### GameCreated
```solidity
event GameCreated(
    uint256 indexed gameId,
    address indexed creator,
    string roomName,
    uint256 entryFee,
    uint32 maxPlayers,
    uint256 deadline
);
```

### SubmissionReceived  
```solidity
event SubmissionReceived(
    uint256 indexed gameId,
    address indexed player,
    uint32 playerCount
);
```

### WinnerCalculationStarted
```solidity
event WinnerCalculationStarted(
    uint256 indexed gameId,
    address indexed trigger
);
```

### WinnerDetermined
```solidity
event WinnerDetermined(
    uint256 indexed gameId,
    uint32 winnerNumber,
    address indexed winnerAddress
);
```

### PrizeClaimed
```solidity
event PrizeClaimed(
    uint256 indexed gameId,
    address indexed winner,
    uint256 amount
);
```

## ⚠️ Error Handling

### Common Error Messages

- `"Invalid room name length"` - Room name length is invalid
- `"Invalid number range"` - Number range setting is incorrect
- `"Max players must be at least 2"` - Maximum players is less than 2
- `"Range is too large for efficient FHE"` - Number range exceeds FHE efficiency limit
- `"Game is not open"` - Game is not in Open status
- `"Game has passed deadline"` - Game has exceeded deadline
- `"Incorrect entry fee"` - Entry fee is incorrect
- `"Player has already submitted"` - Player has already participated
- `"Game does not exist"` - Game does not exist
- `"You are not the winner"` - Not the winner
- `"Prize already claimed or no prize"` - Prize already claimed or no prize available

## 📊 Gas Usage Estimates

| Function | Estimated Gas | Notes |
|----------|--------------|-------|
| `createGame()` | ~200K-500K | Depends on number range size |
| `submitNumber()` | ~150K-300K | FHE operations consume more gas |
| `findWinnerByDeadline()` | ~300K-800K | Depends on number of participants |
| `claimPrize()` | ~50K-80K | Simple transfer operation |
| Query functions | 0 Gas | Read-only operations |

## 🔗 Related Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Zama FHE Documentation](https://docs.zama.ai/fhevm)
- [Ethereum Developer Documentation](https://ethereum.org/developers/)