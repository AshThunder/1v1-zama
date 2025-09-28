// Game-related hooks
export {
  useGetGame,
  useGetActiveGames,
  useGetGameCount,
  useDidIWin,
  useGetGameResult,
  usePrizePool,
  useCreateFHEGame,
  useChallengeGame,
  useConcludeGame,
  useConsentRefund,
  useClaimPrize,
} from './useGameContract';

// Export types and configuration
export * from '@/contracts/config';