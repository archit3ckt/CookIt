import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { usePantry } from '../lib/db/usePantry';
import { lookupBarcode } from '../lib/barcode';
import { findIngredientByLabel } from '../lib/rulesEngine/ingredients';
import { parseReceiptText, ParsedReceiptLine } from '../lib/receipt';
import { recognizeTextFromImage } from '../lib/ocr';

type Mode = 'barcode' | 'receipt';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>('barcode');
  const [scanning, setScanning] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingLines, setPendingLines] = useState<ParsedReceiptLine[] | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addItem } = usePantry();

  const addFromIngredient = useCallback(
    async (ingredientId: string, label: string, shelfLifeDays: number) => {
      const expiresOn = new Date();
      expiresOn.setDate(expiresOn.getDate() + shelfLifeDays);
      await addItem({
        id: Crypto.randomUUID(),
        ingredientId,
        label,
        quantity: 1,
        unit: 'piece',
        expiresOn: expiresOn.toISOString().slice(0, 10),
        addedOn: new Date().toISOString().slice(0, 10),
        source: mode === 'barcode' ? 'barcode' : 'receipt',
      });
    },
    [addItem, mode]
  );

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!scanning) return;
      setScanning(false);
      setBusy(true);
      try {
        const result = await lookupBarcode(data);
        const match = result.productName ? findIngredientByLabel(result.productName) : null;
        if (!match) {
          Alert.alert(
            'Not recognized',
            `Scanned "${result.productName ?? data}" but couldn't match it to a known ingredient. Add it manually from the Pantry screen.`,
            [{ text: 'OK', onPress: () => setScanning(true) }]
          );
          return;
        }
        Alert.alert('Add to pantry?', match.name, [
          { text: 'Cancel', style: 'cancel', onPress: () => setScanning(true) },
          {
            text: 'Add',
            onPress: async () => {
              await addFromIngredient(match.id, match.name, match.defaultShelfLifeDays);
              setScanning(true);
            },
          },
        ]);
      } catch {
        Alert.alert('Lookup failed', 'Could not reach the barcode database. Try again.', [
          { text: 'OK', onPress: () => setScanning(true) },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [scanning, addFromIngredient]
  );

  const captureReceipt = useCallback(async () => {
    if (!cameraRef.current) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
      if (!photo?.base64) throw new Error('No image captured');
      const text = await recognizeTextFromImage(photo.base64);
      const lines = parseReceiptText(text);
      if (lines.length === 0) {
        Alert.alert('No items found', "Couldn't match any receipt lines to known ingredients.");
        return;
      }
      setPendingLines(lines);
    } catch (e) {
      Alert.alert('Receipt scan failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }, []);

  const confirmReceiptLines = useCallback(async () => {
    if (!pendingLines) return;
    setBusy(true);
    try {
      for (const line of pendingLines) {
        if (!line.match) continue;
        const expiresOn = new Date(line.suggestedExpiresOn);
        await addItem({
          id: Crypto.randomUUID(),
          ingredientId: line.match.id,
          label: line.match.name,
          quantity: 1,
          unit: 'piece',
          expiresOn: expiresOn.toISOString().slice(0, 10),
          addedOn: new Date().toISOString().slice(0, 10),
          source: 'receipt',
        });
      }
      setPendingLines(null);
      router.back();
    } finally {
      setBusy(false);
    }
  }, [pendingLines, addItem]);

  if (!permission) return <View style={styles.center} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>CookIt needs camera access to scan receipts and barcodes.</Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  if (pendingLines) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Found {pendingLines.length} item(s)</Text>
        {pendingLines.map((l, idx) => (
          <Text key={idx} style={styles.lineItem}>
            • {l.match?.name} <Text style={styles.lineRaw}>({l.rawLine.trim()})</Text>
          </Text>
        ))}
        <View style={styles.row}>
          <Pressable style={styles.secondaryButton} onPress={() => setPendingLines(null)}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={confirmReceiptLines} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Add all to pantry</Text>}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modeSwitch}>
        <Pressable
          style={[styles.modeButton, mode === 'barcode' && styles.modeButtonActive]}
          onPress={() => setMode('barcode')}
        >
          <Text style={mode === 'barcode' ? styles.modeTextActive : styles.modeText}>Barcode</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'receipt' && styles.modeButtonActive]}
          onPress={() => setMode('receipt')}
        >
          <Text style={mode === 'receipt' ? styles.modeTextActive : styles.modeText}>Receipt</Text>
        </Pressable>
      </View>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={mode === 'barcode' ? { barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] } : undefined}
        onBarcodeScanned={mode === 'barcode' ? handleBarcodeScanned : undefined}
      />

      {mode === 'receipt' && (
        <Pressable style={styles.primaryButton} onPress={captureReceipt} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Capture receipt</Text>}
        </Pressable>
      )}
      {mode === 'barcode' && busy && <ActivityIndicator style={{ marginTop: 8 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 12, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  modeSwitch: { flexDirection: 'row', gap: 8 },
  modeButton: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#222', alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#1565c0' },
  modeText: { color: '#aaa' },
  modeTextActive: { color: '#fff', fontWeight: '600' },
  primaryButton: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#333', padding: 14, borderRadius: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#fff', fontWeight: '600' },
  permissionText: { textAlign: 'center', color: '#333' },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  lineItem: { color: '#fff', marginBottom: 4 },
  lineRaw: { color: '#888', fontSize: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
