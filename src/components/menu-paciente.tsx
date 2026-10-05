import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { MARGEN_INFERIOR } from '@/constantes/pantalla';

type Seccion = 'inicio' | 'turnos' | 'salud' | 'perfil';

// Se usa "as Href" en Turnos porque los tipos generados de expo-router no reconocen esa ruta (Tabs).
const SECCIONES: { id: Seccion; icono: string; texto: string; ruta: Href }[] = [
  { id: 'inicio', icono: '⌂', texto: 'Inicio', ruta: '/paciente' },
  { id: 'turnos', icono: '+', texto: 'Turnos', ruta: '/paciente/mis-turnos' as Href },
  { id: 'salud', icono: '℞', texto: 'Medicamentos', ruta: '/paciente/medicamentos' },
  { id: 'perfil', icono: '◐', texto: 'Perfil', ruta: '/perfil?rol=paciente' },
];

// Menú de abajo del paciente. Va en las pantallas principales; no en los flujos
// de Sacar turno y Reprogramar, para que un toque sin querer no los interrumpa.
// activa es opcional: pantallas como Estudios no corresponden a ninguna sección del menú.
export function MenuPaciente({ activa }: { activa?: Seccion }) {
  return (
    <View style={styles.tabBar}>
      {SECCIONES.map((seccion) => {
        const esActiva = seccion.id === activa;
        return (
          <Pressable
            key={seccion.id}
            style={styles.tabItem}
            disabled={esActiva}
            onPress={() => router.navigate(seccion.ruta)}>
            <Text style={[styles.tabIcono, esActiva && styles.tabIconoActivo]}>{seccion.icono}</Text>
            <Text style={[styles.tabTexto, esActiva && styles.tabTextoActivo]}>{seccion.texto}</Text>
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
  tabIconoActivo: {
    color: COLOR_PACIENTE,
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_PACIENTE,
    fontWeight: '700',
  },
});
