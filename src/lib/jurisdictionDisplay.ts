/**
 * jurisdictionDisplay.ts
 *
 * Presentation formatting and risk-tier badge classification for ISO 3166-1 jurisdictions.
 */

export interface JurisdictionDisplayInfo {
  numericCode: number;
  alpha2: string;
  name: string;
  flag: string;
  badgeLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  isHighRisk: boolean;
}

const COUNTRY_MAP: Record<number, { alpha2: string; name: string; flag: string; isHighRisk?: boolean }> = {
  840: { alpha2: 'US', name: 'United States', flag: '🇺🇸' },
  826: { alpha2: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  276: { alpha2: 'DE', name: 'Germany', flag: '🇩🇪' },
  250: { alpha2: 'FR', name: 'France', flag: '🇫🇷' },
  392: { alpha2: 'JP', name: 'Japan', flag: '🇯🇵' },
  756: { alpha2: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  702: { alpha2: 'SG', name: 'Singapore', flag: '🇸🇬' },
  124: { alpha2: 'CA', name: 'Canada', flag: '🇨🇦' },
  36: { alpha2: 'AU', name: 'Australia', flag: '🇦🇺' },
  784: { alpha2: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  566: { alpha2: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  710: { alpha2: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  76: { alpha2: 'BR', name: 'Brazil', flag: '🇧🇷' },
  408: { alpha2: 'KP', name: 'North Korea', flag: '🇰🇵', isHighRisk: true },
  364: { numericCode: 364, alpha2: 'IR', name: 'Iran', flag: '🇮🇷', isHighRisk: true } as any,
};

export function getJurisdictionDisplay(numericCode: number): JurisdictionDisplayInfo {
  const c = COUNTRY_MAP[numericCode];

  if (!c) {
    return {
      numericCode,
      alpha2: '??',
      name: `Unknown (${numericCode})`,
      flag: '🌐',
      badgeLabel: `Jurisdiction #${numericCode}`,
      bgClass: 'bg-slate-800',
      textClass: 'text-slate-400',
      borderClass: 'border-slate-700',
      isHighRisk: false,
    };
  }

  const isHighRisk = Boolean(c.isHighRisk);

  if (isHighRisk) {
    return {
      numericCode,
      alpha2: c.alpha2,
      name: c.name,
      flag: c.flag,
      badgeLabel: `${c.flag} ${c.alpha2} (High Risk)`,
      bgClass: 'bg-rose-500/10',
      textClass: 'text-rose-400',
      borderClass: 'border-rose-500/30',
      isHighRisk: true,
    };
  }

  return {
    numericCode,
    alpha2: c.alpha2,
    name: c.name,
    flag: c.flag,
    badgeLabel: `${c.flag} ${c.alpha2}`,
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    isHighRisk: false,
  };
}

export function formatJurisdictionTooltip(numericCode: number): string {
  const info = getJurisdictionDisplay(numericCode);
  return `${info.flag} ${info.name} [ISO 3166-1: ${info.numericCode}]`;
}
