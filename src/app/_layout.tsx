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
            <Stack screenOptions={{ headerShown: false }}>
              {/* Las secciones del menú de abajo se funden en lugar de deslizarse, para sentirse como un menú. */}
              <Stack.Screen name="paciente/index" options={{ animation: 'fade' }} />
              <Stack.Screen name="paciente/mis-turnos" options={{ animation: 'fade' }} />
              <Stack.Screen name="paciente/medicamentos" options={{ animation: 'fade' }} />
              <Stack.Screen name="perfil" options={{ animation: 'fade' }} />
            </Stack>
          </MedicamentosProvider>
        </TurnosProvider>
      </PerfilPacienteProvider>
    </PreferenciasProvider>
  );
}
