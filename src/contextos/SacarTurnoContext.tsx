import { createContext, ReactNode, useContext, useState } from 'react';

import { Especialidad, Medico } from '@/datos/catalogo';

type SacarTurnoContextType = {
  especialidad: Especialidad | null;
  medico: Medico | null;
  fecha: string | null; // AAAA-MM-DD
  hora: string | null; // HH:MM
  elegirEspecialidad: (especialidad: Especialidad) => void;
  elegirMedico: (medico: Medico) => void;
  elegirFecha: (fecha: string) => void;
  elegirHora: (hora: string) => void;
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: SacarTurnoContextType = {
  especialidad: null,
  medico: null,
  fecha: null,
  hora: null,
  elegirEspecialidad: () => {},
  elegirMedico: () => {},
  elegirFecha: () => {},
  elegirHora: () => {},
};

const SacarTurnoContext = createContext(VALOR_POR_DEFECTO);

type PropsProvider = {
  children: ReactNode;
  // Para entrar al flujo con la selección ya hecha (volver a pedir turno con un profesional).
  especialidadInicial?: Especialidad;
  medicoInicial?: Medico;
};

export function SacarTurnoProvider({ children, especialidadInicial, medicoInicial }: PropsProvider) {
  const [especialidad, setEspecialidad] = useState<Especialidad | null>(especialidadInicial || null);
  const [medico, setMedico] = useState<Medico | null>(medicoInicial || null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);

  // Cada elección invalida lo que dependía de ella.
  function elegirEspecialidad(nueva: Especialidad) {
    setEspecialidad(nueva);
    setMedico(null);
    setFecha(null);
    setHora(null);
  }
  function elegirMedico(nuevo: Medico) {
    setMedico(nuevo);
    setFecha(null);
    setHora(null);
  }
  function elegirFecha(nueva: string) {
    setFecha(nueva);
    setHora(null);
  }
  function elegirHora(nueva: string) {
    setHora(nueva);
  }

  return (
    <SacarTurnoContext.Provider
      value={{ especialidad, medico, fecha, hora, elegirEspecialidad, elegirMedico, elegirFecha, elegirHora }}>
      {children}
    </SacarTurnoContext.Provider>
  );
}

export function useSacarTurno() {
  return useContext(SacarTurnoContext);
}
