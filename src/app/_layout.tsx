import { Stack } from 'expo-router';

import { TurnosProvider } from '@/contextos/TurnosContext';

export default function RootLayout() {
  return (
    <TurnosProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TurnosProvider>
  );
}
