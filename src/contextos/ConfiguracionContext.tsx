import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { NOMBRE_CONSULTORIO } from '@/datos/consultorio';

// Configuración del consultorio que edita Secretaría. Se guarda en el dispositivo.
export type Configuracion = {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  duracionTurno: 15 | 20 | 30 | 45; // minutos, para médicos sin duración propia
  atencion: string; // días y horarios de atención
  sobreturnos: number; // por día
  recordatorioAutomatico: boolean; // aviso 24 h antes del turno
};

type ConfiguracionContextType = Configuracion & {
  guardarConfiguracion: (cambios: Partial<Configuracion>) => void;
};

const CLAVE_STORAGE = 'configuracion-consultorio';

const CONFIGURACION_INICIAL: Configuracion = {
  nombre: NOMBRE_CONSULTORIO,
  direccion: 'Av. Rivadavia 4820, 2º B',
  ciudad: 'CABA',
  telefono: '11 4903-7712',
  duracionTurno: 20,
  atencion: 'Lun a vie 8–20 · sáb 9–13',
  sobreturnos: 2,
  recordatorioAutomatico: true,
};

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const [configuracion, setConfiguracion] = useState<Configuracion>(CONFIGURACION_INICIAL);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_STORAGE);
        if (guardado !== null) {
          setConfiguracion({ ...CONFIGURACION_INICIAL, ...JSON.parse(guardado) });
        }
      } catch {
        // Si falla la lectura, se queda con la configuración inicial.
      }
    }
    cargarConfiguracion();
  }, []);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    async function guardarConfiguracion(cambios: Partial<Configuracion>) {
      const nueva = { ...configuracion, ...cambios };
      setConfiguracion(nueva);
      try {
        await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(nueva));
      } catch {
        // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
      }
    }
    return { ...configuracion, guardarConfiguracion };
  }, [configuracion]);

  return <ConfiguracionContext.Provider value={value}>{children}</ConfiguracionContext.Provider>;
}

export function useConfiguracion() {
  const contexto = useContext(ConfiguracionContext);
  if (contexto === undefined) {
    throw new Error('useConfiguracion tiene que usarse dentro de un ConfiguracionProvider');
  }
  return contexto;
}
