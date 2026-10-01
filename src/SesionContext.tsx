import { createContext, ReactNode, useState } from 'react';
import { Medico, MEDICOS } from './datos';

// Guarda qué médico inició sesión, para que la agenda y el perfil muestren sus datos.

export const SesionContext = createContext({
  medicoLogueado: MEDICOS[0],
  setMedicoLogueado: (medico: Medico) => {},
});

type PropsSesionProvider = {
  children: ReactNode;
};

export function SesionProvider(props: PropsSesionProvider) {
  const [medicoLogueado, setMedicoLogueado] = useState(MEDICOS[0]);

  return (
    <SesionContext.Provider value={{ medicoLogueado, setMedicoLogueado }}>
      {props.children}
    </SesionContext.Provider>
  );
}
