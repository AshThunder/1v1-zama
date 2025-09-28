import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Coins, Trophy, CheckCircle, Clock, Users, Eye, RefreshCcw } from 'lucide-react';
import { CONTRACT_CONFIG, getGameStatusText } from '@/contracts/config';
import { config } from '@/config/wagmi';
import OptimizedFHEGameABI from '@/contracts/OptimizedFHEGame.json';
import { cn } from '@/lib/utils';
import { 
  useGetGame, 
  useDidIWin, 
  usePrizePool, 
  useClaimPrize, 
  useConcludeGame 
} from '../hooks/contract/useGameContract';

interface GameDetails {
  gameId: bigint;
  player1: string;
  player2: string;
  betAmount: bigint;
  status: number;
  winner: string;
  createdAt: bigint;
}

interface ClaimModalProps {
  gameId: bigint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ClaimModal({ gameId, isOpen, onClose, onSuccess }: ClaimModalProps) {
  const { address } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [justRevealed, setJustRevealed] = useState(false);

  const { game: gameDetails, isLoading: isGameDetailsLoading, refetch } = useGetGame(gameId);
  const { didWin, refetch: refetchDidWin } = useDidIWin(gameId);
  const { prizeAmount: prizePoolAmount, refetch: refetchPrizePool } = usePrizePool(gameId);
  const { claimPrize, isClaiming: isClaimingPrize, isSuccess: isClaimSuccess, error: claimError } = useClaimPrize();
  const { concludeGame, isConcluding, isSuccess: isConcludeSuccess } = useConcludeGame();

  useEffect(() => {
    if (gameDetails && gameDetails.status === CONTRACT_CONFIG.GameStatus.Challenged) {
      setAutoRefresh(true);
      const interval = setInterval(() => {
        refetch();
        refetchDidWin();
        refetchPrizePool();
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setAutoRefresh(false);
    }
  }, [gameDetails, refetch, refetchDidWin, refetchPrizePool]);

  useEffect(() => {
    if (gameDetails && gameDetails.status === CONTRACT_CONFIG.GameStatus.Revealed && autoRefresh) {
      toast.success('🎉 Game results are now available!');
      setAutoRefresh(false);
      setJustRevealed(true);
      setTimeout(() => setJustRevealed(false), 3000);
    }
  }, [gameDetails?.status, autoRefresh]);

  useEffect(() => {
    if (isClaimSuccess) {
      toast.success('Prize claimed successfully!');
      onSuccess();
      onClose();
    }
    if (claimError) {
      toast.error(`Claim failed: ${claimError.message}`);
    }
  }, [isClaimSuccess, claimError, onSuccess, onClose]);

  const handleClaimPrize = async () => {
    if (!address || !gameDetails) return;
    
    try {
      setIsClaiming(true);
      toast.info('Claiming prize...');
      await claimPrize(gameId);
    } catch (err: unknown) {
      console.error('Error claiming prize:', err);
      toast.error(`Failed to claim prize: ${(err as Error).message || 'Unknown error'}`);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleConcludeGame = async () => {
    try {
      toast.info('Re-requesting game conclusion...');
      await concludeGame(gameId);
      toast.success('Conclusion request submitted!');
    } catch (err: unknown) {
      console.error('Error concluding game:', err);
      toast.error(`Failed to conclude game: ${(err as Error).message || 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  const isWinner = gameDetails?.winner === address;
  const prizeAmount = gameDetails ? formatEther(gameDetails.betAmount * 2n) : '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card shadow-neon-strong border-neon-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-pixel text-electric-cyan">
              <Trophy className="w-6 h-6" />
              Game #{gameId.toString()} Results
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGameDetailsLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading game details...</p>
            </div>
          ) : (
            <>
              {/* Game Result Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg border border-neon-border">
                  <p className="text-sm font-pixel text-vibrant-magenta">Player 1 Choice</p>
                  <p className="text-4xl font-bold text-foreground mt-2">?</p>
                  {gameDetails?.winner === gameDetails?.player1 && (
                    <span className="text-electric-cyan text-sm mt-1">WINNER</span>
                  )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-neon-border">
                  <p className="text-sm font-pixel text-vibrant-magenta">Player 2 Guess</p>
                  <p className="text-4xl font-bold text-foreground mt-2">?</p>
                  {gameDetails?.winner === gameDetails?.player2 && (
                    <span className="text-electric-cyan text-sm mt-1">WINNER</span>
                  )}
                </div>
              </div>

              {/* Prize Pool */}
              <div className="p-4 bg-muted/50 rounded-lg border border-neon-border text-center">
                <p className="text-base font-pixel text-electric-cyan">Total Prize Pool</p>
                <p className="text-3xl font-bold text-foreground mt-2 flex items-center justify-center gap-2">
                  <Coins className="w-6 h-6 text-vibrant-magenta" /> 
                  {prizePoolAmount ? formatEther(prizePoolAmount) : prizeAmount} ETH
                </p>
              </div>

              {/* Status Messages */}
              {gameDetails?.status === CONTRACT_CONFIG.GameStatus.Challenged && (
                <div className="p-6 bg-gradient-to-r from-vibrant-magenta/20 to-electric-cyan/20 rounded-lg border border-vibrant-magenta text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-6 h-6 border-2 border-electric-cyan border-t-transparent rounded-full animate-spin"></div>
                    <h3 className="text-xl font-bold text-electric-cyan">Processing Results...</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    FHE decryption in progress. Winner will be able to claim prize when complete.
                  </p>
                  <Button
                    onClick={handleConcludeGame}
                    disabled={isConcluding}
                    variant="outline"
                    className="text-sm"
                  >
                    {isConcluding ? 'Re-requesting...' : 'Check Now'}
                  </Button>
                </div>
              )}

              {gameDetails?.status === CONTRACT_CONFIG.GameStatus.Revealed && (
                <div className="p-6 bg-gradient-to-r from-electric-cyan/20 to-vibrant-magenta/20 rounded-lg border border-electric-cyan text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Trophy className="w-8 h-8 text-electric-cyan animate-bounce" />
                    <h3 className="text-2xl font-bold text-electric-cyan">GAME COMPLETE!</h3>
                    <Trophy className="w-8 h-8 text-electric-cyan animate-bounce" />
                  </div>
                  {isWinner ? (
                    <>
                      <p className="text-lg text-foreground mb-2">🎉 Congratulations! You won!</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Prize of <span className="text-electric-cyan font-bold">{prizePoolAmount ? formatEther(prizePoolAmount) : prizeAmount} ETH</span> is ready to claim!
                      </p>
                      {prizePoolAmount && prizePoolAmount > 0n && (
                        <Button
                          onClick={handleClaimPrize}
                          disabled={isClaiming || isClaimingPrize}
                          className={cn(
                            "w-full text-lg py-3 font-pixel bg-electric-cyan text-charcoal-navy hover:bg-electric-cyan/90 shadow-neon-medium hover:shadow-neon-strong transition-all duration-300",
                            justRevealed && "animate-bounce shadow-neon-strong bg-gradient-to-r from-electric-cyan to-vibrant-magenta"
                          )}
                          size="lg"
                        >
                          {isClaiming || isClaimingPrize ? (
                            <div className="flex items-center">
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Claiming...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Trophy className="w-5 h-5 mr-2" /> CLAIM PRIZE
                            </div>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-lg text-foreground mb-2">Game Over</p>
                      <p className="text-sm text-muted-foreground">
                        Better luck next time! The winner can claim their prize.
                      </p>
                    </>
                  )}
                </div>
              )}

              {gameDetails?.status === CONTRACT_CONFIG.GameStatus.PrizeClaimed && (
                <div className="p-6 bg-gradient-to-r from-green-500/20 to-electric-cyan/20 rounded-lg border border-green-500 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-500">Prize Claimed!</h3>
                  <p className="text-sm text-muted-foreground">
                    The prize has been successfully claimed and transferred.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyGames() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [myGames, setMyGames] = useState<GameDetails[]>([]);
  const [claimableGames, setClaimableGames] = useState<GameDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState<bigint | null>(null);

  // Fetch total game count
  const { data: gameCount } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: OptimizedFHEGameABI.abi,
    functionName: 'gameCounter',
    query: {
      refetchInterval: 5000, // Refresh every 5 seconds to check for new games
    }
  });

  // Fetch user's games
  useEffect(() => {
    const fetchMyGames = async () => {
      if (!gameCount || !address) {
        setIsLoading(false);
        return;
      }

      try {
        const games: GameDetails[] = [];
        const totalGames = Number(gameCount);

        // Check if there are any games to fetch
        if (totalGames === 0) {
          setMyGames([]);
          setClaimableGames([]);
          return;
        }

        console.log(`Fetching ${totalGames} games for user ${address}`);
        
        // Fetch each game's details from the contract (starting from 0)
        for (let i = 0; i < totalGames; i++) {
          try {
            console.log(`Fetching game ${i}...`);
            // Use readContract to get game details from games mapping
            const gameDetails = await readContract(config, {
              address: CONTRACT_CONFIG.address,
              abi: OptimizedFHEGameABI.abi,
              functionName: 'games',
              args: [BigInt(i)],
            });

            console.log(`Game ${i} details:`, gameDetails);

            if (gameDetails) {
              const [gameId, player1, player2, betAmount, status, player1Choice, player2Guess, winner, createdAt] = gameDetails;
              
              console.log(`Game ${i} - Player1: ${player1}, Player2: ${player2}, Current User: ${address}`);
              
              // Only include games where current user is involved
              if (player1.toLowerCase() === address.toLowerCase() || 
                  (player2 && player2.toLowerCase() === address.toLowerCase())) {
                
                console.log(`Adding game ${i} to user's games`);
                games.push({
                  gameId: gameId,
                  player1,
                  player2,
                  betAmount,
                  status,
                  winner,
                  createdAt,
                });
              } else {
                console.log(`Game ${i} doesn't involve current user`);
              }
            } else {
              console.log(`Game ${i} returned no details`);
            }
          } catch (error) {
            console.error(`Error fetching game ${i}:`, error);
            // Continue to next game if one fails
          }
        }

        // Filter claimable games (user is winner and status is Revealed)
        const claimable = games.filter(game => 
          game.winner.toLowerCase() === address.toLowerCase() && 
          game.status === CONTRACT_CONFIG.GameStatus.Revealed
        );

        setMyGames(games);
        setClaimableGames(claimable);
      } catch (error) {
        console.error('Error fetching games:', error);
        toast.error('Failed to load your games');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyGames();
  }, [gameCount, address]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-xl font-pixel text-muted-foreground mb-6">Connect your wallet to view your games</p>
        <Button onClick={() => navigate('/')} className="font-pixel">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-xl font-pixel">Loading your games...</p>
      </div>
    );
  }

  const getStatusBadge = (status: number, winner: string, userAddress: string) => {
    switch (status) {
      case CONTRACT_CONFIG.GameStatus.WaitingForChallenger:
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Waiting</Badge>;
      case CONTRACT_CONFIG.GameStatus.Challenged:
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Processing</Badge>;
      case CONTRACT_CONFIG.GameStatus.Revealed:
        if (winner.toLowerCase() === userAddress.toLowerCase()) {
          return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Won - Claim Prize!</Badge>;
        } else {
          return <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">Lost</Badge>;
        }
      case CONTRACT_CONFIG.GameStatus.PrizeClaimed:
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <main className="relative z-10 container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-9 h-9 text-electric-cyan" />
              <h1 className="text-4xl font-pixel text-foreground">My Games</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Track your game history and claim your winnings
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-card shadow-neon-light border-neon-border rounded-lg text-center hover:shadow-neon-medium transition-all duration-300">
              <div className="text-2xl font-bold text-electric-cyan">{claimableGames.length}</div>
              <div className="text-sm text-muted-foreground">Prizes to Claim</div>
            </Card>
            <Card className="p-4 bg-card shadow-neon-light border-neon-border rounded-lg text-center hover:shadow-neon-medium transition-all duration-300">
              <div className="text-2xl font-bold text-vibrant-magenta">{myGames.length}</div>
              <div className="text-sm text-muted-foreground">Total Games</div>
            </Card>
            <Card className="p-4 bg-card shadow-neon-light border-neon-border rounded-lg text-center hover:shadow-neon-medium transition-all duration-300">
              <div className="text-2xl font-bold text-foreground">
                {myGames.filter(g => g.winner.toLowerCase() === address?.toLowerCase()).length}
              </div>
              <div className="text-sm text-muted-foreground">Games Won</div>
            </Card>
          </div>

          {/* Claimable Prizes Section */}
          {claimableGames.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-pixel text-electric-cyan mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Prizes Ready to Claim
              </h2>
              <div className="grid gap-4">
                {claimableGames.map((game) => (
                  <Card key={game.gameId.toString()} className="p-4 bg-card shadow-neon-medium border-neon-border rounded-lg border-l-4 border-l-electric-cyan">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-pixel text-electric-cyan">
                            Game #{game.gameId.toString()}
                          </h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            🏆 Winner!
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Prize: <span className="font-bold text-foreground">{formatEther(game.betAmount * 2n)} ETH</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedGameId(game.gameId)}
                        className="font-pixel bg-electric-cyan text-charcoal-navy hover:bg-electric-cyan/90 shadow-neon-medium hover:shadow-neon-strong transition-all duration-300"
                      >
                        Claim Prize
                        <Coins className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Games Section */}
          <div>
            <h2 className="text-2xl font-pixel text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Game History
            </h2>

            {myGames.length === 0 ? (
              <Card className="p-8 text-center bg-card shadow-neon-medium border-neon-border rounded-lg">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-2xl font-pixel text-muted-foreground mb-4">
                  No Games Yet
                </CardTitle>
                <p className="text-lg text-muted-foreground mb-6">
                  You haven't played any games yet. Start your first game now!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/create-game')}
                    className="font-pixel bg-electric-cyan text-charcoal-navy hover:bg-electric-cyan/90"
                  >
                    Create New Game
                  </Button>
                  <Button
                    onClick={() => navigate('/join-game')}
                    variant="outline"
                    className="font-pixel border-neon-border hover:bg-muted/50"
                  >
                    Join Existing Game
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myGames.map((game) => (
                  <Card key={game.gameId.toString()} className="p-4 bg-card shadow-neon-light border-neon-border rounded-lg hover:shadow-neon-medium transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-pixel text-foreground">
                            Game #{game.gameId.toString()}
                          </h3>
                          {getStatusBadge(game.status, game.winner, address || '')}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Bet Amount</p>
                            <p className="font-bold text-foreground">{formatEther(game.betAmount)} ETH</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Your Role</p>
                            <p className="font-bold text-foreground">
                              {game.player1.toLowerCase() === address?.toLowerCase() ? 'Creator' : 'Challenger'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-bold text-foreground">
                              {new Date(Number(game.createdAt) * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {(game.status === CONTRACT_CONFIG.GameStatus.Revealed || 
                          game.status === CONTRACT_CONFIG.GameStatus.Challenged ||
                          game.status === CONTRACT_CONFIG.GameStatus.PrizeClaimed) && (
                          <Button
                            onClick={() => setSelectedGameId(game.gameId)}
                            className={cn(
                              "font-pixel",
                              game.status === CONTRACT_CONFIG.GameStatus.Revealed && 
                              game.winner.toLowerCase() === address?.toLowerCase()
                                ? "bg-vibrant-magenta text-charcoal-navy hover:bg-vibrant-magenta/90"
                                : "bg-electric-cyan text-charcoal-navy hover:bg-electric-cyan/90"
                            )}
                            size="sm"
                          >
                            {game.status === CONTRACT_CONFIG.GameStatus.Revealed && 
                             game.winner.toLowerCase() === address?.toLowerCase()
                              ? "Claim Prize"
                              : "View Results"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="font-pixel border-neon-border hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </div>
        </div>
      </main>

      {/* Claim Modal */}
      {selectedGameId && (
        <ClaimModal
          gameId={selectedGameId}
          isOpen={true}
          onClose={() => setSelectedGameId(null)}
          onSuccess={() => {
            // Refresh games list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
