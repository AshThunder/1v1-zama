import { Link } from "react-router-dom";
import { WalletConnect } from '@/components/ui/wallet-connect';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Users, Trophy, ChevronRight, TwitterIcon, GithubIcon, Play } from "lucide-react";

const LandingPage = () => {


  const advantages = [
    {
      icon: Shield,
      title: "Fully Homomorphic Encryption",
      description: "Zama's cutting-edge FHE allows computation on encrypted data without ever revealing your choices."
    },
    {
      icon: Lock,
      title: "On-Chain Privacy",
      description: "Your moves stay encrypted on the blockchain while smart contracts determine winners through cryptographic proofs."
    },
    {
      icon: Users,
      title: "Trustless Competition",
      description: "No trusted third parties needed - FHE mathematics guarantee fair play without revealing strategies."
    },
    {
      icon: Trophy,
      title: "Cryptographic Verification",
      description: "Winners determined by zero-knowledge proofs with automatic smart contract payouts."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10">
              <img
                src="/uninum.png"
                alt="Optimized FHE Game Logo"
                className="w-full h-full object-cover p-1"
              />
            </div>
            <span className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">1v1 Guessing Game</span>
          </div>
          
          {/* Mobile wallet - positioned to the right on mobile */}
          <div className="sm:hidden">
            <WalletConnect variant="mobile" />
          </div>
        </div>
        
        {/* Desktop wallet - positioned to the left */}
        <div className="hidden sm:flex items-center">
          <WalletConnect variant="default" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span className="text-sm font-semibold text-primary">Powered by Zama FHE Technology</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-foreground">
              1v1 Encrypted
              <span className="block text-primary">Guessing Challenge</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Challenge opponents in the ultimate guessing game where you pick 1 or 2, and they try to guess your choice. Powered by Zama's FHE technology, your numbers stay completely private until the winner is revealed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/create-game" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
                >
                  Create Game
                </Button>
              </Link>
              <Link to="/join-game" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg"
                >
                  Join Game
                </Button>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">FHE</div>
                <div className="text-sm text-muted-foreground">Encrypted Computation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">0%</div>
                <div className="text-sm text-muted-foreground">Platform Fees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Cryptographic Security</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Revolutionary FHE Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on Zama's breakthrough in fully homomorphic encryption - the first practical solution for private computation on public blockchains.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <advantage.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{advantage.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Battle Process Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              How FHE Gaming Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience the magic of computing on encrypted data with these three steps
            </p>
          </div>
          
          <div className="space-y-8 sm:space-y-12">
            {[
              {
                step: "01",
                title: "FHE Encrypt Your Choice",
                description: "Your number is encrypted client-side using Zama's FHE SDK. The encrypted data goes on-chain while your choice stays private.",
                action: "Client Encryption"
              },
              {
                step: "02", 
                title: "On-Chain Computation",
                description: "Smart contracts compare encrypted numbers without decryption. FHE enables computation on ciphertext directly.",
                action: "Homomorphic Ops"
              },
              {
                step: "03",
                title: "Cryptographic Proof",
                description: "Only the winner result is decrypted and revealed. Your original choices remain forever private on the blockchain.",
                action: "Zero-Knowledge Result"
              }
            ].map((phase, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8 bg-background rounded-2xl border border-border"
              >
                <div className="flex-shrink-0 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-2xl font-bold text-primary-foreground mb-4">
                    {phase.step}
                  </div>
                  <div className="px-4 py-2 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">{phase.action}</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{phase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              Ready to Experience True Privacy?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be among the first to experience fully homomorphic encryption in gaming. Your moves stay private while smart contracts determine winners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-game" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
                >
                  Create Game
                </Button>
              </Link>
              <Link to="/my-games" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg"
                >
                  View Game History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-primary/20">
                <img
                  src="/uninum.png"
                  alt="Optimized FHE Game Logo"
                  className="w-full h-full object-cover p-1"
                />
              </div>
              <span className="text-xl font-extrabold text-foreground">1v1 Guessing Game</span>
            </div>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              The ultimate 1v1 guessing game where you choose 1 or 2, and your opponent tries to match your pick. Built with Zama's FHE technology to keep your choices completely private until results are revealed.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8">
              <a
                href="https://x.com/ChrisGold__"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <TwitterIcon className="w-5 h-5" />
                <span>Follow Updates</span>
              </a>
              <a
                href="https://github.com/AshThunder/1v1-zama"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <GithubIcon className="w-5 h-5" />
                <span>View Source</span>
              </a>
            </div>
            
            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                © 2025. Powered by Zama's Fully Homomorphic Encryption technology.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;