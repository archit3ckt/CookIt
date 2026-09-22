import { Stack } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDbIfNeeded } from '../lib/db/schema';
import { seedDevData } from '../lib/db/seed';

async function initDb(db: SQLiteDatabase) {
  await migrateDbIfNeeded(db);
  if (__DEV__) {
    await seedDevData(db);
  }
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="cookit.db" onInit={initDb}>
        <Stack screenOptions={{ headerTitleAlign: 'center' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ title: 'Scan' }} />
          <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
          <Stack.Screen name="made/[id]" options={{ title: 'Made Recipe' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
