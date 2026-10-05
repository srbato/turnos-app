import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import type { Preconsulta } from '@/datos/preconsulta';

type PreconsultasContextType = {
  preconsultas: Preconsulta[];
  buscarPorTurno: (turnoId: string) => Preconsulta | undefined;
  enviarPreconsulta: (preconsulta: Preconsulta) => void;
};

const CLAVE_STORAGE = 'preconsultas';

const PreconsultasContext = createContext<PreconsultasContextType | undefined>(undefined);

export function PreconsultasProvider({ children }: { children: ReactNode }) {
  const [preconsultas, setPreconsultas] = useState<Preconsulta[]>([]);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarPreconsultas() {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_STORAGE);
        if (guardado !== null) {
          setPreconsultas(JSON.parse(guardado));
        }
      } catch {
        // Si falla la lectura, se empieza sin preconsultas.
      }
    }
    cargarPreconsultas();
  }, []);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    function buscarPorTurno(turnoId: string) {
      return preconsultas.find((preconsulta) => preconsulta.turnoId === turnoId);
    }
    // Una preconsulta por turno: si ya había una, se reemplaza.
    async function enviarPreconsulta(preconsulta: Preconsulta) {
      const nuevas = [...preconsultas.filter((p) => p.turnoId !== preconsulta.turnoId), preconsulta];
      setPreconsultas(nuevas);
      try {
        await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevas));
      } catch {
        // Si falla el guardado, queda en memoria hasta cerrar la app.
      }
    }
    return { preconsultas, buscarPorTurno, enviarPreconsulta };
  }, [preconsultas]);

  return <PreconsultasContext.Provider value={value}>{children}</PreconsultasContext.Provider>;
}

export function usePreconsultas() {
  const contexto = useContext(PreconsultasContext);
  if (contexto === undefined) {
    throw new Error('usePreconsultas tiene que usarse dentro de un PreconsultasProvider');
  }
  return contexto;
}
