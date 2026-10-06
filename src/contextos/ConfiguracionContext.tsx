import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { horasDeAtencion, type DuracionDeTurno } from '@/datos/atencion';
import { REGLAS_RIESGO_POR_DEFECTO, type ReglasRiesgo } from '@/datos/ausentismo';

// Configuración del consultorio que edita Secretaría. Se guarda en el dispositivo, aparte para cada consultorio.
// De acá salen la grilla de horarios y las reglas de riesgo que usan los tres roles, para que todos coincidan.
export type Configuracion = {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  duracionTurno: DuracionDeTurno; // minutos de cada turno
  atencion: string; // días y horarios de atención
  sobreturnos: number; // por día
  recordatorioAutomatico: boolean; // aviso 24 h antes del turno
  puntosRiesgoMedio: number; // puntos desde los que un paciente tiene riesgo medio de faltar
  puntosRiesgoAlto: number; // puntos desde los que tiene riesgo alto
  avisosAntesDeActuar: number; // avisos que Secretaría tiene que mandar antes de poder reprogramar o cancelar
};

type ConfiguracionContextType = Configuracion & {
  horarios: string[]; // los horarios de turno de un día, según la duración elegida
  reglasRiesgo: ReglasRiesgo; // para evaluar el riesgo de un paciente (datos/ausentismo.ts)
  guardarConfiguracion: (cambios: Partial<Configuracion>) => void;
};

const CLAVE_STORAGE = 'configuracion-consultorio';

const ConfiguracionContext = createContext<ConfiguracionContextType | undefined>(undefined);

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const configuracionInicial: Configuracion = {
    nombre: consultorio.nombre,
    direccion: consultorio.direccion,
    ciudad: 'CABA',
    telefono: '11 4903-7712',
    duracionTurno: 20,
    atencion: 'Lun a vie 8–20 · sáb 9–13',
    sobreturnos: 2,
    recordatorioAutomatico: true,
    puntosRiesgoMedio: REGLAS_RIESGO_POR_DEFECTO.medio,
    puntosRiesgoAlto: REGLAS_RIESGO_POR_DEFECTO.alto,
    avisosAntesDeActuar: REGLAS_RIESGO_POR_DEFECTO.avisos,
  };
  const claveStorage = `${CLAVE_STORAGE}-${consultorio.id}`;
  const [configuracion, setConfiguracion] = useState<Configuracion>(configuracionInicial);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const guardado = await AsyncStorage.getItem(claveStorage);
        if (guardado !== null) {
          setConfiguracion({ ...configuracionInicial, ...JSON.parse(guardado) });
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
        await AsyncStorage.setItem(claveStorage, JSON.stringify(nueva));
      } catch {
        // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
      }
    }
    return {
      ...configuracion,
      horarios: horasDeAtencion(configuracion.duracionTurno),
      reglasRiesgo: {
        medio: configuracion.puntosRiesgoMedio,
        alto: configuracion.puntosRiesgoAlto,
        avisos: configuracion.avisosAntesDeActuar,
      },
      guardarConfiguracion,
    };
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
