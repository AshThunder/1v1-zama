import { useState, useCallback, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, decodeEventLog } from 'viem';
import contractABI from '@/contracts/OptimizedFHEGame.json';
import { CONTRACT_CONFIG } from '@/contracts/config';

// OptimizedFHEGame types
export interface OptimizedGame {
  id: bigint;
  player1: string;
  player2: string;
  status: number;
  betAmount: bigint;
  winner: string;
  createdAt: bigint;
  player1ConsentRefund: boolean;
  player2ConsentRefund: boolean;
}

export interface CreateFHEGameParams {
  choice: number; // 1 or 2
  betAmount: string; // ETH amount as string
}

// Get single game
export const useGetGame = (gameId: bigint | undefined) => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: contractABI.abi,
    functionName: 'games',
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
    },
  });

  // Map the raw contract data to OptimizedGame format
  const game = data ? {
    gameId: (data as any)[0],
    player1: (data as any)[1],
    player2: (data as any)[2],
    betAmount: (data as any)[3],
    status: (data as any)[4],
    winner: (data as any)[7],
    timestamp: (data as any)[8]
  } as OptimizedGame : undefined;

  return {
    game,
    isError,
    isLoading,
    refetch,
  };
};

// Get game count
export const useGetGameCount = () => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: contractABI.abi,
    functionName: 'getGameCount',
  });

  return {
    gameCount: data as bigint | undefined,
    isError,
    isLoading,
    refetch,
  };
};

// Check if I won
export const useDidIWin = (gameId: bigint | undefined) => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: contractABI.abi,
    functionName: 'didIWin',
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
    },
  });

  return {
    didWin: data as boolean | undefined,
    isError,
    isLoading,
    refetch,
  };
};

// Get game result for any player
export const useGetGameResult = (gameId: bigint | undefined, playerAddress: string | undefined) => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: contractABI.abi,
    functionName: 'getGameResult',
    args: gameId !== undefined && playerAddress ? [gameId, playerAddress] : undefined,
    query: {
      enabled: gameId !== undefined && !!playerAddress,
    },
  });

  return {
    result: data as string | undefined, // "Won", "Lost", or "Pending"
    isError,
    isLoading,
    refetch,
  };
};

// Get prize pool for a game
export const usePrizePool = (gameId: bigint | undefined) => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: contractABI.abi,
    functionName: 'prizePool',
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
    },
  });

  return {
    prizeAmount: data as bigint | undefined,
    isError,
    isLoading,
    refetch,
  };
};

// Get active games (games waiting for challenger)
export const useGetActiveGames = () => {
  const [activeGames, setActiveGames] = useState<GameListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { gameCount } = useGetGameCount();

  const fetchActiveGames = useCallback(async () => {
    if (!gameCount || gameCount === 0n) {
      setActiveGames([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const games: GameListItem[] = [];
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('../../config/wagmi');
      
      // Fetch real game data from contract
      for (let i = 0; i < Number(gameCount); i++) {
        try {
          console.log(`Fetching game ${i} from contract...`);
          const gameData = await readContract(config, {
            address: CONTRACT_CONFIG.address,
            abi: contractABI.abi,
            functionName: 'games',
            args: [BigInt(i)],
          }) as [bigint, string, string, bigint, number, string, bigint, string, bigint, boolean, boolean];
          
          console.log(`Game ${i} raw data:`, gameData);

          // Only include games waiting for challenger
          if (gameData[4] === CONTRACT_CONFIG.GameStatus.WaitingForChallenger) {
            const game = {
              id: i,
              gameId: gameData[0],
              player1: gameData[1],
              player2: gameData[2],
              betAmount: gameData[3],
              status: gameData[4],
              winner: gameData[7],
              timestamp: gameData[8]
            };
            console.log(`Adding game ${i} to list:`, game);
            games.push(game);
          }
        } catch (gameError) {
          console.error(`Error fetching game ${i}:`, gameError);
        }
      }
      
      setActiveGames(games);
    } catch (err) {
      console.error('Error fetching active games:', err);
      setError('Failed to fetch active games');
      setActiveGames([]);
    } finally {
      setIsLoading(false);
    }
  }, [gameCount]);

  useEffect(() => {
    fetchActiveGames();
  }, [fetchActiveGames]);

  return {
    data: activeGames,
    isLoading,
    error,
    refetch: fetchActiveGames,
  };
};

// Create FHE game hook
export const useCreateFHEGame = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdGameId, setCreatedGameId] = useState<bigint | null>(null);
  const { address } = useAccount();
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  const createGame = async (params: CreateFHEGameParams) => {
    try {
      setIsCreating(true);
      setCreatedGameId(null);
      
      if (!address) {
        throw new Error('Wallet not connected');
      }
      
      // Dynamic import FHE encryption tools
      const { encryptNumber } = await import('@/lib/fhe');
      
      // Encrypt the choice using FHE
      console.log('Encrypting choice:', params.choice, 'for contract:', CONTRACT_CONFIG.address, 'user:', address);
      const { data: encryptedData, proof: inputProof } = await encryptNumber(
        params.choice,
        CONTRACT_CONFIG.address,
        address
      );
      
      const betAmountWei = parseEther(params.betAmount);
      
      console.log('Creating FHE game:', {
        encryptedData,
        inputProof,
        betAmount: params.betAmount
      });
      
      // Validate that we have valid data before calling contract
      if (!encryptedData || !inputProof) {
        throw new Error('Invalid encrypted data or input proof');
      }
      
      writeContract({
        address: CONTRACT_CONFIG.address,
        abi: contractABI.abi,
        functionName: 'createGame',
        args: [encryptedData, inputProof],
        value: betAmountWei,
      });
    } catch (err) {
      console.error('Error creating FHE game:', err);
      setIsCreating(false);
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess && receipt) {
      setIsCreating(false);
      
      // Extract gameId from transaction receipt
      try {
        console.log('Parsing transaction receipt logs:', receipt.logs.length, 'logs found');
        
        const gameCreatedEvent = receipt.logs.find(log => {
          try {
            const decoded = decodeEventLog({
              abi: contractABI.abi,
              data: log.data,
              topics: log.topics,
            });
            console.log('Decoded event:', decoded.eventName);
            return decoded.eventName === 'GameCreated';
          } catch (e) {
            return false;
          }
        });

        if (gameCreatedEvent) {
          const decoded = decodeEventLog({
            abi: contractABI.abi,
            data: gameCreatedEvent.data,
            topics: gameCreatedEvent.topics,
          });
          
          console.log('GameCreated event decoded:', decoded);
          
          if (decoded.eventName === 'GameCreated' && decoded.args) {
            const gameId = (decoded.args as any).gameId;
            setCreatedGameId(gameId);
            console.log('FHE Game created with ID:', gameId.toString());
          }
        } else {
          console.warn('No GameCreated event found in transaction logs');
          setCreatedGameId(null);
        }
      } catch (error) {
        console.error('Error parsing GameCreated event:', error);
        setCreatedGameId(null);
      }
    }
  }, [isSuccess, receipt]);

  return {
    createGame,
    isCreating: isPending || isConfirming || isCreating,
    isSuccess,
    error,
    createdGameId,
    transactionHash: hash,
  };
};

// Challenge FHE game hook
export const useChallengeGame = () => {
  const [isChallenging, setIsChallenging] = useState(false);
  const { address } = useAccount();
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const challengeGame = async (gameId: bigint, guess: number, betAmount: string) => {
    try {
      setIsChallenging(true);
      
      if (!address) {
        throw new Error('Wallet not connected');
      }
      
      // Dynamic import FHE encryption tools
      const { encryptNumber } = await import('@/lib/fhe');
      
      // Encrypt the guess using FHE
      console.log('Encrypting guess:', guess, 'for contract:', CONTRACT_CONFIG.address, 'user:', address);
      const { data: encryptedData, proof: inputProof } = await encryptNumber(
        guess,
        CONTRACT_CONFIG.address,
        address
      );
      
      const betAmountWei = parseEther(betAmount);
      
      console.log('Challenging FHE game:', {
        gameId: gameId.toString(),
        encryptedData,
        inputProof,
        betAmount
      });
      
      // Validate encrypted data before contract call
      if (!encryptedData || !inputProof) {
        throw new Error('Encryption failed - missing encrypted data or proof');
      }

      // Get the game details to check if user is trying to challenge their own game
      const { readContract } = await import('wagmi/actions');
      const { config } = await import('../../config/wagmi');
      
      const gameData = await readContract(config, {
        address: CONTRACT_CONFIG.address,
        abi: contractABI.abi,
        functionName: 'games',
        args: [gameId],
      }) as [bigint, string, string, bigint, number, string, bigint, string, bigint, boolean, boolean];
      
      const gameCreator = gameData[1]; // player1 address
      
      // Check if trying to challenge own game
      if (address?.toLowerCase() === gameCreator.toLowerCase()) {
        throw new Error('Cannot challenge your own game. Please use a different wallet address.');
      }

      console.log('Contract call parameters:', {
        gameId: gameId.toString(),
        encryptedData,
        inputProof,
        value: betAmountWei.toString()
      });

      try {
        await writeContract({
          address: CONTRACT_CONFIG.address,
          abi: contractABI.abi,
          functionName: 'challengeGame',
          args: [gameId, encryptedData, inputProof],
          value: betAmountWei,
          gas: 800000n, // Increased gas limit for FHE operations
        });
      } catch (contractError) {
        console.error('Contract call failed:', contractError);
        throw new Error(`Transaction failed: ${contractError.message || contractError}`);
      }
    } catch (err) {
      console.error('Error challenging game:', err);
      setIsChallenging(false);
      throw err;
    }
  };

  useEffect(() => {
    if (isSuccess || error) {
      setIsChallenging(false);
    }
  }, [isSuccess, error]);

  return {
    challengeGame,
    isChallenging: isPending || isConfirming || isChallenging,
    isSuccess,
    error,
    transactionHash: hash,
  };
};

// Conclude game hook (for stuck games)
export const useConcludeGame = () => {
  const [isConcluding, setIsConcluding] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const concludeGame = async (gameId: bigint) => {
    try {
      setIsConcluding(true);
      
      writeContract({
        address: CONTRACT_CONFIG.address,
        abi: contractABI.abi,
        functionName: 'concludeGame',
        args: [gameId],
      });
    } catch (err) {
      console.error('Error concluding game:', err);
      setIsConcluding(false);
    }
  };

  useEffect(() => {
    if (isSuccess || error) {
      setIsConcluding(false);
    }
  }, [isSuccess, error]);

  return {
    concludeGame,
    isConcluding: isPending || isConfirming || isConcluding,
    isSuccess,
    error,
    transactionHash: hash,
  };
};

// Consent to refund hook
export const useConsentRefund = () => {
  const [isConsenting, setIsConsenting] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const consentRefund = async (gameId: bigint) => {
    try {
      setIsConsenting(true);
      
      writeContract({
        address: CONTRACT_CONFIG.address,
        abi: contractABI.abi,
        functionName: 'consentRefund',
        args: [gameId],
      });
    } catch (err) {
      console.error('Error consenting to refund:', err);
      setIsConsenting(false);
    }
  };

  useEffect(() => {
    if (isSuccess || error) {
      setIsConsenting(false);
    }
  }, [isSuccess, error]);

  return {
    consentRefund,
    isConsenting: isPending || isConfirming || isConsenting,
    isSuccess,
    error,
    transactionHash: hash,
  };
};

// Claim prize hook
export const useClaimPrize = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrize = async (gameId: bigint) => {
    try {
      setIsClaiming(true);
      
      writeContract({
        address: CONTRACT_CONFIG.address,
        abi: contractABI.abi,
        functionName: 'claimPrize',
        args: [gameId],
      });
    } catch (err) {
      console.error('Error claiming prize:', err);
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    if (isSuccess || error) {
      setIsClaiming(false);
    }
  }, [isSuccess, error]);

  return {
    claimPrize,
    isClaiming: isPending || isConfirming || isClaiming,
    isSuccess,
    error,
    transactionHash: hash,
  };
};