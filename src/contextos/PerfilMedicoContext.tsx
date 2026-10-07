import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useSesion } from '@/contextos/SesionContext';

// Lo que cada médico puede editar de su perfil. El nombre, la matrícula, la especialidad y el email no se editan
// acá: figuran en los turnos y en el ingreso, así que los cambia Secretaría desde la ficha del médico.
export type PerfilMedico = {
  telefono: string;
  domicilio: string;
  fotoUri: string | null; // foto elegida (data URI), o null para mostrar las iniciales
};

// Lo que se comparte: los datos del perfil y la función para cambiarlos.
type PerfilMedicoContextType = PerfilMedico & {
  actualizarPerfil: (perfilNuevo: PerfilMedico) => void;
};

const CLAVE_STORAGE = 'perfil-medicos';

const PERFIL_VACIO: PerfilMedico = { telefono: '', domicilio: '', fotoUri: null };

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PerfilMedicoContextType = {
  ...PERFIL_VACIO,
  actualizarPerfil: () => {},
};

const PerfilMedicoContext = createContext(VALOR_POR_DEFECTO);

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

  // El perfil del médico que inició sesión (vacío si todavía no editó nada).
  let perfil = PERFIL_VACIO;
  if (perfiles[medicoLogueado.matricula]) {
    perfil = perfiles[medicoLogueado.matricula];
  }

  // Guarda el perfil nuevo del médico que inició sesión, sin tocar el de los demás.
  async function actualizarPerfil(perfilNuevo: PerfilMedico) {
    const nuevos = { ...perfiles };
    nuevos[medicoLogueado.matricula] = perfilNuevo;
    setPerfiles(nuevos);
    try {
      await AsyncStorage.setItem(claveStorage, JSON.stringify(nuevos));
    } catch {
      // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
    }
  }

  return (
    <PerfilMedicoContext.Provider value={{ ...perfil, actualizarPerfil }}>{children}</PerfilMedicoContext.Provider>
  );
}

export function usePerfilMedico() {
  return useContext(PerfilMedicoContext);
}
