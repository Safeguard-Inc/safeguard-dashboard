/**
 * errorExplainerModal.ts
 *
 * Domain helper for the ErrorCodeExplainerModal component (Issue #40).
 * Wraps the canonical 270-code catalog in lib/errorCatalog.ts to provide
 * code/mnemonic lookup, search filtering, and HTTP severity badge styling.
 */

import {
  ERROR_CATALOG,
  getError,
  TOTAL_ERROR_CODES,
  type ErrorDefinition,
} from '../../lib/errorCatalog';

export interface ErrorExplainerView {
  code: number;
  formattedCode: string;
  mnemonic: string;
  domain: string;
  httpStatus: number;
  severityLabel: 'CLIENT_ERROR' | 'CONFLICT_OR_LOCKED' | 'SERVER_FAULT';
  severityBadgeClass: string;
  description: string;
  recoveryHint: string;
  isKnownCatalogCode: boolean;
}

/**
 * Resolves a numeric code or string mnemonic into a rich explainer view model.
 */
export function resolveErrorExplanation(
  codeOrMnemonic: number | string
): ErrorExplainerView {
  const numericLookup =
    typeof codeOrMnemonic === 'number'
      ? codeOrMnemonic
      : /^\d+$/.test(String(codeOrMnemonic).trim())
        ? Number(String(codeOrMnemonic).trim())
        : null;

  const isKnownCatalogCode =
    numericLookup !== null
      ? Boolean(ERROR_CATALOG[numericLookup])
      : Boolean(
          Object.values(ERROR_CATALOG).find(
            (e) => e.mnemonic.toUpperCase() === String(codeOrMnemonic).trim().toUpperCase()
          )
        );

  const def: ErrorDefinition =
    numericLookup !== null
      ? getError(numericLookup)
      : getError(String(codeOrMnemonic).trim().toUpperCase());

  let severityLabel: ErrorExplainerView['severityLabel'] = 'SERVER_FAULT';
  let severityBadgeClass =
    'bg-rose-500/20 text-rose-300 border-rose-500/30';

  if (def.httpStatus === 409 || def.httpStatus === 410 || def.httpStatus === 423) {
    severityLabel = 'CONFLICT_OR_LOCKED';
    severityBadgeClass =
      'bg-amber-500/20 text-amber-300 border-amber-500/30';
  } else if (def.httpStatus >= 400 && def.httpStatus < 500) {
    severityLabel = 'CLIENT_ERROR';
    severityBadgeClass =
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  }

  return {
    code: def.code,
    formattedCode: `SG-${def.code}`,
    mnemonic: def.mnemonic,
    domain: def.domain,
    httpStatus: def.httpStatus,
    severityLabel,
    severityBadgeClass,
    description: def.description,
    recoveryHint: def.recoveryHint,
    isKnownCatalogCode,
  };
}

/**
 * Searches the 270 canonical error definitions by numeric code, mnemonic, or domain substring.
 */
export function searchErrorCatalog(
  query: string,
  limit = 12
): ErrorDefinition[] {
  const q = query.trim().toLowerCase();
  const all = Object.values(ERROR_CATALOG);
  if (!q) {
    return all.slice(0, limit);
  }
  return all
    .filter(
      (item) =>
        String(item.code).includes(q) ||
        item.mnemonic.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export { TOTAL_ERROR_CODES };
