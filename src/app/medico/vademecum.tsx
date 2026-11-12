import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { BuscadorMedicamentos } from '@/components/buscador-medicamentos';
import { MenuMedico } from '@/components/menu-medico';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

const FONDO_GRAFITO = '#1E2126';

// Pantalla de consulta del vademécum (CIMA, de la AEMPS de España). Solo se mira: no se guarda nada. La búsqueda y la
// lista las maneja BuscadorMedicamentos, el mismo componente que usa el formulario de Nueva receta para elegir uno.
export default function Vademecum() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro));
  const t = TEXTOS_MEDICO[idioma];
  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/medico/recetas');
    }
  }

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <Pressable onPress={volver} hitSlop={10}>
          <Text style={styles.volver}>{t.vademecum.volver}</Text>
        </Pressable>
        <Text style={styles.titulo}>{t.vademecum.titulo}</Text>
        <Text style={styles.ayuda}>{t.vademecum.ayuda}</Text>
      </SafeAreaView>

      <BuscadorMedicamentos oscuro />

      <MenuMedico activa="recetas" />
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: c.fondo,
  },
  encabezado: {
    backgroundColor: FONDO_GRAFITO,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  volver: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A9ADB4',
    marginBottom: 6,
  },
  titulo: {
    fontSize: 22,
    fontFamily: FUENTE_TITULOS,
    color: '#FFFFFF',
  },
  ayuda: {
    fontSize: 12,
    color: '#A9ADB4',
    marginTop: 6,
  },
});
