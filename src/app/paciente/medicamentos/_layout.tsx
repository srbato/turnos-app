import Tabs from 'expo-router/js-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { OPCIONES_TABS_SUPERIORES } from '@/constantes/tabs-superiores';

// Medicamentos es un navegador de tabs: los que recetó el médico y los que agrega el paciente.
export default function MedicamentosLayout() {
  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Mis medicamentos</Text>
      </View>
      <Tabs screenOptions={OPCIONES_TABS_SUPERIORES}>
        <Tabs.Screen name="index" options={{ title: 'Recetados' }} />
        <Tabs.Screen name="propios" options={{ title: 'Agregados por mí' }} />
      </Tabs>
      <MenuPaciente activa="salud" />
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
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
