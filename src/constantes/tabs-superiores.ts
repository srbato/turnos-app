import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';

import { COLOR_PACIENTE } from '@/constantes/colores';

const ALTO_BARRA = 48;

// Opciones comunes de las tabs de arriba (Mis turnos, Mis medicamentos, Mis estudios).
// Sin ícono, la barra reserva el lugar igual; por eso se fija el alto y se centra la etiqueta.
export const OPCIONES_TABS_SUPERIORES: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarPosition: 'top',
  tabBarIcon: () => null,
  tabBarIconStyle: { display: 'none' },
  tabBarLabelPosition: 'beside-icon',
  tabBarActiveTintColor: COLOR_PACIENTE,
  tabBarInactiveTintColor: '#8A8A8A',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 0,
    shadowOpacity: 0,
  },
};
