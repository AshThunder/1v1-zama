export const CONTRACT_CONFIG = {
  // OptimizedFHEGame contract address - Sepolia Testnet (FHE enabled)
  address: '0x9e4fDc01ED76DA781222ccE4427C3d2e2fC01198' as `0x${string}`,
  chainId: 11155111, // Sepolia
  
  // Game status enumeration
  GameStatus: {
    WaitingForChallenger: 0,
    Challenged: 1,
    Revealed: 2,
    PrizeClaimed: 3
  } as const,
  
  // Network configuration
  networks: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://eth-sepolia.public.blastapi.io'
    }
  }
} as const;

// TypeScript type definitions for PlayerVsPlayerGuessingGame
export interface Game {
  gameId: bigint;
  player1: string;
  player2: string;
  status: number;
  betAmount: bigint;
  winner: string;
  isRevealed: boolean;
  timestamp: bigint;
}

export interface GameSummary {
  gameId: bigint;
  player1: string;
  player2: string;
  status: number;
  betAmount: bigint;
  winner: string;
  isRevealed: boolean;
  timestamp: bigint;
}

export interface PlayerStats {
  gamesPlayed: bigint;
  gamesWon: bigint;
  totalWinnings: bigint;
}

export interface WinnerRecord {
  gameId: bigint;
  winner: string;
  loser: string;
  winningChoice: number;
  prize: bigint;
  timestamp: bigint;
}

export interface CreateGameParams {
  choice: number; // 1 or 2
  betAmount: string; // ETH amount as string
}

// Helper functions
export const getGameStatusText = (status: number): string => {
  switch (status) {
    case CONTRACT_CONFIG.GameStatus.WaitingForChallenger:
      return 'Open for Challenge';
    case CONTRACT_CONFIG.GameStatus.Challenged:
      return 'In Progress';
    case CONTRACT_CONFIG.GameStatus.Revealed:
      return 'Completed';
    case CONTRACT_CONFIG.GameStatus.PrizeClaimed:
      return 'Completed';
    default:
      return 'Unknown';
  }
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatETH = (wei: bigint): string => {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(2);
};