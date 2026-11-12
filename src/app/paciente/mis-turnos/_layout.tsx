import { router } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuPaciente } from '@/components/menu-paciente';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { opcionesTabsSuperiores } from '@/constantes/tabs-superiores';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// Mis turnos es un navegador de tabs: Próximos e Historial, cada una con su URL.
export default function MisTurnosLayout() {
  const { idioma, modoOscuro } = usePreferencias();
  const paleta = paletaApp(modoOscuro, 'paciente');
  const t = TEXTOS_PACIENTE[idioma];
  const styles = crearEstilos(paleta);
  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.volverTexto}>{t.turnos.titulo}</Text>
      </View>
      <Tabs screenOptions={opcionesTabsSuperiores(paleta, modoOscuro)}>
        <Tabs.Screen name="index" options={{ title: t.turnos.proximos }} />
        <Tabs.Screen name="historial" options={{ title: t.turnos.historial }} />
      </Tabs>
      <Pressable style={styles.botonSacarTurno} onPress={() => router.push('/paciente/sacar-turno')}>
        <Text style={styles.botonSacarTurnoTexto}>{t.turnos.sacarTurno}</Text>
      </Pressable>
      <MenuPaciente activa="turnos" />
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
