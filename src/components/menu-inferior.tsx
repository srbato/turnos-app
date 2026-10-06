import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoAnimado } from '@/components/icono-animado';
import { MARGEN_INFERIOR } from '@/constantes/pantalla';

export type SeccionMenu = {
  id: string;
  icono: string; // símbolo cuando la sección NO está seleccionada
  iconoActivo: string; // símbolo cuando está seleccionada
  texto: string;
  ruta: Href;
};

type Props = {
  secciones: SeccionMenu[];
  activa?: string; // id de la sección seleccionada (opcional)
  colorActivo: string; // color del rol (paciente azul, secretaría verde)
};

// Menú de abajo, común a los roles. Cada rol le pasa sus secciones y su color.
// Cambia de sección con replace (no push), así las secciones no se apilan una sobre otra.
export function MenuInferior({ secciones, activa, colorActivo }: Props) {
  return (
    <View style={styles.tabBar}>
      {secciones.map((seccion) => {
        const esActiva = seccion.id === activa;
        return (
          <Pressable
            key={seccion.id}
            style={styles.tabItem}
            disabled={esActiva}
            onPress={() => router.replace(seccion.ruta)}>
            <IconoAnimado
              icono={seccion.icono}
              iconoActivo={seccion.iconoActivo}
              activo={esActiva}
              style={[styles.tabIcono, esActiva && { color: colorActivo }]}
            />
            <Text style={[styles.tabTexto, esActiva && { color: colorActivo, fontWeight: '700' }]}>
              {seccion.texto}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingVertical: 10,
    paddingBottom: 10 + MARGEN_INFERIOR,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcono: {
    fontSize: 20,
    color: '#9A9A9A',
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
});
