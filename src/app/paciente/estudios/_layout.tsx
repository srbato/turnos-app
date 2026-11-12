import { router } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { opcionesTabsSuperiores } from '@/constantes/tabs-superiores';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/paciente');
  }
}

// Estudios es un navegador de tabs, igual que Mis turnos: Pendientes e Historial.
export default function EstudiosLayout() {
  const { idioma, modoOscuro } = usePreferencias();
  const paleta = paletaApp(modoOscuro, 'paciente');
  const t = TEXTOS_PACIENTE[idioma];
  const styles = crearEstilos(paleta);
  return (
    <View style={styles.pantalla}>
      <Pressable style={styles.encabezado} onPress={volver}>
        <Text style={styles.volverTexto}>{t.estudios.titulo}</Text>
      </Pressable>
      <Tabs screenOptions={opcionesTabsSuperiores(paleta, modoOscuro)}>
        <Tabs.Screen name="index" options={{ title: t.estudios.pendientes }} />
        <Tabs.Screen name="historial" options={{ title: t.estudios.historial }} />
      </Tabs>
      <MenuPaciente />
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
  volverTexto: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
  },
});
