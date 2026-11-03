import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDisputeSummary,
  getResolutionActionLabel,
  validateArbitrationResolution,
} from '../src/lib/disputeModal.ts';
import type { DisputeDetails } from '../src/lib/disputeModal.ts';

describe('Dispute Modal Arbitration Domain Logic Tests', () => {
  const sampleDispute: DisputeDetails = {
    escrowId: 104,
    sender: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
    recipient: 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
    amount: '350',
    token: 'XLM',
    disputeDate: 1729000000,
  };

  it('formats dispute summary with abbreviated address bounds', () => {
    const summary = formatDisputeSummary(sampleDispute);
    assert.ok(summary.includes('Escrow #104'));
    assert.ok(summary.includes('350 XLM'));
    assert.ok(summary.includes('GC5M...ODW4'));
    assert.ok(summary.includes('GA6L...CVLT'));
  });

  it('resolves correct action labels for rulings', () => {
    assert.equal(getResolutionActionLabel('release_to_recipient'), 'Release Funds to Recipient');
    assert.equal(getResolutionActionLabel('refund_to_sender'), 'Refund Funds to Sender');
  });

  it('validates arbitration routing to recipient on release decision', () => {
    const result = validateArbitrationResolution(sampleDispute, 'release_to_recipient');
    assert.equal(result.isValid, true);
    assert.equal(result.targetAddress, sampleDispute.recipient);
    assert.equal(result.amount, '350');
    assert.equal(result.token, 'XLM');
    assert.equal(result.actionText, 'Release Funds to Recipient');
  });

  it('validates arbitration routing to sender on refund decision', () => {
    const result = validateArbitrationResolution(sampleDispute, 'refund_to_sender');
    assert.equal(result.isValid, true);
    assert.equal(result.targetAddress, sampleDispute.sender);
    assert.equal(result.actionText, 'Refund Funds to Sender');
  });

  it('flags invalid escrow records with non-positive amount or zero ID', () => {
    const invalidDispute: DisputeDetails = {
      ...sampleDispute,
      escrowId: 0,
      amount: '0',
    };
    const result = validateArbitrationResolution(invalidDispute, 'release_to_recipient');
    assert.equal(result.isValid, false);
  });
});
