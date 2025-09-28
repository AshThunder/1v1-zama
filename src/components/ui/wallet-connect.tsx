import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletConnectProps {
  variant?: 'default' | 'mobile' | 'compact';
  className?: string;
}

export function WalletConnect({ variant = 'default', className }: WalletConnectProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className={cn("flex items-center gap-2", className)}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className={cn(
                      "font-pixel transition-all duration-300",
                      variant === 'mobile' && "text-xs px-3 py-2 h-8",
                      variant === 'compact' && "text-sm px-4 py-2 h-9",
                      variant === 'default' && "text-sm px-6 py-3 h-10"
                    )}
                  >
                    <Wallet className={cn(
                      "mr-2",
                      variant === 'mobile' && "w-3 h-3",
                      variant === 'compact' && "w-4 h-4", 
                      variant === 'default' && "w-4 h-4"
                    )} />
                    {variant === 'mobile' ? 'Connect' : 'Connect Wallet'}
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    className={cn(
                      "font-pixel",
                      variant === 'mobile' && "text-xs px-3 py-2 h-8",
                      variant === 'compact' && "text-sm px-4 py-2 h-9",
                      variant === 'default' && "text-sm px-6 py-3 h-10"
                    )}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Chain Selector */}
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    className={cn(
                      "font-pixel border-neon-border hover:bg-muted/50",
                      variant === 'mobile' && "text-xs px-2 py-1 h-8 min-w-0",
                      variant === 'compact' && "text-sm px-3 py-2 h-9",
                      variant === 'default' && "text-sm px-4 py-3 h-10"
                    )}
                  >
                    {chain.hasIcon && (
                      <div
                        className={cn(
                          "rounded-full overflow-hidden mr-2",
                          variant === 'mobile' && "w-3 h-3",
                          variant === 'compact' && "w-4 h-4",
                          variant === 'default' && "w-4 h-4"
                        )}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    )}
                    {variant === 'mobile' ? (
                      <span className="truncate max-w-[60px]">{chain.name}</span>
                    ) : (
                      chain.name
                    )}
                  </Button>

                  {/* Account Button */}
                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className={cn(
                      "font-pixel border-neon-border hover:bg-muted/50 flex items-center gap-2",
                      variant === 'mobile' && "text-xs px-2 py-1 h-8 min-w-0",
                      variant === 'compact' && "text-sm px-3 py-2 h-9",
                      variant === 'default' && "text-sm px-4 py-3 h-10"
                    )}
                  >
                    {variant === 'mobile' ? (
                      <>
                        <div className="w-3 h-3 bg-electric-cyan rounded-full"></div>
                        <span className="truncate max-w-[80px]">
                          {account.displayName}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-electric-cyan rounded-full"></div>
                        <span className="truncate max-w-[120px]">
                          {account.displayName}
                        </span>
                        {account.displayBalance && (
                          <span className="text-muted-foreground">
                            {account.displayBalance}
                          </span>
                        )}
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
