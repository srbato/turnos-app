import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { REGLAS_RIESGO_POR_DEFECTO, ReglasRiesgo } from '@/datos/ausentismo';

// Configuración del consultorio que edita Secretaría. Se guarda en el dispositivo, aparte para cada consultorio.
// De acá salen la duración de los turnos y las reglas de riesgo que usan los tres roles, para que todos coincidan.
export type Configuracion = {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  duracionTurno: number; // minutos de cada turno (15, 20, 30 o 45)
  atencion: string; // días y horarios de atención
  sobreturnos: number; // por día
  recordatorioAutomatico: boolean; // aviso 24 h antes del turno
  puntosRiesgoMedio: number; // puntos desde los que un paciente tiene riesgo medio de faltar
  puntosRiesgoAlto: number; // puntos desde los que tiene riesgo alto
  avisosAntesDeActuar: number; // avisos que Secretaría tiene que mandar antes de poder reprogramar o cancelar
};

// Lo que se comparte: la configuración, las reglas de riesgo que salen de ella y la función para guardarla.
type ConfiguracionContextType = Configuracion & {
  reglasRiesgo: ReglasRiesgo; // para evaluar el riesgo de un paciente (datos/ausentismo.ts)
  guardarConfiguracion: (configuracionNueva: Configuracion) => void;
};

const CLAVE_STORAGE = 'configuracion-consultorio';

const CONFIGURACION_POR_DEFECTO: Configuracion = {
  nombre: '',
  direccion: '',
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

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: ConfiguracionContextType = {
  ...CONFIGURACION_POR_DEFECTO,
  reglasRiesgo: REGLAS_RIESGO_POR_DEFECTO,
  guardarConfiguracion: () => {},
};

const ConfiguracionContext = createContext(VALOR_POR_DEFECTO);

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  // La configuración arranca con el nombre y la dirección del consultorio activo.
  const configuracionInicial: Configuracion = {
    ...CONFIGURACION_POR_DEFECTO,
    nombre: consultorio.nombre,
    direccion: consultorio.direccion,
  };
  const claveStorage = `${CLAVE_STORAGE}-${consultorio.id}`;
  const [configuracion, setConfiguracion] = useState(configuracionInicial);

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

  // Reemplaza la configuración por la nueva y la guarda en el dispositivo.
  async function guardarConfiguracion(configuracionNueva: Configuracion) {
    setConfiguracion(configuracionNueva);
    try {
      await AsyncStorage.setItem(claveStorage, JSON.stringify(configuracionNueva));
    } catch {
      // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
    }
  }

  const reglasRiesgo: ReglasRiesgo = {
    medio: configuracion.puntosRiesgoMedio,
    alto: configuracion.puntosRiesgoAlto,
    avisos: configuracion.avisosAntesDeActuar,
  };

  return (
    <ConfiguracionContext.Provider
      value={{
        ...configuracion,
        reglasRiesgo: reglasRiesgo,
        guardarConfiguracion,
      }}>
      {children}
    </ConfiguracionContext.Provider>
  );
}

export function useConfiguracion() {
  return useContext(ConfiguracionContext);
}
