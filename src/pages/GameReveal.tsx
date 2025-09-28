import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Shield, Coins, Lock, Unlock, ArrowLeft } from 'lucide-react';
import { CONTRACT_CONFIG } from '../contracts/config';
import OptimizedFHEGameABI from '../contracts/OptimizedFHEGame.json';
import { zamaTestnet } from '@/config/wagmi';

interface GameDetails {
  gameId: bigint;
  player1: string;
  player2: string;
  betAmount: bigint;
  status: number;
  winner: string;
  player1Choice: bigint; // This would be encrypted on-chain, revealed off-chain
  player2Guess: bigint; // This would be encrypted on-chain, revealed off-chain
}

export default function GameReveal() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { address, isConnected } = useAccount();
  const [revealedDetails, setRevealedDetails] = useState<GameDetails | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch game details
  const { data: rawGameDetails, isLoading: isGameDetailsLoading, error: gameDetailsError } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: OptimizedFHEGameABI.abi,
    functionName: 'getGame',
    args: gameId ? [BigInt(gameId)] : undefined,
    query: {
      enabled: !!gameId,
      select: (data) => ({
        gameId: data[0],
        player1: data[1],
        player2: data[2],
        betAmount: data[3],
        status: data[4],
        winner: data[5],
        timestamp: data[6],
        player1Choice: data[7], // Assuming these are now readable after reveal
        player2Guess: data[8],
      }) as GameDetails,
    },
  });

  // Claim Prize write contract
  const { writeContract, data: claimHash, error: claimError, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  useEffect(() => {
    if (rawGameDetails) {
      // In a real FHE game, player choices would be decrypted client-side after reveal
      // For this UI, we're simulating the revealed choices
      setRevealedDetails(rawGameDetails);
    }
  }, [rawGameDetails]);

  useEffect(() => {
    if (isClaimConfirmed) {
      toast.success('Prize claimed successfully!');
      navigate('/'); // Or to a Claim Prize screen
    }
  }, [isClaimConfirmed, navigate]);

  const handleClaimPrize = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!gameId) {
      toast.error('Game ID is missing');
      return;
    }

    try {
      setIsClaiming(true);
      toast.info('Claiming prize...');
      await writeContract({
        address: CONTRACT_CONFIG.address,
        abi: OptimizedFHEGameABI.abi,
        functionName: 'claimPrize',
        args: [BigInt(gameId)],
        account: address,
        chain: zamaTestnet,
      });
      toast.success('Prize claim transaction submitted!');
    } catch (error) {
      console.error('Error claiming prize:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to claim prize');
      } else {
        toast.error('Failed to claim prize due to an unknown error.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const isWinner = revealedDetails?.winner === address;
  const isPlayer = revealedDetails?.player1 === address || revealedDetails?.player2 === address;
  const gameEnded = revealedDetails?.status === CONTRACT_CONFIG.GameStatus.Revealed || revealedDetails?.status === CONTRACT_CONFIG.GameStatus.PrizeClaimed;

  if (isGameDetailsLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-xl font-pixel">Loading game results...</p>
      </div>
    );
  }

  if (gameDetailsError || !revealedDetails) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <p className="text-xl font-pixel text-destructive">Error loading game details or game not found.</p>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 right-0 container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10">
            <img
              src="/uninum.png"
              alt="Optimized FHE Game Logo"
              className="w-full h-full object-cover p-1"
            />
          </div>
          <span className="text-2xl font-pixel text-foreground tracking-tight">Optimized FHE Game</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </header>

      <main className="relative z-10 w-full max-w-2xl mx-auto py-20">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-pixel text-foreground mb-4 neon-text">Game Revealed!</h1>
          <p className="text-lg text-muted-foreground">See the outcome of the FHE-powered guessing game.</p>
        </div>

        <Card className="p-8 space-y-6 text-center">
          <CardHeader className="p-0">
            {gameEnded ? (
              <>
                {isWinner ? (
                  <CardTitle className="text-4xl font-pixel text-neonTeal neon-glow-text">YOU WIN 🎉</CardTitle>
                ) : (
                  <CardTitle className="text-4xl font-pixel text-neonMagenta neon-glow-text">TRY AGAIN 😅</CardTitle>
                )}
                {/* Pixel vault animation placeholder */}
                <div className="w-24 h-24 mx-auto my-4 bg-gray-800 flex items-center justify-center pixel-border animate-pulse">
                  <Unlock className="w-12 h-12 text-neonCyan" />
                </div>
              </>
            ) : (
              <CardTitle className="text-3xl font-pixel text-neonCyan">Waiting for Reveal...</CardTitle>
            )}
          </CardHeader>

          {gameEnded && (
            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-pixel">Player 1 Choice:</p>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="font-pixel text-foreground text-xl">{revealedDetails.player1Choice.toString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-pixel">Player 2 Guess:</p>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="font-pixel text-foreground text-xl">{revealedDetails.player2Guess.toString()}</span>
                  </div>
                </div>
              </div>

              <div className="pixel-border-teal p-4 text-center mt-6">
                <p className="text-lg font-pixel text-neonCyan">Total Prize Pool:</p>
                <p className="text-3xl font-pixel text-foreground">{formatEther(revealedDetails.betAmount * 2n)} ETH</p>
              </div>

              {isWinner && revealedDetails.status !== CONTRACT_CONFIG.GameStatus.PrizeClaimed && (
                <Button
                  onClick={handleClaimPrize}
                  disabled={isClaiming || isClaimPending || isClaimConfirming}
                  className="w-full text-lg py-3 mt-6 neon-glow-button"
                  size="lg"
                >
                  {isClaiming || isClaimPending || isClaimConfirming ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="h-5 w-5 mr-2" />
                  )}
                  {isClaiming ? 'Claiming...' : isClaimConfirming ? 'Confirming...' : 'Claim Prize'}
                </Button>
              )}
               {!isWinner && isPlayer && (
                <p className="text-sm text-muted-foreground mt-4">
                  Better luck next time! The prize goes to the winner.
                </p>
              )}
              {revealedDetails.status === CONTRACT_CONFIG.GameStatus.PrizeClaimed && (
                <p className="text-sm text-neonTeal mt-4">
                  Prize has already been claimed!
                </p>
              )}
            </CardContent>
          )}
        </Card>
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lobby
          </Button>
        </div>
      </main>
    </div>
  );
}