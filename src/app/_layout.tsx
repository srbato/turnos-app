import { Stack } from 'expo-router';
import { SesionProvider } from '../SesionContext';
import { TurnosProvider } from '../TurnosContext';

export default function RootLayout() {
  return (
    <SesionProvider>
      <TurnosProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TurnosProvider>
    </SesionProvider>
  );
}
