import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Zama FHE testnet (example configuration, adjust according to actual requirements)
export const zamaTestnet = defineChain({
  id: 8009,
  name: 'Zama FHE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.zama.ai'], // Example RPC, replace with actual URL
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.zama.ai' }, // Example explorer
  },
});

export const config = getDefaultConfig({
  appName: 'Number Verse Arena',
  projectId: 'YOUR_PROJECT_ID', // Get this from https://cloud.walletconnect.com
  chains: [sepolia, zamaTestnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});