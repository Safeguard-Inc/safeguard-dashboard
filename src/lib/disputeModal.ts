/**
 * disputeModal.ts
 *
 * Domain logic, decision routing, and validation for escrow dispute arbitration.
 */

export type DisputeResolutionDecision = 'release_to_recipient' | 'refund_to_sender';

export interface DisputeDetails {
  escrowId: number;
  sender: string;
  recipient: string;
  amount: string;
  token: string;
  reason?: string;
  disputeDate: number;
}

export interface ArbitrationValidationResult {
  isValid: boolean;
  targetAddress: string;
  actionText: string;
  amount: string;
  token: string;
}

export function getResolutionActionLabel(decision: DisputeResolutionDecision): string {
  return decision === 'release_to_recipient'
    ? 'Release Funds to Recipient'
    : 'Refund Funds to Sender';
}

export function formatDisputeSummary(details: DisputeDetails): string {
  const shortSender = details.sender.slice(0, 4) + '...' + details.sender.slice(-4);
  const shortRecipient = details.recipient.slice(0, 4) + '...' + details.recipient.slice(-4);
  return `Escrow #${details.escrowId}: ${details.amount} ${details.token} (${shortSender} -> ${shortRecipient})`;
}

export function validateArbitrationResolution(
  details: DisputeDetails,
  decision: DisputeResolutionDecision
): ArbitrationValidationResult {
  const isValid = details.escrowId > 0 && Number(details.amount) > 0;
  const targetAddress = decision === 'release_to_recipient' ? details.recipient : details.sender;
  const actionText = getResolutionActionLabel(decision);

  return {
    isValid,
    targetAddress,
    actionText,
    amount: details.amount,
    token: details.token,
  };
}
