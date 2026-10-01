import { Stack } from 'expo-router';
import { PacienteProvider } from '../PacienteContext';
import { SesionProvider } from '../SesionContext';
import { TurnosProvider } from '../TurnosContext';

export default function RootLayout() {
  return (
    <SesionProvider>
      <PacienteProvider>
        <TurnosProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TurnosProvider>
      </PacienteProvider>
    </SesionProvider>
  );
}
