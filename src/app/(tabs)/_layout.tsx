import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: '#1565c0' }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Suggestions', tabBarIcon: () => <TabIcon emoji="🍳" /> }}
      />
      <Tabs.Screen
        name="pantry"
        options={{ title: 'Pantry', tabBarIcon: () => <TabIcon emoji="🧺" /> }}
      />
      <Tabs.Screen
        name="discovered"
        options={{ title: 'Discovered', tabBarIcon: () => <TabIcon emoji="⭐" /> }}
      />
    </Tabs>
  );
}
