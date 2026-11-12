import { router, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { SacarTurnoProvider } from '@/contextos/SacarTurnoContext';
import { aceptaTurnos, usePersonal } from '@/contextos/PersonalContext';
import { especialidadesDe, medicosDelCatalogo } from '@/datos/catalogo';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// El paso actual sale de la URL: cada paso tiene su ruta.
function pasoActualSegunRuta(ruta: string) {
  if (ruta.endsWith('/medico')) return 2;
  if (ruta.endsWith('/horario')) return 3;
  return 1;
}

function Pasos({ pasoActual }: { pasoActual: number }) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  return (
    <View style={styles.pasos}>
      {[t.sacarTurno.pasos.especialidad, t.sacarTurno.pasos.medico, t.sacarTurno.pasos.horario].map((nombre, indice) => {
        const numero = indice + 1;
        const completo = numero < pasoActual;
        const activo = numero === pasoActual;
        return (
          <View key={nombre} style={styles.pasoFila}>
            {indice > 0 && <Text style={styles.pasoGuion}>—</Text>}
            {activo ? (
              <View style={styles.pasoActivo}>
                <Text style={styles.pasoActivoTexto}>
                  {numero} {nombre}
                </Text>
              </View>
            ) : (
              <View style={styles.pasoPendiente}>
                {completo && <Text style={styles.pasoCompletoCheck}>✓</Text>}
                <Text style={completo ? styles.pasoCompletoTexto : styles.pasoPendienteTexto}>
                  {completo ? nombre : `${numero} ${nombre}`}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/paciente');
  }
}

export default function SacarTurnoLayout() {
  const { idioma, modoOscuro } = usePreferencias();
  const paleta = paletaApp(modoOscuro, 'paciente');
  const styles = crearEstilos(paleta);
  const t = TEXTOS_PACIENTE[idioma];
  const pasoActual = pasoActualSegunRuta(usePathname());

  // Si se entra con ?medicoId=..., el flujo arranca con ese médico y su especialidad ya elegidos.
  const { medicoId } = useGlobalSearchParams<{ medicoId?: string }>();
  const { medicos: personal } = usePersonal();
  const medicoBuscado = medicosDelCatalogo(personal).find((m) => m.id === medicoId);
  // Si el médico está de licencia o de baja, el flujo arranca de cero y no lo ofrece.
  const medicoInicial =
    medicoBuscado && aceptaTurnos(personal, medicoBuscado.nombre) ? medicoBuscado : undefined;
  const especialidadInicial = especialidadesDe(personal).find((e) => e.id === medicoInicial?.especialidadId);

  // El Provider va acá y no en una pantalla: así no se desmonta al navegar entre pasos
  // y la selección se mantiene. Al salir del flujo el layout se desmonta y la selección se descarta.
  return (
    <SacarTurnoProvider especialidadInicial={especialidadInicial} medicoInicial={medicoInicial}>
      <View style={styles.pantalla}>
        <View style={styles.encabezado}>
          <Pressable onPress={volver}>
            <Text style={styles.volverTexto}>{pasoActual === 1 ? t.sacarTurno.volverTitulo : t.sacarTurno.volver}</Text>
          </Pressable>
          <Pasos pasoActual={pasoActual} />
        </View>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: paleta.fondo },
          }}
        />
      </View>
    </SacarTurnoProvider>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  volverTexto: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginBottom: 16,
  },
  pasos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pasoFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pasoGuion: {
    color: '#B7C6E8',
    marginHorizontal: 4,
  },
  pasoActivo: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pasoActivoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pasoPendiente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pasoCompletoCheck: {
    color: '#FFFFFF',
    backgroundColor: COLOR_PACIENTE,
    width: 16,
    height: 16,
    borderRadius: 8,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginRight: 6,
    overflow: 'hidden',
  },
  pasoCompletoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: c.acento,
  },
  pasoPendienteTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textoTenue,
  },
});
