# CLAUDE.md

This document serves as a comprehensive guide for Claude Code (claude.ai/code) when engaging with this repository's codebase.

## Project Overview

This represents a sophisticated web3 frontend for a Player vs Player Guessing Game, constructed using React, TypeScript, and advanced blockchain integration. The application features a privacy-centric architecture leveraging Zama's Fully Homomorphic Encryption (FHE) technology, enabling participants to select between 1 or 2 while maintaining complete choice confidentiality through on-chain encryption until match conclusion.

**Key Technologies:**
- Frontend: React 18 + TypeScript + Vite
- Web3: Wagmi + RainbowKit for wallet integration
- UI: shadcn/ui components + Tailwind CSS
- Blockchain: Designed for Zama FHE (Fully Homomorphic Encryption) integration
- Network: Currently configured for Sepolia testnet

## Development Commands

```bash
# Development
npm run dev          # Start development server with hot reload
npm run dev          # Alternative: vite (same as npm run dev)

# Build
npm run build        # Production build
npm run build:dev    # Development build with debug info
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint for code linting
```

## Architectural Framework

### Application Structure
- **Single Page Application** utilizing React Router for seamless navigation
- **Provider Hierarchy**: WagmiProvider → QueryClientProvider → RainbowKitProvider → TooltipProvider
- **State Management**: React hooks (useState) implementing component-level state architecture
- **Web3 Integration**: Wagmi facilitating blockchain interactions, RainbowKit providing wallet connectivity interface

### Primary Pages & Components
1. **LandingPage** (`/`) - Primary entry portal featuring game introduction
2. **CreateGame** (`/create-game`) - Encrypted guessing game creation utilizing FHE
3. **JoinGame** (`/join-game`) - Existing game challenges with encrypted selection submission
4. **NotFound** - 404 error handling fallback

### Web3 Integration Architecture

**Wallet Connectivity:**
- Implements RainbowKit's `<ConnectButton />` for wallet interface
- `useAccount()` hook delivers connection status and wallet address information
- Wallet connection prerequisite for all gaming operations

**Game State Architecture:**
- Utilizes OptimizedFHEGame smart contract deployed on Sepolia testnet
- Participant selections (1 or 2) encrypted via Zama FHE SDK
- Encrypted information stored on-chain alongside input validation proofs
- Match outcomes revealed through secure FHE computational processes

**Blockchain Configuration:**
```typescript
// src/config/wagmi.ts
- Configured for Sepolia testnet
- Uses RainbowKit default configuration
- Project ID placeholder needs replacement
```

### Component Architecture

**UI Components:**
- Built on shadcn/ui foundation with customizations
- `GameCard` - Specialized for number selection grid
- `GradientButton` - Custom styled buttons with game theming
- Standard components: Card, Badge, Avatar, Input, Slider, etc.

**Game Logic Components:**
- Simple choice selection (1 or 2)
- FHE encryption integration via Zama SDK
- Real-time game data fetching from contracts
- Bet amount handling and validation

### Privacy & Encryption Architecture

The application leverages Zama's FHE (Fully Homomorphic Encryption) technology:
- Participant selections (1 or 2) undergo client-side encryption via Zama SDK
- Encrypted information and validation proofs maintained on-chain
- Match resolution executed through FHE computational processes on encrypted data
- Victory determination achieved via encrypted selection comparison algorithms

## Development Patterns

### State Management
- Component-level state with React hooks
- No global state management (Redux, Zustand) currently implemented
- Web3 state managed through Wagmi hooks

### Styling Approach
- Tailwind CSS with custom design system
- CSS custom properties for theming
- Gradient backgrounds and glass-morphism effects
- Responsive design with mobile-first approach

### Error Handling
- Toast notifications using sonner
- Wallet connection validation before game actions
- Form validation for room creation
- Network error handling through Wagmi

### FHE Integration Strategy
Current implementation includes:
- Zama FHE SDK loaded via CDN
- Encrypted choice submission (1 or 2)
- Real contract data fetching and display
- Proper data format conversion (Uint8Array → hex)

## Smart Contract Integration Points

**Implemented Integration Areas:**
1. **Game Creation** - CreateGame component uses OptimizedFHEGame contract
2. **Game Joining** - JoinGame fetches real game data and handles encrypted guesses
3. **Choice Encryption** - FHE SDK encrypts player choices with input proofs
4. **Contract Interaction** - Direct contract calls for game creation and joining
5. **Data Display** - Real-time game data with proper bet amount formatting

**FHE Data Flow:**
- Player choice (1 or 2) → Zama FHE encryption → Contract storage
- Encrypted data and input proofs stored on Sepolia testnet
- Game state transitions handled by OptimizedFHEGame contract
- Winner determination through FHE computation

## File Structure Key Areas

```
src/
├── components/ui/          # shadcn/ui components + custom components
├── config/wagmi.ts        # Web3 configuration (needs project ID)
├── hooks/                 # Custom React hooks
├── lib/utils.ts          # Utility functions
├── pages/                # Main application pages
└── main.tsx              # Application entry point
```

## Known Development Notes

- FHE SDK integration complete with Zama's Sepolia configuration
- Real contract data fetching implemented for game display
- Encrypted choice submission working with proper data format conversion
- Toast notifications provide user feedback for all major actions
- Responsive design optimized for both desktop and mobile gameplay

## Testing Considerations

When implementing tests, focus on:
- Web3 connection flow testing
- FHE encryption and decryption processes
- Game state transitions and contract interactions
- Choice validation (1 or 2 only)
- Responsive UI behavior