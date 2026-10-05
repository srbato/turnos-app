import { router } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { OPCIONES_TABS_SUPERIORES } from '@/constantes/tabs-superiores';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/paciente');
  }
}

// Estudios es un navegador de tabs, igual que Mis turnos: Pendientes e Historial.
export default function EstudiosLayout() {
  return (
    <View style={styles.pantalla}>
      <Pressable style={styles.encabezado} onPress={volver}>
        <Text style={styles.volverTexto}>‹ Mis estudios</Text>
      </Pressable>
      <Tabs screenOptions={OPCIONES_TABS_SUPERIORES}>
        <Tabs.Screen name="index" options={{ title: 'Pendientes' }} />
        <Tabs.Screen name="historial" options={{ title: 'Historial' }} />
      </Tabs>
      <MenuPaciente />
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
});
