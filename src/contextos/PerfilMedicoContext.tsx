import { createContext, ReactNode, useContext } from 'react';

import { useMedicoLogueado, usePersonal } from '@/contextos/PersonalContext';
import { pedir } from '@/servicios/api';

// Lo que cada médico puede editar de su perfil. El nombre, la matrícula, la especialidad y el email no se editan
// acá: figuran en los turnos y en el ingreso, así que los cambia Secretaría desde la ficha del médico.
export type PerfilMedico = {
  telefono: string;
  domicilio: string;
  fotoUri: string | null; // foto elegida (data URI), o null para mostrar las iniciales
};

// Lo que se comparte: los datos del perfil y la función para cambiarlos (devuelve el error, o '' si se guardó).
type PerfilMedicoContextType = PerfilMedico & {
  actualizarPerfil: (perfilNuevo: PerfilMedico) => Promise<string>;
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PerfilMedicoContextType = {
  telefono: '',
  domicilio: '',
  fotoUri: null,
  actualizarPerfil: async () => '',
};

const PerfilMedicoContext = createContext(VALOR_POR_DEFECTO);

// El perfil del médico que inició sesión. Sus datos ya vienen en el personal del consultorio (PersonalContext).
export function PerfilMedicoProvider({ children }: { children: ReactNode }) {
  const medico = useMedicoLogueado();
  const { recargarPersonal } = usePersonal();

  async function actualizarPerfil(perfilNuevo: PerfilMedico) {
    const respuesta = await pedir('PATCH', `/api/medicos/${medico.id}`, perfilNuevo);
    if (respuesta.ok) {
      await recargarPersonal();
    }
    return respuesta.error;
  }

  return (
    <PerfilMedicoContext.Provider
      value={{
        telefono: medico.telefono,
        domicilio: medico.domicilio,
        fotoUri: medico.fotoUri,
        actualizarPerfil,
      }}>
      {children}
    </PerfilMedicoContext.Provider>
  );
}

export function usePerfilMedico() {
  return useContext(PerfilMedicoContext);
}
