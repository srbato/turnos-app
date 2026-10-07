import { createContext, ReactNode, useContext, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { CONSULTORIOS, Medico } from '@/datos/consultorio';

// Guarda qué médico inició sesión, para que la agenda y el perfil muestren sus datos.
// Todavía no hay backend: el login compara usuario y contraseña de prueba (ver los médicos de cada consultorio en datos/consultorio).

type SesionContextType = {
  medicoLogueado: Medico;
  setMedicoLogueado: (medico: Medico) => void;
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: SesionContextType = {
  medicoLogueado: CONSULTORIOS[0].medicos[0],
  setMedicoLogueado: () => {},
};

const SesionContext = createContext(VALOR_POR_DEFECTO);

export function SesionProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  // Por defecto, el primer médico del consultorio (para entrar directo a /medico sin pasar por el login).
  const [medicoLogueado, setMedicoLogueado] = useState(consultorio.medicos[0]);

  return (
    <SesionContext.Provider value={{ medicoLogueado, setMedicoLogueado }}>{children}</SesionContext.Provider>
  );
}

export function useSesion() {
  return useContext(SesionContext);
}
