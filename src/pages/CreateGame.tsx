import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GameCard } from '@/components/ui/game-card';
import { toast } from 'sonner';
import { ArrowLeft, Gamepad2, Shield, Coins, ChevronRight, Lock } from 'lucide-react';
import { useCreateFHEGame, CreateFHEGameParams } from '../hooks/contract/useGameContract';
import { cn } from '@/lib/utils';
import { FHELogger } from '@/components/ui/fhe-logger';

export default function CreateGame() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [choice, setChoice] = useState<string>('1');
  const [betAmount, setBetAmount] = useState<string>('0.01');
  const [isCreating, setIsCreating] = useState(false);
  const [showFHELogs, setShowFHELogs] = useState(false);

  const { createGame, isCreating: isContractCreating, isSuccess: isCreateSuccess, error: createError } = useCreateFHEGame();

  const handleCreateGame = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    try {
      setIsCreating(true);
      setShowFHELogs(true);
      toast.info('Encrypting your choice with FHE...');
      
      console.log(`Encrypting choice: ${choice} for contract: ${address}`);
      console.log('Initializing FHE SDK from CDN...');
      
      const params: CreateFHEGameParams = {
        choice: parseInt(choice),
        betAmount: betAmount
      };
      
      await createGame(params);
      
      toast.success('Game creation transaction submitted!');
    } catch (error: unknown) {
      console.error('Error creating game:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create game');
      } else {
        toast.error('Failed to create game due to an unknown error.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  React.useEffect(() => {
    if (isCreateSuccess) {
      toast.success('Game created successfully!');
      navigate('/');
    }
  }, [isCreateSuccess, navigate]);

  React.useEffect(() => {
    if (createError) {
      console.error('Create game error:', createError);
      toast.error('Failed to create game');
    }
  }, [createError]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
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

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8"> {/* Added padding-bottom for mobile nav */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-9 h-9 text-electric-cyan" />
              <h1 className="text-4xl font-pixel text-foreground">Create New Game</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Choose your secret number and set your bet. Your choice will be encrypted on-chain!
            </p>
          </div>

          <Card className="p-8 space-y-8 bg-card shadow-neon-medium border-neon-border rounded-lg">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-pixel text-electric-cyan">
                <div className="w-10 h-10 bg-electric-cyan flex items-center justify-center text-charcoal-navy rounded-full shadow-neon-light">
                  <Shield className="w-5 h-5" />
                </div>
                Game Configuration
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Set up your privacy-preserving guessing game.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              {/* Step 1: Pick a secret number */}
              <div className="space-y-3">
                <Label className="text-base font-pixel text-vibrant-magenta">Step 1: Pick a secret number</Label>
                <ToggleGroup
                  type="single"
                  value={choice}
                  onValueChange={(value) => value && setChoice(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <ToggleGroupItem value="1" asChild>
                    <GameCard
                      variant={choice === '1' ? 'selected' : 'default'}
                      className={cn(
                        "h-36 text-5xl flex flex-col justify-center items-center p-4 cursor-pointer transition-all duration-200",
                        choice === '1' ? "shadow-neon-medium border-electric-cyan glow-on" : "border-muted-foreground hover:border-electric-cyan"
                      )}
                    >
                      <span>1</span>
                      <span className="text-sm font-bold text-foreground mt-1">Choose this number</span>
                    </GameCard>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="2" asChild>
                    <GameCard
                      variant={choice === '2' ? 'selected' : 'default'}
                      className={cn(
                        "h-36 text-5xl flex flex-col justify-center items-center p-4 cursor-pointer transition-all duration-200",
                        choice === '2' ? "shadow-neon-medium border-electric-cyan glow-on" : "border-muted-foreground hover:border-electric-cyan"
                      )}
                    >
                      <span>2</span>
                      <span className="text-sm font-bold text-foreground mt-1">Choose this number</span>
                    </GameCard>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Step 2: Enter bet amount */}
              <div className="space-y-3">
                <Label htmlFor="betAmount" className="text-base font-pixel text-vibrant-magenta flex items-center gap-2">
                  <Coins className="w-5 h-5 text-electric-cyan" />
                  Step 2: Enter bet amount (ETH)
                </Label>
                <Input
                  id="betAmount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.01"
                  className="text-lg bg-input border-neon-border focus:ring-electric-cyan focus:border-electric-cyan shadow-neon-light"
                />
                <p className="text-sm text-muted-foreground">
                  💰 Winner takes all - no platform fees!
                </p>
              </div>

              {/* Step 3: Encryption block */}
              <div className="space-y-3">
                <Label className="text-base font-pixel text-vibrant-magenta">Step 3: Encryption</Label>
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg shadow-inner border border-neon-border">
                  {isCreating ? (
                    <div className="flex items-center text-electric-cyan glow-on">
                      <Lock className="w-5 h-5 mr-2 animate-pulse" /> Encrypting...
                    </div>
                  ) : (
                    <div className="flex items-center text-green-400">
                      <Shield className="w-5 h-5 mr-2" /> Secured ✅
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Lock className="w-4 h-4 text-electric-cyan" /> Your choice is encrypted on-chain with Zama FHE.
                </p>
              </div>

              {/* CTA: Create Game Button */}
              <Button
                onClick={handleCreateGame}
                disabled={!isConnected || isCreating || isContractCreating}
                className="w-full text-lg py-3 font-pixel bg-electric-cyan text-charcoal-navy hover:bg-electric-cyan/90 shadow-neon-medium hover:shadow-neon-strong transition-all duration-300"
                size="lg"
              >
                {isCreating || isContractCreating ? (
                  <div className="flex items-center glow-on">
                    <Lock className="w-5 h-5 mr-2 animate-pulse" /> 
                    {isCreating ? 'Encrypting Choice...' : 'Creating Game...'}
                  </div>
                ) : (
                  `CREATE GAME`
                )}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>

              {!isConnected && (
                <p className="text-center text-sm text-muted-foreground">
                  Please connect your wallet to create a game
                </p>
              )}
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
