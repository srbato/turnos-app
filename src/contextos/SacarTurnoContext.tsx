import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import type { Especialidad, Medico } from '@/datos/catalogo';

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

const SacarTurnoContext = createContext<SacarTurnoContextType | undefined>(undefined);

type PropsProvider = {
  children: ReactNode;
  // Para entrar al flujo con la selección ya hecha (volver a pedir turno con un profesional).
  especialidadInicial?: Especialidad;
  medicoInicial?: Medico;
};

export function SacarTurnoProvider({ children, especialidadInicial, medicoInicial }: PropsProvider) {
  const [especialidad, setEspecialidad] = useState<Especialidad | null>(especialidadInicial ?? null);
  const [medico, setMedico] = useState<Medico | null>(medicoInicial ?? null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  // Las funciones van adentro porque solo usan los setState, que son estables.
  const value = useMemo(() => {
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
    return { especialidad, medico, fecha, hora, elegirEspecialidad, elegirMedico, elegirFecha, elegirHora };
  }, [especialidad, medico, fecha, hora]);

  return <SacarTurnoContext.Provider value={value}>{children}</SacarTurnoContext.Provider>;
}

export function useSacarTurno() {
  const contexto = useContext(SacarTurnoContext);
  if (contexto === undefined) {
    throw new Error('useSacarTurno tiene que usarse dentro de un SacarTurnoProvider');
  }
  return contexto;
}
