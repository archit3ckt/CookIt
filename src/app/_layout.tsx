import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDbIfNeeded } from '../lib/db/schema';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="cookit.db" onInit={migrateDbIfNeeded}>
        <Stack screenOptions={{ headerTitleAlign: 'center' }}>
          <Stack.Screen name="index" options={{ title: 'Pantry' }} />
          <Stack.Screen name="scan" options={{ title: 'Scan' }} />
          <Stack.Screen name="recipes" options={{ title: 'Recipes' }} />
          <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
