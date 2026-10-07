import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { Preconsulta } from '@/datos/preconsulta';

type PreconsultasContextType = {
  preconsultas: Preconsulta[];
  buscarPorTurno: (turnoId: string) => Preconsulta | undefined;
  enviarPreconsulta: (preconsulta: Preconsulta) => void;
};

const CLAVE_STORAGE = 'preconsultas';

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PreconsultasContextType = {
  preconsultas: [],
  buscarPorTurno: () => undefined,
  enviarPreconsulta: () => {},
};

const PreconsultasContext = createContext(VALOR_POR_DEFECTO);

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

  return (
    <PreconsultasContext.Provider value={{ preconsultas, buscarPorTurno, enviarPreconsulta }}>
      {children}
    </PreconsultasContext.Provider>
  );
}

export function usePreconsultas() {
  return useContext(PreconsultasContext);
}
