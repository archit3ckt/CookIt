import { findIngredientByLabel } from './rulesEngine/ingredients';
import { IngredientDef } from './types';

export interface ParsedReceiptLine {
  rawLine: string;
  match: IngredientDef | null;
  suggestedExpiresOn: string; // ISO date
}

const PRICE_RE = /\$?\d+\.\d{2}\s*$/;
const SIZE_RE = /\b\d+(\.\d+)?\s?(oz|lb|lbs|g|kg|ml|l|ct|pk)\b/gi;
const NOISE_LINES = /^(subtotal|total|tax|cash|change|card|debit|credit|visa|mastercard|balance|thank you)/i;

function cleanLine(line: string): string {
  return line
    .replace(PRICE_RE, '')
    .replace(SIZE_RE, '')
    .replace(/[^a-zA-Z&' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateExpiry(def: IngredientDef | null): string {
  const shelfLifeDays = def?.defaultShelfLifeDays ?? 7;
  const date = new Date();
  date.setDate(date.getDate() + shelfLifeDays);
  return date.toISOString().slice(0, 10);
}

/** Turns raw OCR text from a receipt photo into candidate pantry items for the user to confirm. */
export function parseReceiptText(ocrText: string): ParsedReceiptLine[] {
  return ocrText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !NOISE_LINES.test(l))
    .map((rawLine) => {
      const cleaned = cleanLine(rawLine);
      const match = cleaned ? findIngredientByLabel(cleaned) : null;
      return { rawLine, match, suggestedExpiresOn: estimateExpiry(match) };
    })
    .filter((l) => l.match !== null);
}
