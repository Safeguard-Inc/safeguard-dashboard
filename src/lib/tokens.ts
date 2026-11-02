/**
 * tokens.ts
 *
 * Supported Stellar Asset Contract (SAC) tokens and metadata dictionary.
 */

export interface SupportedToken {
  symbol: string;
  name: string;
  sacAddress: string;
  decimals: number;
  icon: string;
}

export const SUPPORTED_TOKENS: Record<string, SupportedToken> = {
  XLM: {
    symbol: 'XLM',
    name: 'Native Lumens',
    sacAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    decimals: 7,
    icon: '✦',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin (Circle SAC)',
    sacAddress: 'CAQCFV4HYQ5CQN5Q6A5DGLWDF4774CG2C236DMCPOATOPMD7M7FD3U2B',
    decimals: 7,
    icon: '$',
  },
  EURC: {
    symbol: 'EURC',
    name: 'Euro Coin (Circle SAC)',
    sacAddress: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWPGF32X2O2GBU32VFB',
    decimals: 7,
    icon: '€',
  },
  PYUSD: {
    symbol: 'PYUSD',
    name: 'PayPal USD (SAC)',
    sacAddress: 'CD4NREK465452V2N3QHQG6J4W743RCEQY2C2W6A7R4RPOEFD4O2USAC4',
    decimals: 7,
    icon: 'P',
  },
};

export function getSupportedToken(symbol: string): SupportedToken {
  return SUPPORTED_TOKENS[symbol.toUpperCase()] || SUPPORTED_TOKENS.XLM;
}

