import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GameCard } from '@/components/ui/game-card';
import { ArrowLeft, Target, Shield, Coins, Users, Clock, Loader2, Lock, ChevronRight, Gamepad } from 'lucide-react';
import { CONTRACT_CONFIG, getGameStatusText } from '../contracts/config';
import { 
  useGetGameCount, 
  useGetGame, 
  useChallengeGame,
  useGetActiveGames,
  OptimizedGame 
} from '../hooks/contract/useGameContract';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FHELogger } from '@/components/ui/fhe-logger';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface GameListItem {
  id: number;
  gameId: bigint;
  player1: string;
  player2: string;
  betAmount: bigint;
  status: number;
  winner: string;
  timestamp: bigint;
}

export default function JoinGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [guess, setGuess] = useState<string>('1');
  const [isJoining, setIsJoining] = useState(false);
  const [showFHELogs, setShowFHELogs] = useState(false);

  // Pre-fill game ID if provided in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const gameIdFromUrl = queryParams.get('gameId');
    if (gameIdFromUrl) {
      setSelectedGameId(gameIdFromUrl);
    }
  }, [location.search]);

  // Use new hooks
  const { gameCount } = useGetGameCount();
  const { game: gameDetails, refetch: refetchGameDetails } = useGetGame(
    selectedGameId ? BigInt(selectedGameId) : undefined
  );
  const { challengeGame, isChallenging, isSuccess: isChallengeSuccess, error: challengeError } = useChallengeGame();

  // Use the fixed useGetActiveGames hook
  const { data: availableGames, isLoading: gamesLoading, refetch: refetchGames } = useGetActiveGames();

  const handleJoinGame = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedGameId) {
      toast.error('Please select a game to join');
      return;
    }

    if (!gameDetails) {
      toast.error('Game details not loaded');
      return;
    }

    try {
      setIsJoining(true);
      setShowFHELogs(true);
      toast.info('Encrypting your guess with FHE...');
      
      console.log(`Encrypting guess: ${guess} for game: ${selectedGameId}`);
      console.log('Initializing FHE SDK from CDN...');
      
      const guessValue = parseInt(guess);
      const betAmount = formatEther(gameDetails.betAmount);
      
      await challengeGame(BigInt(selectedGameId), guessValue, betAmount);
      
      toast.success('Challenge transaction submitted!');
    } catch (error: unknown) {
      console.error('Error joining game:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to join game');
      } else {
        toast.error('Failed to join game due to an unknown error.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    if (isChallengeSuccess) {
      toast.success('Successfully joined game!');
      navigate('/');
    }
  }, [isChallengeSuccess, navigate]);

  useEffect(() => {
    if (challengeError) {
      console.error('Challenge error:', challengeError);
      toast.error('Failed to challenge game');
    }
  }, [challengeError]);

  const getGameStatusText = (status: number) => {
    switch (status) {
      case CONTRACT_CONFIG.GameStatus.WaitingForChallenger:
        return 'Waiting for Challenger';
      case CONTRACT_CONFIG.GameStatus.Challenged:
        return 'Processing Results';
      case CONTRACT_CONFIG.GameStatus.Revealed:
        return 'Results Available';
      case CONTRACT_CONFIG.GameStatus.PrizeClaimed:
        return 'Completed';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Gradients - same as CreateGame */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Header - Hidden on mobile, shown as buttons on desktop */}
      <header className="container mx-auto px-4 py-6 md:flex items-center justify-between hidden">
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
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-foreground hover:text-electric-cyan hover:bg-transparent text-lg"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/create-game')}
            className="text-primary-cyan hover:text-electric-cyan hover:bg-transparent text-lg"
          >
            Create Game
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/join-game')}
            className="text-vibrant-magenta hover:text-vibrant-magenta hover:bg-transparent text-lg"
          >
            Make a Guess
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/my-games')}
            className="text-primary-cyan hover:text-electric-cyan hover:bg-transparent text-lg"
          >
            My Games
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-9 h-9 text-electric-cyan" />
              <h1 className="text-4xl font-pixel text-foreground">Make a Guess</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Find an open game and try to guess the secret number!
            </p>
          </div>

          <Card className="p-8 space-y-8 bg-card shadow-neon-medium border-neon-border rounded-lg">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-pixel text-electric-cyan">
                <div className="w-10 h-10 bg-electric-cyan flex items-center justify-center text-charcoal-navy rounded-full shadow-neon-light">
                  <Gamepad className="w-5 h-5" />
                </div>
                Game Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Select a game and make your move.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              {/* Game summary card (Game ID, bet, status) */}
              {selectedGameId && gameDetails ? (
                <Card className="p-5 bg-muted/50 pixel-corners-cyan shadow-neon-light">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-lg font-pixel text-electric-cyan">Game #{selectedGameId}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-0 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Coins className="w-4 h-4 text-vibrant-magenta" /> Bet Amount: <span className="font-pixel text-foreground">{gameDetails?.betAmount ? formatEther(gameDetails.betAmount) : '0'} ETH</span></p>
                    <p className="flex items-center gap-2"><Users className="w-4 h-4 text-vibrant-magenta" /> Creator: <span className="font-pixel text-foreground">{gameDetails?.player1?.substring(0, 6) || 'Unknown'}...</span></p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-vibrant-magenta" /> Status: <span className={`font-pixel ${getGameStatusText(gameDetails.status) === 'Waiting for Challenger' ? 'text-green-400' : 'text-red-400'}`}>{getGameStatusText(gameDetails.status)}</span></p>
                  </CardContent>
                </Card>
              ) : (
                <div className="bg-muted/50 p-4 text-center pixel-corners-magenta shadow-neon-light">
                  <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Select a game from the list below.</p>
                </div>
              )}

              {/* Game ID Input & Available Games */}
              <div className="space-y-3">
                <Label htmlFor="gameId" className="font-pixel text-vibrant-magenta">Game ID or Select from List</Label>
                <Input
                  id="gameId"
                  type="number"
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  placeholder="Enter game ID (e.g., 0)"
                  className="text-lg bg-input border-neon-border focus:ring-electric-cyan focus:border-electric-cyan shadow-neon-light"
                />
                <p className="text-sm text-muted-foreground">
                  Total games created: {gameCount?.toString() || '0'}
                </p>

                {gamesLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-electric-cyan" />
                    <span className="ml-2 text-muted-foreground">Loading games...</span>
                  </div>
                ) : availableGames.length > 0 ? (
                  <div className="bg-muted/50 p-4 space-y-2 max-h-48 overflow-y-auto pixel-corners-magenta">
                    {availableGames.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGameId(game.id.toString())}
                        className={`w-full text-left p-3 text-sm transition-colors duration-200 flex justify-between items-center pixel-corners-cyan ${
                          selectedGameId === game.id.toString()
                            ? 'bg-electric-cyan/20 text-foreground shadow-neon-light'
                            : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        <div>
                          <span className="font-pixel">Game #{game.id}</span>
                          <p className="text-xs text-muted-foreground">Creator: {game.player1.substring(0, 6)}...</p>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-pixel text-electric-cyan">
                          <Coins className="w-4 h-4" /> {formatEther(game.betAmount)} ETH
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 text-center pixel-corners-magenta shadow-neon-light">
                    <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No games available to join.</p>
                    <p className="text-xs text-muted-foreground mt-1">Create a game to get started!</p>
                  </div>
                )}
              </div>
              
              {/* Step 1: Choose guess (1 or 2) */}
              <div className="space-y-3">
                <Label className="text-base font-pixel text-vibrant-magenta">Step 1: Choose your guess</Label>
                <ToggleGroup
                  type="single"
                  value={guess}
                  onValueChange={(value) => value && setGuess(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <ToggleGroupItem value="1" asChild>
                    <GameCard
                      variant={guess === '1' ? 'selected' : 'default'}
                      className={cn(
                        "h-36 text-5xl flex flex-col justify-center items-center p-4 cursor-pointer transition-all duration-200",
                        guess === '1' ? "shadow-neon-medium border-electric-cyan glow-on" : "border-muted-foreground hover:border-electric-cyan"
                      )}
                    >
                      <span>1</span>
                      <span className="text-sm font-bold text-foreground mt-1">Guess this number</span>
                    </GameCard>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="2" asChild>
                    <GameCard
                      variant={guess === '2' ? 'selected' : 'default'}
                      className={cn(
                        "h-36 text-5xl flex flex-col justify-center items-center p-4 cursor-pointer transition-all duration-200",
                        guess === '2' ? "shadow-neon-medium border-electric-cyan glow-on" : "border-muted-foreground hover:border-electric-cyan"
                      )}
                    >
                      <span>2</span>
                      <span className="text-sm font-bold text-foreground mt-1">Guess this number</span>
                    </GameCard>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Step 2: Match bet amount */}
              <div className="space-y-3">
                <Label htmlFor="betAmount" className="text-base font-pixel text-vibrant-magenta flex items-center gap-2">
                  <Coins className="w-5 h-5 text-electric-cyan" />
                  Step 2: Match Bet Amount (ETH)
                </Label>
                <Input
                  id="betAmount"
                  type="text"
                  readOnly
                  value={gameDetails?.betAmount ? formatEther(gameDetails.betAmount) : '0'}
                  className="text-lg bg-muted border-neon-border focus:ring-electric-cyan focus:border-electric-cyan shadow-neon-light"
                />
                <p className="text-sm text-muted-foreground">
                  You must match the creator's bet to challenge.
                </p>
              </div>
              
              {/* CTA: Make Guess Button */}
              <Button
                onClick={handleJoinGame}
                disabled={isJoining || isChallenging || !selectedGameId || !gameDetails || gameDetails.status !== CONTRACT_CONFIG.GameStatus.WaitingForChallenger}
                className="w-full text-lg py-3 font-pixel bg-vibrant-magenta text-charcoal-navy hover:bg-vibrant-magenta/90 shadow-neon-medium hover:shadow-neon-strong transition-all duration-300"
                size="lg"
              >
                {isJoining || isChallenging ? (
                  <div className="flex items-center glow-on">
                    <Lock className="w-5 h-5 mr-2 animate-pulse" /> 
                    {isJoining ? 'Encrypting Guess...' : 'Challenging...'}
                  </div>
                ) : (
                  `MAKE GUESS`
                )}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>

              {!isConnected && (
                <p className="text-center text-sm text-muted-foreground">
                  Please connect your wallet to challenge a game.
                </p>
              )}

              {/* Warning Footer */}
              <p className="text-center text-sm text-red-400 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4" /> Your guess is encrypted and locked once submitted.
              </p>
            </CardContent>
          </Card>

          {/* FHE Encryption Logs */}
          {showFHELogs && (
            <div className="mt-6">
              <FHELogger 
                isVisible={showFHELogs} 
                className="max-w-2xl mx-auto"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
