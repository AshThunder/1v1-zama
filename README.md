# 1v1 Guessing dApp

A privacy-preserving Player vs Player guessing game powered by **Zama's Fully Homomorphic Encryption (FHE)** technology. Players choose between 1 or 2, with their choices remaining encrypted on-chain until game completion, ensuring complete privacy and fairness in Web3 gaming.

![1v1 Guessing](public/uninum.png)


1v1 Guessing is an **FHE-powered Player vs Player guessing game** where two players compete by choosing between 1 or 2. Your choices remain completely private through encryption until the game reveals both selections simultaneously. The winner takes the entire bet amount!

### Key Features

- 🔐 **Privacy-First Gaming**: Choices encrypted using Zama's FHE technology
- ⚡ **Player vs Player**: Direct 1v1 competition with encrypted choices
- 🏆 **Fair Competition**: Cryptographically verifiable results
- 💰 **Winner Takes All**: Bet amount goes to the winner
- 🎯 **Simple Gameplay**: Choose between 1 or 2 - easy to learn, hard to predict
- 🎨 **Modern UI**: Built with React 18 + shadcn/ui components
- 🔗 **Web3 Native**: Seamless wallet integration with RainbowKit

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui components + Tailwind CSS
- **Web3 Integration**: Wagmi v2 + RainbowKit
- **State Management**: React hooks with local component state
- **Routing**: React Router DOM v6

### Blockchain & Privacy
- **Smart Contracts**: OptimizedFHEGame.sol with Zama FHEVM
- **Privacy Layer**: Zama Fully Homomorphic Encryption (FHE)
- **Network**: Sepolia Testnet (with Zama FHE support)
- **Contract Address**: `0x8Fac2e25DFF0B248A19A66Ae8D530613c8Ff6780`

### Development Tools
- **Build Tool**: Vite 5.4+
- **Type Checking**: TypeScript 5.5+
- **Linting**: ESLint 9+ with React hooks plugin
- **Styling**: PostCSS + Autoprefixer

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for gas fees

### Installation

```bash
# Clone the repository


# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Environment Setup

1. **WalletConnect Project ID** (Optional for enhanced wallet support):
   ```typescript
   // src/config/wagmi.ts
   projectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
   ```
   Get your Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

## 🎮 How to Play

### 1. **Create or Join a Game**
- Create a new game by setting your bet amount
- Or challenge an existing game created by another player

### 2. **Make Your Choice**
- Choose between 1 or 2
- Your choice is encrypted using FHE and stored on-chain
- No one can see your choice until both players have chosen

### 3. **Game Resolution**
- When both players have made their choices, FHE reveals the results
- Winner is determined by the game logic and takes the entire bet amount
- Results are cryptographically verifiable and fair

## 🔐 Zama FHE Integration

### Where FHE is Used

1. **Choice Encryption** (`src/lib/fhe.ts`):
   ```typescript
   // Client-side encryption before blockchain submission
   const encryptedChoice = await encryptNumber(playerChoice, contractAddress);
   ```

2. **Smart Contract Operations** (`OptimizedFHEGame.sol`):
   - Encrypted choice storage using `euint32` types
   - FHE-based winner calculation without revealing individual choices
   - Cryptographic proof verification for game integrity

3. **Privacy Guarantees**:
   - Player choices remain encrypted until game completion
   - Even contract owners cannot see individual choices
   - Winner determination happens through FHE computations

### FHE Implementation Status

- ✅ **Infrastructure**: Zama FHE SDK integrated via CDN
- ✅ **Smart Contracts**: OptimizedFHEGame contract deployed on Sepolia
- ✅ **Encryption**: Real FHE encryption implemented for player choices
- ✅ **Production Ready**: Full FHE encryption active and working

## 🌐 Live Demo

### Demo Application
- 

### Smart Contract
- **Network**: Sepolia Testnet
- **Contract**: `0x8Fac2e25DFF0B248A19A66Ae8D530613c8Ff6780`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x8Fac2e25DFF0B248A19A66Ae8D530613c8Ff6780)
- **Repository**: [EVM Contract Source](https://github.com/AshThunder/1v1-zama.git)

## 📁 Project Structure

```
src/
├── components/ui/          # shadcn/ui components + custom game components
├── pages/                  # Main application pages
│   ├── LandingPage.tsx    # Home page with game introduction
│   ├── CreateGame.tsx     # Create encrypted guessing games
│   └── JoinGame.tsx       # Challenge existing games
├── hooks/contract/         # Smart contract integration hooks
├── config/wagmi.ts        # Web3 configuration
├── contracts/             # Contract ABI and configuration
├── lib/                   # Utilities and FHE integration
└── main.tsx              # Application entry point

contracts/                  # Git submodule: Smart contract source code
├── contracts/             # Solidity smart contracts
│   ├── OptimizedFHEGame.sol         # Main Player vs Player game contract
│   └── SimplePlayerVsPlayerGame.sol # Simple version for reference
├── deploy/                # Deployment scripts
├── test/                  # Contract test suites
├── tasks/                 # Hardhat tasks and utilities
└── docs/                  # Contract documentation
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run preview          # Preview production build locally

# Build
npm run build           # Production build
npm run build:dev       # Development build with debug info

# Code Quality
npm run lint            # Run ESLint for code linting
```

## 🧪 Testing

### Smart Contract Testing
```bash
# Navigate to contracts submodule
cd contracts

# Install contract dependencies
npm install

# Run contract tests
npm test
npx hardhat test
```

### Frontend Testing
- **Manual Testing**: Use development server with mock data
- **Contract Integration**: Test with deployed Sepolia contract
- **Wallet Integration**: Test with MetaMask on Sepolia testnet

## 📚 Documentation

### Frontend Documentation
- **API Reference**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - Smart contract methods and events
- **Game Flow**: [docs/GAME_FLOW.md](docs/GAME_FLOW.md) - Complete game mechanics and user flow
- **Contract Integration**: [docs/CONTRACT_INTEGRATION.md](docs/CONTRACT_INTEGRATION.md) - Frontend-contract integration guide  
- **Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Full deployment instructions
- **Testing Plan**: [docs/TESTING_PLAN.md](docs/TESTING_PLAN.md) - Comprehensive testing strategy and test cases
-

### Smart Contract Documentation
- **Contract README**: [contracts/README.md](contracts/README.md) - Smart contract overview and setup
- **Game Flow**: [contracts/docs/game-flow.md](contracts/docs/game-flow.md) - Contract-level game mechanics
- **Deployment**: [contracts/DEPLOYMENT.md](contracts/DEPLOYMENT.md) - Contract deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links & Resources

- **Developer**: [@ChrisGold__](https://x.com/ChrisGold__)
- **Frontend Repository**: [AshThunder/1v1-zama](https://github.com/AshThunder/1v1-zama.git)
- **Smart Contract Repository**: [AshThunder/1v1-zama](https://github.com/AshThunder/1v1-zama.git)
- **Zama Documentation**: [docs.zama.ai](https://docs.zama.ai/)


## ⚠️ Important Notes

- **Testnet Only**: Currently deployed on Sepolia testnet for testing
- **Gas Costs**: FHE operations require higher gas fees than standard transactions
- **Privacy**: Full FHE encryption is active and working with Zama SDK
- **Educational Purpose**: This demonstrates real FHE technology in gaming

---

*Built with ❤️ for the future of privacy-preserving Web3 gaming*
