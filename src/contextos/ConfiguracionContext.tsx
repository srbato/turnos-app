import { createContext, ReactNode, useContext } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { REGLAS_RIESGO_POR_DEFECTO, ReglasRiesgo } from '@/datos/ausentismo';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// Configuración del consultorio que edita Secretaría (Ajustes). Se guarda en la API, en los datos del consultorio.
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
  guardarConfiguracion: (configuracionNueva: Configuracion) => Promise<string>; // devuelve el error, o '' si se guardó
};

const CONFIGURACION_POR_DEFECTO: Configuracion = {
  nombre: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  duracionTurno: 20,
  atencion: '',
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
  guardarConfiguracion: async () => '',
};

const ConfiguracionContext = createContext(VALOR_POR_DEFECTO);

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const { consultorio, recargarConsultorio } = useConsultorio();
  const configuracion: Configuracion = {
    nombre: consultorio.nombre,
    direccion: consultorio.direccion,
    ciudad: consultorio.ciudad,
    telefono: consultorio.telefono,
    duracionTurno: consultorio.duracionTurno,
    atencion: consultorio.atencion,
    sobreturnos: consultorio.sobreturnos,
    recordatorioAutomatico: consultorio.recordatorioAutomatico,
    puntosRiesgoMedio: consultorio.puntosRiesgoMedio,
    puntosRiesgoAlto: consultorio.puntosRiesgoAlto,
    avisosAntesDeActuar: consultorio.avisosAntesDeActuar,
  };

  // Manda la configuración nueva a la API y, si se guardó, vuelve a pedir los datos del consultorio.
  async function guardarConfiguracion(configuracionNueva: Configuracion) {
    const respuesta = await pedir('PATCH', `/api/consultorios/${ID_CONSULTORIO}`, configuracionNueva);
    if (respuesta.ok) {
      await recargarConsultorio();
    }
    return respuesta.error;
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
