import { router, Stack, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { SacarTurnoProvider } from '@/contextos/SacarTurnoContext';

const PASOS = ['Especialidad', 'Médico', 'Horario'];

// El paso actual sale de la URL: cada paso tiene su ruta.
function pasoActualSegunRuta(ruta: string) {
  if (ruta.endsWith('/medico')) return 2;
  if (ruta.endsWith('/horario')) return 3;
  return 1;
}

function Pasos() {
  const pasoActual = pasoActualSegunRuta(usePathname());

  return (
    <View style={styles.pasos}>
      {PASOS.map((nombre, indice) => {
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
  // El Provider va acá y no en una pantalla: así no se desmonta al navegar entre pasos
  // y la selección se mantiene. Al salir del flujo el layout se desmonta y la selección se descarta.
  return (
    <SacarTurnoProvider>
      <View style={styles.pantalla}>
        <View style={styles.encabezado}>
          <Pressable onPress={volver}>
            <Text style={styles.volverTexto}>‹ Sacar turno</Text>
          </Pressable>
          <Pasos />
        </View>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: FONDO_PACIENTE },
          }}
        />
      </View>
    </SacarTurnoProvider>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  volverTexto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
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
    color: COLOR_PACIENTE,
  },
  pasoPendienteTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A8A',
  },
});
