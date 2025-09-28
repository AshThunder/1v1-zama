import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';
import LandingPage from "./pages/LandingPage";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import GameReveal from "./pages/GameReveal";
import MyGames from "./pages/MyGames";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react"
import { MobileNav } from "./components/ui/mobile-nav";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
                <main className="flex-1 pb-16 md:pb-0"> {/* Added padding-bottom for mobile nav */}
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/create-game" element={<CreateGame />} />
                    <Route path="/join-game" element={<JoinGame />} />
                    <Route path="/game-reveal/:gameId" element={<GameReveal />} />
                    <Route path="/my-games" element={<MyGames />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <MobileNav />
            </div>
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
