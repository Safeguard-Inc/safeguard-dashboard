export interface DrawerSignerState {
  publicKey: string;
  weight: number;
  hasSigned: boolean;
}

export interface DrawerMultiSigTx {
  id: string;
  txXdr: string;
  operationLevel: 'low' | 'medium' | 'high';
  currentWeight: number;
  requiredWeight: number;
  isReady: boolean;
  signers: DrawerSignerState[];
}

export function calculateProgressPercentage(current: number, required: number): number {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((current / required) * 100));
}

export function canActiveUserSign(tx: DrawerMultiSigTx, userAddress?: string): boolean {
  if (!userAddress || tx.isReady) return false;
  const norm = userAddress.trim().toUpperCase();
  const signer = tx.signers.find((s) => s.publicKey.trim().toUpperCase() === norm);
  return Boolean(signer && !signer.hasSigned);
}

export function formatSigningThresholdBadge(tx: DrawerMultiSigTx): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  if (tx.isReady) {
    return {
      label: 'Threshold Met (Ready to Submit)',
      bgClass: 'bg-emerald-950/60 border border-emerald-800',
      textClass: 'text-emerald-300',
    };
  }
  return {
    label: `${tx.currentWeight} / ${tx.requiredWeight} Weights Collected`,
    bgClass: 'bg-amber-950/60 border border-amber-800',
    textClass: 'text-amber-300',
  };
}
