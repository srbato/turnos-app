import { createContext, ReactNode, useContext } from 'react';

import { useTurnos } from '@/contextos/TurnosContext';
import { Preconsulta, RespuestasPreconsulta } from '@/datos/preconsulta';
import { pedir } from '@/servicios/api';

// Las preconsultas que mandan los pacientes antes de su turno. Vienen de la API junto con cada turno (TurnosContext):
// acá están las funciones para buscarlas y enviarlas.

type PreconsultasContextType = {
  preconsultas: Preconsulta[];
  buscarPorTurno: (turnoId: string) => Preconsulta | undefined;
  enviarPreconsulta: (turnoId: string, respuestas: RespuestasPreconsulta) => Promise<string>; // error, o ''
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PreconsultasContextType = {
  preconsultas: [],
  buscarPorTurno: () => undefined,
  enviarPreconsulta: async () => '',
};

const PreconsultasContext = createContext(VALOR_POR_DEFECTO);

export function PreconsultasProvider({ children }: { children: ReactNode }) {
  const { preconsultas, recargarTurnos } = useTurnos();

  function buscarPorTurno(turnoId: string) {
    return preconsultas.find((preconsulta) => preconsulta.turnoId === turnoId);
  }

  // Una preconsulta por turno: si ya había una, la API la reemplaza (por eso es PUT).
  async function enviarPreconsulta(turnoId: string, respuestas: RespuestasPreconsulta) {
    const respuesta = await pedir('PUT', `/api/turnos/${turnoId}/preconsulta`, respuestas);
    if (respuesta.ok) {
      await recargarTurnos();
    }
    return respuesta.error;
  }

  return (
    <PreconsultasContext.Provider value={{ preconsultas, buscarPorTurno, enviarPreconsulta }}>
      {children}
    </PreconsultasContext.Provider>
  );
}

export function usePreconsultas() {
  return useContext(PreconsultasContext);
}
