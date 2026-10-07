import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

// Lo que se comparte: los datos del perfil y la función para cambiarlos.
type PerfilSecretariaContextType = PerfilSecretaria & {
  actualizarPerfil: (perfilNuevo: PerfilSecretaria) => void;
};

const CLAVE_STORAGE = 'perfil-secretaria';

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PerfilSecretariaContextType = {
  nombre: '',
  email: '',
  telefono: '',
  domicilio: '',
  turnoTrabajo: '',
  fotoUri: null,
  actualizarPerfil: () => {},
};

const PerfilSecretariaContext = createContext(VALOR_POR_DEFECTO);

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
  const [perfil, setPerfil] = useState(perfilInicial);

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

  // Reemplaza el perfil por el nuevo y lo guarda en el dispositivo.
  async function actualizarPerfil(perfilNuevo: PerfilSecretaria) {
    setPerfil(perfilNuevo);
    try {
      await AsyncStorage.setItem(claveStorage, JSON.stringify(perfilNuevo));
    } catch {
      // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
    }
  }

  return (
    <PerfilSecretariaContext.Provider value={{ ...perfil, actualizarPerfil }}>
      {children}
    </PerfilSecretariaContext.Provider>
  );
}

export function usePerfilSecretaria() {
  return useContext(PerfilSecretariaContext);
}
