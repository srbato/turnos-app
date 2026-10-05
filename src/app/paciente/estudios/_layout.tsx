import { router } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';

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
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: 'top',
          tabBarActiveTintColor: COLOR_PACIENTE,
          tabBarInactiveTintColor: '#8A8A8A',
          tabBarLabelStyle: styles.tabEtiqueta,
          tabBarIconStyle: { display: 'none' },
          tabBarStyle: styles.tabBar,
        }}>
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
  tabBar: {
    backgroundColor: '#FFFFFF',
  },
  tabEtiqueta: {
    fontSize: 14,
    fontWeight: '700',
  },
});
