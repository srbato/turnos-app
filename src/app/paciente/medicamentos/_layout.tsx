import Tabs from 'expo-router/js-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { opcionesTabsSuperiores } from '@/constantes/tabs-superiores';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// Medicamentos es un navegador de tabs: los que recetó el médico y los que agrega el paciente.
export default function MedicamentosLayout() {
  const { idioma, modoOscuro } = usePreferencias();
  const paleta = paletaApp(modoOscuro, 'paciente');
  const t = TEXTOS_PACIENTE[idioma];
  const styles = crearEstilos(paleta);
  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>{t.medicamentos.titulo}</Text>
      </View>
      <Tabs screenOptions={opcionesTabsSuperiores(paleta, modoOscuro)}>
        <Tabs.Screen name="index" options={{ title: t.medicamentos.recetados }} />
        <Tabs.Screen name="propios" options={{ title: t.medicamentos.propios }} />
      </Tabs>
      <MenuPaciente activa="salud" />
    </View>
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
    paddingBottom: 12,
  },
  titulo: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
  },
});
