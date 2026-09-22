/**
 * Barcode -> product name via Open Food Facts (free, no API key required).
 * Expiry isn't encoded in a barcode, so callers still need the user to
 * confirm/enter an expiry date.
 */
export interface BarcodeLookupResult {
  barcode: string;
  productName: string | null;
}

export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  if (!res.ok) {
    return { barcode, productName: null };
  }
  const data = await res.json();
  const productName: string | null = data?.product?.product_name || data?.product?.generic_name || null;
  return { barcode, productName };
}
