import { Stack } from 'expo-router';

import { AdelantosProvider } from '@/contextos/AdelantosContext';
import { ConfiguracionProvider } from '@/contextos/ConfiguracionContext';
import { ConsultorioProvider } from '@/contextos/ConsultorioContext';
import { MedicamentosProvider } from '@/contextos/MedicamentosContext';
import { PerfilMedicoProvider } from '@/contextos/PerfilMedicoContext';
import { PerfilPacienteProvider } from '@/contextos/PerfilPacienteContext';
import { PerfilSecretariaProvider } from '@/contextos/PerfilSecretariaContext';
import { PersonalProvider } from '@/contextos/PersonalContext';
import { PreconsultasProvider } from '@/contextos/PreconsultasContext';
import { PreferenciasProvider } from '@/contextos/PreferenciasContext';
import { RecetasProvider } from '@/contextos/RecetasContext';
import { SesionProvider } from '@/contextos/SesionContext';
import { TurnosProvider } from '@/contextos/TurnosContext';

// Cambio de sección del menú: un fundido corto (ms), para que no se sienta lento.
const OPCIONES_MENU = { animation: 'fade', animationDuration: 120 } as const;

// El consultorio va primero: todos los contextos de abajo toman sus datos iniciales de él.
export default function RootLayout() {
  return (
    <ConsultorioProvider>
      <SesionProvider>
        <PreferenciasProvider>
          <PerfilPacienteProvider>
            <TurnosProvider>
              <AdelantosProvider>
                <PersonalProvider>
                  <ConfiguracionProvider>
                    <PerfilSecretariaProvider>
                      <PerfilMedicoProvider>
                        <RecetasProvider>
                          <MedicamentosProvider>
                            <PreconsultasProvider>
                              <Stack screenOptions={{ headerShown: false }}>
                                {/* Las secciones del menú de abajo se funden en lugar de deslizarse, para sentirse como un menú. */}
                                <Stack.Screen name="paciente/index" options={OPCIONES_MENU} />
                                <Stack.Screen name="paciente/mis-turnos" options={OPCIONES_MENU} />
                                <Stack.Screen name="paciente/medicamentos" options={OPCIONES_MENU} />
                                <Stack.Screen name="perfil" options={OPCIONES_MENU} />
                                <Stack.Screen name="secretaria/index" options={OPCIONES_MENU} />
                                <Stack.Screen name="secretaria/espera" options={OPCIONES_MENU} />
                                <Stack.Screen name="secretaria/alertas" options={OPCIONES_MENU} />
                                <Stack.Screen name="secretaria/personal" options={OPCIONES_MENU} />
                                <Stack.Screen name="secretaria/ajustes" options={OPCIONES_MENU} />
                              </Stack>
                            </PreconsultasProvider>
                          </MedicamentosProvider>
                        </RecetasProvider>
                      </PerfilMedicoProvider>
                    </PerfilSecretariaProvider>
                  </ConfiguracionProvider>
                </PersonalProvider>
              </AdelantosProvider>
            </TurnosProvider>
          </PerfilPacienteProvider>
        </PreferenciasProvider>
      </SesionProvider>
    </ConsultorioProvider>
  );
}
