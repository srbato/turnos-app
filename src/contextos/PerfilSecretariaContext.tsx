import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';

// El DNI no se guarda ni se edita: es único y, con backend, se validaría contra el RENAPER.
export const DNI_SECRETARIA = '28.774.310';

export type PerfilSecretaria = {
  nombre: string;
  email: string;
  telefono: string;
  domicilio: string;
  turnoTrabajo: string; // días y horario en que trabaja
  fotoUri: string | null; // foto elegida (data URI), o null para mostrar las iniciales
};

type PerfilSecretariaContextType = PerfilSecretaria & {
  actualizarPerfil: (cambios: Partial<PerfilSecretaria>) => void;
};

const CLAVE_STORAGE = 'perfil-secretaria';

const PerfilSecretariaContext = createContext<PerfilSecretariaContextType | undefined>(undefined);

export function PerfilSecretariaProvider({ children }: { children: ReactNode }) {
  // La secretaria que usa la app es la primera de su consultorio.
  const { consultorio } = useConsultorio();
  const secretaria = consultorio.secretarias[0];
  const perfilInicial: PerfilSecretaria = {
    nombre: secretaria.nombre,
    email: secretaria.email,
    telefono: '',
    domicilio: '',
    turnoTrabajo: secretaria.horario,
    fotoUri: null,
  };
  const claveStorage = `${CLAVE_STORAGE}-${consultorio.id}`;
  const [perfil, setPerfil] = useState<PerfilSecretaria>(perfilInicial);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarPerfil() {
      try {
        const guardado = await AsyncStorage.getItem(claveStorage);
        if (guardado !== null) {
          setPerfil({ ...perfilInicial, ...JSON.parse(guardado) });
        }
      } catch {
        // Si falla la lectura, se queda con el perfil inicial.
      }
    }
    cargarPerfil();
  }, []);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    async function actualizarPerfil(cambios: Partial<PerfilSecretaria>) {
      const nuevo = { ...perfil, ...cambios };
      setPerfil(nuevo);
      try {
        await AsyncStorage.setItem(claveStorage, JSON.stringify(nuevo));
      } catch {
        // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
      }
    }
    return { ...perfil, actualizarPerfil };
  }, [perfil]);

  return <PerfilSecretariaContext.Provider value={value}>{children}</PerfilSecretariaContext.Provider>;
}

export function usePerfilSecretaria() {
  const contexto = useContext(PerfilSecretariaContext);
  if (contexto === undefined) {
    throw new Error('usePerfilSecretaria tiene que usarse dentro de un PerfilSecretariaProvider');
  }
  return contexto;
}
