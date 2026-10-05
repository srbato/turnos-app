import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { MEDICOS, type Medico } from '@/datos/consultorio';

// Guarda qué médico inició sesión, para que la agenda y el perfil muestren sus datos.
// Todavía no hay backend: el login compara usuario y contraseña de prueba (ver MEDICOS en datos/consultorio).

type SesionContextType = {
  medicoLogueado: Medico;
  setMedicoLogueado: (medico: Medico) => void;
};

const SesionContext = createContext<SesionContextType | undefined>(undefined);

export function SesionProvider({ children }: { children: ReactNode }) {
  // Por defecto, el primer médico de la lista (para entrar directo a /medico sin pasar por el login).
  const [medicoLogueado, setMedicoLogueado] = useState<Medico>(MEDICOS[0]);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => ({ medicoLogueado, setMedicoLogueado }), [medicoLogueado]);

  return <SesionContext.Provider value={value}>{children}</SesionContext.Provider>;
}

export function useSesion() {
  const contexto = useContext(SesionContext);
  if (contexto === undefined) {
    throw new Error('useSesion tiene que usarse dentro de un SesionProvider');
  }
  return contexto;
}
