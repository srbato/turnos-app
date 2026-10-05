import { router } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { OPCIONES_TABS_SUPERIORES } from '@/constantes/tabs-superiores';

// Mis turnos es un navegador de tabs: Próximos e Historial, cada una con su URL.
export default function MisTurnosLayout() {
  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.volverTexto}>Mis turnos</Text>
      </View>
      <Tabs screenOptions={OPCIONES_TABS_SUPERIORES}>
        <Tabs.Screen name="index" options={{ title: 'Próximos' }} />
        <Tabs.Screen name="historial" options={{ title: 'Historial' }} />
      </Tabs>
      <Pressable style={styles.botonSacarTurno} onPress={() => router.push('/paciente/sacar-turno')}>
        <Text style={styles.botonSacarTurnoTexto}>Sacar un turno</Text>
      </Pressable>
      <MenuPaciente activa="turnos" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_PACIENTE,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  volverTexto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  botonSacarTurno: {
    backgroundColor: COLOR_PACIENTE,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonSacarTurnoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
