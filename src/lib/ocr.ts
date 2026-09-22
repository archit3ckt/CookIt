import Constants from 'expo-constants';

/**
 * Receipt text extraction via Google Cloud Vision's TEXT_DETECTION.
 * Requires a Vision API key. Set it as `googleVisionApiKey` under `expo.extra`
 * in app.json (or an EAS secret injected the same way) — never hardcode it.
 * Without a key configured, this throws so the UI can show a clear
 * "OCR not set up" state instead of silently failing.
 */
export async function recognizeTextFromImage(base64Image: string): Promise<string> {
  const apiKey = Constants.expoConfig?.extra?.googleVisionApiKey as string | undefined;
  if (!apiKey) {
    throw new Error(
      'Receipt scanning needs a Google Cloud Vision API key. Add it as expo.extra.googleVisionApiKey in app.json.'
    );
  }

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Vision API request failed: ${res.status}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.responses?.[0]?.fullTextAnnotation?.text;
  return text ?? '';
}
