
import { Stack } from 'expo-router';
import { MenuProvider } from 'react-native-popup-menu';

export default function RootLayout() {
  return (
    <MenuProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="notes" options={{ headerShown: false }} />
        <Stack.Screen name="feedback" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="workers" options={{ headerShown: false }} />
        <Stack.Screen name="workers/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="cashbook" options={{ headerShown: false }} />
        <Stack.Screen name="sites" options={{ headerShown: false }} />
        <Stack.Screen name="reports" options={{ headerShown: false }} />
      </Stack>
    </MenuProvider>
  );
}
