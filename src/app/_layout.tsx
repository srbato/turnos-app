import { Stack } from 'expo-router';

import { MedicamentosProvider } from '@/contextos/MedicamentosContext';
import { PerfilPacienteProvider } from '@/contextos/PerfilPacienteContext';
import { PreferenciasProvider } from '@/contextos/PreferenciasContext';
import { TurnosProvider } from '@/contextos/TurnosContext';

export default function RootLayout() {
  return (
    <PreferenciasProvider>
      <PerfilPacienteProvider>
        <TurnosProvider>
          <MedicamentosProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </MedicamentosProvider>
        </TurnosProvider>
      </PerfilPacienteProvider>
    </PreferenciasProvider>
  );
}
