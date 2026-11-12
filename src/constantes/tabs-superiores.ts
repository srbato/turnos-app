import { BottomTabNavigationOptions } from 'expo-router/js-tabs';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { aclarar, PaletaApp } from '@/constantes/paleta-app';

const ALTO_BARRA = 48;

// Opciones comunes de las tabs de arriba (Mis turnos, Mis medicamentos, Mis estudios).
// Sin ícono, la barra reserva el lugar igual; por eso se fija el alto y se centra la etiqueta.
// Los colores salen de la paleta, así que acompañan al modo claro u oscuro.
export function opcionesTabsSuperiores(c: PaletaApp, modoOscuro: boolean): BottomTabNavigationOptions {
  return {
  headerShown: false,
  tabBarPosition: 'top',
  tabBarIcon: () => null,
  tabBarIconStyle: { display: 'none' },
  tabBarLabelPosition: 'beside-icon',
  tabBarActiveTintColor: modoOscuro ? aclarar(COLOR_PACIENTE) : COLOR_PACIENTE,
  tabBarInactiveTintColor: c.textoTenue,
  tabBarLabelStyle: {
    fontSize: 14,
    fontWeight: '700',
    margin: 0,
  },
  tabBarItemStyle: {
    height: ALTO_BARRA,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarStyle: {
    height: ALTO_BARRA,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: c.tarjeta,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: c.borde,
    elevation: 0,
    shadowOpacity: 0,
  },
  };
}
