import test from 'node:test';
import assert from 'node:assert/strict';
import {
  type DeadLetterItem,
  formatRelativeFailureTime,
  classifyErrorSeverity,
  filterDlqItems,
} from '../src/lib/webhookDlqDisplay.ts';

test('formatRelativeFailureTime formats elapsed seconds, minutes, hours, and days', () => {
  const now = 1700000000000;
  assert.equal(formatRelativeFailureTime(now - 15000, now), '15s ago');
  assert.equal(formatRelativeFailureTime(now - 120000, now), '2m ago');
  assert.equal(formatRelativeFailureTime(now - 7200000, now), '2h ago');
  assert.equal(formatRelativeFailureTime(now - 172800000, now), '2d ago');
});

test('classifyErrorSeverity categorizes network and server errors accurately', () => {
  const timeoutSev = classifyErrorSeverity('Connection timed out to client host');
  assert.equal(timeoutSev.label, 'Network Lag / Timeout');

  const serverSev = classifyErrorSeverity('HTTP status 503 Service Unavailable');
  assert.equal(serverSev.label, 'Server Fault (5xx)');

  const genericSev = classifyErrorSeverity('Invalid signature response');
  assert.equal(genericSev.label, 'Delivery Failure');
});

test('filterDlqItems matches substring across url, error, and subscriptionId', () => {
  const items: DeadLetterItem[] = [
    {
      subscriptionId: 'sub-alpha',
      url: 'https://api.partner.org/webhook',
      error: 'ECONNREFUSED 127.0.0.1:443',
      failedAt: 1700000000000,
      retryCount: 5,
      eventType: 'escrow.funded',
    },
    {
      subscriptionId: 'sub-beta',
      url: 'https://audit.bank.com/events',
      error: '504 Gateway Timeout',
      failedAt: 1700000010000,
      retryCount: 3,
      eventType: 'payment.disputed',
    },
  ];

  assert.equal(filterDlqItems(items, '').length, 2);
  assert.equal(filterDlqItems(items, 'partner').length, 1);
  assert.equal(filterDlqItems(items, 'partner')[0].subscriptionId, 'sub-alpha');
  assert.equal(filterDlqItems(items, 'Gateway').length, 1);
  assert.equal(filterDlqItems(items, 'Gateway')[0].subscriptionId, 'sub-beta');
  assert.equal(filterDlqItems(items, 'disputed').length, 1);
  assert.equal(filterDlqItems(items, 'nonexistent').length, 0);
});
