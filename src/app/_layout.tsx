import { Stack } from 'expo-router';

import { MedicamentosProvider } from '@/contextos/MedicamentosContext';
import { PerfilPacienteProvider } from '@/contextos/PerfilPacienteContext';
import { PreconsultasProvider } from '@/contextos/PreconsultasContext';
import { PreferenciasProvider } from '@/contextos/PreferenciasContext';
import { RecetasProvider } from '@/contextos/RecetasContext';
import { SesionProvider } from '@/contextos/SesionContext';
import { TurnosProvider } from '@/contextos/TurnosContext';

// Cambio de sección del menú: un fundido corto (ms), para que no se sienta lento.
const OPCIONES_MENU = { animation: 'fade', animationDuration: 120 } as const;

export default function RootLayout() {
  return (
    <SesionProvider>
      <PreferenciasProvider>
        <PerfilPacienteProvider>
          <TurnosProvider>
            <RecetasProvider>
              <MedicamentosProvider>
                <PreconsultasProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    {/* Las secciones del menú de abajo se funden en lugar de deslizarse, para sentirse como un menú. */}
                    <Stack.Screen name="paciente/index" options={OPCIONES_MENU} />
                    <Stack.Screen name="paciente/mis-turnos" options={OPCIONES_MENU} />
                    <Stack.Screen name="paciente/medicamentos" options={OPCIONES_MENU} />
                    <Stack.Screen name="perfil" options={OPCIONES_MENU} />
                  </Stack>
                </PreconsultasProvider>
              </MedicamentosProvider>
            </RecetasProvider>
          </TurnosProvider>
        </PerfilPacienteProvider>
      </PreferenciasProvider>
    </SesionProvider>
  );
}
