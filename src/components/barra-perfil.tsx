import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoAnimado } from '@/components/icono-animado';
import { MARGEN_INFERIOR } from '@/constantes/pantalla';
import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';
import type { Tema } from '@/constantes/tema';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PERFIL } from '@/datos/textos-perfil';

const COLOR_PERFIL = '#C9A24C';

type Rol = 'paciente' | 'medico' | 'secretaria';
type Clave =
  | 'inicio'
  | 'turnos'
  | 'medicamentos'
  | 'agenda'
  | 'pacientes'
  | 'recetas'
  | 'perfil'
  | 'espera'
  | 'alertas'
  | 'personal'
  | 'ajustes';

type Item = { icono: string; iconoActivo: string; clave: Clave; ruta: Href };

// Cada rol tiene su propia barra. Solo el paciente tiene editor de perfil por ahora.
const ITEMS_POR_ROL: Partial<Record<Rol, Item[]>> = {
  paciente: [
    { icono: '☖', iconoActivo: '☗', clave: 'inicio', ruta: '/paciente' },
    { icono: '☐', iconoActivo: '☑', clave: 'turnos', ruta: '/paciente/mis-turnos' as Href },
    { icono: '℞', iconoActivo: '⚕', clave: 'medicamentos', ruta: '/paciente/medicamentos' },
    { icono: '◐', iconoActivo: '⚙', clave: 'perfil', ruta: '/perfil?rol=paciente' },
  ],
  medico: [
    { icono: '▤', iconoActivo: '▥', clave: 'agenda', ruta: '/medico' },
    { icono: '◍', iconoActivo: '◉', clave: 'pacientes', ruta: '/medico/pacientes' },
    { icono: '℞', iconoActivo: '⚕', clave: 'recetas', ruta: '/medico/recetas' },
    { icono: '◐', iconoActivo: '⚙', clave: 'perfil', ruta: '/perfil?rol=medico' },
  ],
  secretaria: [
    { icono: '▤', iconoActivo: '▥', clave: 'agenda', ruta: RUTA_AGENDA_SECRETARIA },
    { icono: '≡', iconoActivo: '☰', clave: 'espera', ruta: '/secretaria/espera' },
    { icono: '△', iconoActivo: '▲', clave: 'alertas', ruta: '/secretaria/alertas' },
    { icono: '☺', iconoActivo: '☻', clave: 'personal', ruta: '/secretaria/personal' },
    { icono: '◌', iconoActivo: '⚙', clave: 'ajustes', ruta: '/secretaria/ajustes' },
  ],
};

type Props = {
  rol: Rol;
  // En Editar perfil el ítem Perfil queda resaltado, pero se puede tocar para volver a Mi perfil.
  pantalla: 'perfil' | 'editar';
  tema: Tema;
};

// Barra de abajo de las pantallas de perfil (Mi perfil y Editar perfil), con el tema elegido.
export function BarraPerfil({ rol, pantalla, tema }: Props) {
  const { idioma } = usePreferencias();
  const textos = TEXTOS_PERFIL[idioma];
  const items = ITEMS_POR_ROL[rol] ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={[styles.tabBar, { backgroundColor: tema.fondo, borderTopColor: tema.borde }]}>
      {items.map((item) => {
        const esActiva = item.clave === (rol === 'secretaria' ? 'ajustes' : 'perfil');
        return (
          <Pressable
            key={item.clave}
            style={styles.tabItem}
            disabled={esActiva && pantalla === 'perfil' && rol !== 'secretaria'}
            onPress={() => router.replace(item.ruta)}>
            <IconoAnimado
              icono={item.icono}
              iconoActivo={item.iconoActivo}
              activo={esActiva}
              style={[styles.tabIcono, { color: esActiva ? COLOR_PERFIL : tema.textoTenue }]}
            />
            <Text
              style={[
                styles.tabTexto,
                { color: esActiva ? COLOR_PERFIL : tema.textoTenue },
                esActiva && styles.tabTextoActivo,
              ]}>
              {textos.tabs[item.clave]}
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
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingBottom: 10 + MARGEN_INFERIOR,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcono: {
    fontSize: 20,
  },
  tabTexto: {
    fontSize: 11,
    marginTop: 2,
  },
  tabTextoActivo: {
    fontWeight: '700',
  },
});
