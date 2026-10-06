import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useSesion } from '@/contextos/SesionContext';

// Lo que cada médico puede editar de su perfil. El nombre, la matrícula, la especialidad y el email no se editan
// acá: figuran en los turnos y en el ingreso, así que los cambia Secretaría desde la ficha del médico.
export type PerfilMedico = {
  telefono: string;
  domicilio: string;
  fotoUri: string | null; // foto elegida (data URI), o null para mostrar las iniciales
};

type PerfilMedicoContextType = PerfilMedico & {
  actualizarPerfil: (cambios: Partial<PerfilMedico>) => void;
};

const CLAVE_STORAGE = 'perfil-medicos';

const PERFIL_VACIO: PerfilMedico = { telefono: '', domicilio: '', fotoUri: null };

const PerfilMedicoContext = createContext<PerfilMedicoContextType | undefined>(undefined);

// Guarda el perfil de cada médico del consultorio (por matrícula) y expone el del médico que inició sesión.
export function PerfilMedicoProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const { medicoLogueado } = useSesion();
  const [perfiles, setPerfiles] = useState<Record<string, PerfilMedico>>({});
  const claveStorage = `${CLAVE_STORAGE}-${consultorio.id}`;

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarPerfiles() {
      try {
        const guardado = await AsyncStorage.getItem(claveStorage);
        if (guardado !== null) {
          setPerfiles(JSON.parse(guardado));
        }
      } catch {
        // Si falla la lectura, se queda sin perfiles guardados.
      }
    }
    cargarPerfiles();
  }, []);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    async function actualizarPerfil(cambios: Partial<PerfilMedico>) {
      const nuevos = {
        ...perfiles,
        [medicoLogueado.matricula]: { ...PERFIL_VACIO, ...perfiles[medicoLogueado.matricula], ...cambios },
      };
      setPerfiles(nuevos);
      try {
        await AsyncStorage.setItem(claveStorage, JSON.stringify(nuevos));
      } catch {
        // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
      }
    }
    return { ...PERFIL_VACIO, ...perfiles[medicoLogueado.matricula], actualizarPerfil };
  }, [perfiles, medicoLogueado]);

  return <PerfilMedicoContext.Provider value={value}>{children}</PerfilMedicoContext.Provider>;
}

export function usePerfilMedico() {
  const contexto = useContext(PerfilMedicoContext);
  if (contexto === undefined) {
    throw new Error('usePerfilMedico tiene que usarse dentro de un PerfilMedicoProvider');
  }
  return contexto;
}
