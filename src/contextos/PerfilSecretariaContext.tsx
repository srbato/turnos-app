import { createContext, ReactNode, useContext } from 'react';

import { usePersonal, useSecretariaLogueada } from '@/contextos/PersonalContext';
import { pedir } from '@/servicios/api';

// El perfil de la secretaria que inició sesión. Sus datos ya vienen en el personal del consultorio (PersonalContext).
// El DNI no se edita desde la app.
export type PerfilSecretaria = {
  nombre: string;
  email: string;
  telefono: string;
  domicilio: string;
  turnoTrabajo: string; // días y horario en que trabaja
  fotoUri: string | null; // foto elegida (data URI), o null para mostrar las iniciales
};

// Lo que se comparte: los datos del perfil y las funciones para cambiarlos. Devuelven el error, o '' si salió bien.
type PerfilSecretariaContextType = PerfilSecretaria & {
  dni: string;
  actualizarPerfil: (perfilNuevo: PerfilSecretaria) => Promise<string>;
  cambiarContrasena: (actual: string, nueva: string) => Promise<string>;
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PerfilSecretariaContextType = {
  nombre: '',
  email: '',
  telefono: '',
  domicilio: '',
  turnoTrabajo: '',
  fotoUri: null,
  dni: '',
  actualizarPerfil: async () => '',
  cambiarContrasena: async () => '',
};

const PerfilSecretariaContext = createContext(VALOR_POR_DEFECTO);

export function PerfilSecretariaProvider({ children }: { children: ReactNode }) {
  const secretaria = useSecretariaLogueada();
  const { recargarPersonal } = usePersonal();

  // Mientras no inició sesión una secretaria, se muestra el perfil vacío.
  if (!secretaria) {
    return <PerfilSecretariaContext.Provider value={VALOR_POR_DEFECTO}>{children}</PerfilSecretariaContext.Provider>;
  }
  const id = secretaria.id;

  async function actualizarPerfil(perfilNuevo: PerfilSecretaria) {
    const respuesta = await pedir('PATCH', `/api/secretarias/${id}`, perfilNuevo);
    if (respuesta.ok) {
      await recargarPersonal();
    }
    return respuesta.error;
  }

  // La API revisa que la contraseña actual sea la correcta.
  async function cambiarContrasena(actual: string, nueva: string) {
    const respuesta = await pedir('PATCH', `/api/secretarias/${id}/contrasena`, { actual: actual, nueva: nueva });
    return respuesta.error;
  }

  return (
    <PerfilSecretariaContext.Provider
      value={{
        nombre: secretaria.nombre,
        email: secretaria.email,
        telefono: secretaria.telefono,
        domicilio: secretaria.domicilio,
        turnoTrabajo: secretaria.horario,
        fotoUri: secretaria.fotoUri,
        dni: secretaria.dni,
        actualizarPerfil,
        cambiarContrasena,
      }}>
      {children}
    </PerfilSecretariaContext.Provider>
  );
}

export function usePerfilSecretaria() {
  return useContext(PerfilSecretariaContext);
}
