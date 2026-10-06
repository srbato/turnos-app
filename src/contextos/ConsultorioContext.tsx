import { createContext, ReactNode, useContext, useMemo } from 'react';

import { CONSULTORIOS, ID_CONSULTORIO_ACTIVO, type Consultorio } from '@/datos/consultorio';

// El consultorio con el que se está trabajando. Es el "super objeto" que encapsula a los pacientes, médicos,
// secretarias y turnos: los demás contextos le piden sus datos iniciales a él y nunca leen listas sueltas, así cada
// consultorio ve solo lo suyo. Por ahora el activo es fijo (ver ID_CONSULTORIO_ACTIVO): con backend, el consultorio
// del usuario lo va a definir su cuenta y no se va a elegir desde la app.

type ConsultorioContextType = {
  consultorio: Consultorio; // el activo
  consultorios: Consultorio[]; // todos los que administra la app
};

const ConsultorioContext = createContext<ConsultorioContextType | undefined>(undefined);

export function ConsultorioProvider({ children }: { children: ReactNode }) {
  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    const consultorio = CONSULTORIOS.find((c) => c.id === ID_CONSULTORIO_ACTIVO) ?? CONSULTORIOS[0];
    return { consultorio, consultorios: CONSULTORIOS };
  }, []);

  return <ConsultorioContext.Provider value={value}>{children}</ConsultorioContext.Provider>;
}

export function useConsultorio() {
  const contexto = useContext(ConsultorioContext);
  if (contexto === undefined) {
    throw new Error('useConsultorio tiene que usarse dentro de un ConsultorioProvider');
  }
  return contexto;
}
