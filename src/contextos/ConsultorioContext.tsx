import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { CONSULTORIOS, ID_CONSULTORIO_ACTIVO, type Consultorio } from '@/datos/consultorio';

// El consultorio con el que se está trabajando. Es el "super objeto" que encapsula a los pacientes, médicos,
// secretarias y turnos: los demás contextos le piden sus datos iniciales a él y nunca leen listas sueltas, así cada
// consultorio ve solo lo suyo. Al cambiar de consultorio, el layout raíz vuelve a armar los demás contextos
// (ver app/_layout.tsx), que arrancan con los datos del nuevo.

type ConsultorioContextType = {
  consultorio: Consultorio; // el activo
  consultorios: Consultorio[]; // todos los que administra la app
  elegirConsultorio: (id: string) => void;
};

const ConsultorioContext = createContext<ConsultorioContextType | undefined>(undefined);

export function ConsultorioProvider({ children }: { children: ReactNode }) {
  const [idActivo, setIdActivo] = useState(ID_CONSULTORIO_ACTIVO);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    const consultorio = CONSULTORIOS.find((c) => c.id === idActivo) ?? CONSULTORIOS[0];
    return { consultorio, consultorios: CONSULTORIOS, elegirConsultorio: setIdActivo };
  }, [idActivo]);

  return <ConsultorioContext.Provider value={value}>{children}</ConsultorioContext.Provider>;
}

export function useConsultorio() {
  const contexto = useContext(ConsultorioContext);
  if (contexto === undefined) {
    throw new Error('useConsultorio tiene que usarse dentro de un ConsultorioProvider');
  }
  return contexto;
}
