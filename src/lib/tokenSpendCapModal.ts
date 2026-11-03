export interface TokenSpendCapEntry {
  symbol: string;
  contractId: string;
  capAmountStroops?: string;
  isCustom: boolean;
}

export function formatCapDisplay(
  amountStroops?: string,
  defaultCapStroops: string = '1000000000'
): { text: string; isOverride: boolean } {
  if (amountStroops) {
    const units = Number(BigInt(amountStroops)) / 10_000_000;
    return {
      text: `${units.toLocaleString()} Units (Custom)`,
      isOverride: true,
    };
  }
  const defaultUnits = Number(BigInt(defaultCapStroops)) / 10_000_000;
  return {
    text: `${defaultUnits.toLocaleString()} Units (Default)`,
    isOverride: false,
  };
}

export function validateSpendCapInput(input: string): {
  isValid: boolean;
  error?: string;
  stroops?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Cap amount cannot be empty' };
  }

  const num = parseFloat(trimmed);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'Cap amount must be a positive number' };
  }

  try {
    const stroops = BigInt(Math.round(num * 10_000_000));
    return { isValid: true, stroops: stroops.toString() };
  } catch {
    return { isValid: false, error: 'Invalid numeric value' };
  }
}
