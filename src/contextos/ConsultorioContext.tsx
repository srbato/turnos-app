import { createContext, ReactNode, useContext } from 'react';

import { CONSULTORIOS, ID_CONSULTORIO_ACTIVO, Consultorio } from '@/datos/consultorio';

// El consultorio con el que se está trabajando. Es el "super objeto" que encapsula a los pacientes, médicos,
// secretarias y turnos: los demás contextos le piden sus datos iniciales a él y nunca leen listas sueltas, así cada
// consultorio ve solo lo suyo. Por ahora el activo es fijo (ver ID_CONSULTORIO_ACTIVO): con backend, el consultorio
// del usuario lo va a definir su cuenta y no se va a elegir desde la app.

type ConsultorioContextType = {
  consultorio: Consultorio; // el activo
  consultorios: Consultorio[]; // todos los que administra la app
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: ConsultorioContextType = {
  consultorio: CONSULTORIOS[0],
  consultorios: CONSULTORIOS,
};

const ConsultorioContext = createContext(VALOR_POR_DEFECTO);

export function ConsultorioProvider({ children }: { children: ReactNode }) {
  let consultorio = CONSULTORIOS[0];
  const activo = CONSULTORIOS.find((c) => c.id === ID_CONSULTORIO_ACTIVO);
  if (activo) {
    consultorio = activo;
  }

  return (
    <ConsultorioContext.Provider value={{ consultorio: consultorio, consultorios: CONSULTORIOS }}>
      {children}
    </ConsultorioContext.Provider>
  );
}

export function useConsultorio() {
  return useContext(ConsultorioContext);
}
