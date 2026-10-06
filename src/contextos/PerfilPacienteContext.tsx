import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type PerfilPaciente = {
  nombre: string;
  dni: string; // se carga al registrarse y después no se edita: con backend se validaría contra el RENAPER
  contrasena: string; // de prueba: todavía no hay backend que la guarde de forma segura
  email: string;
  telefono: string;
  domicilio: string;
  fotoUri: string | null; // foto elegida de la galería (data URI), o null para mostrar las iniciales
  coberturaIds: string[]; // obras sociales del paciente (ids de datos/catalogo)
  numerosAfiliado: Record<string, string>; // N° de afiliado de cada obra social (clave = id de la obra social)
  alergias: string; // texto libre; lo ve el médico
};

type PerfilPacienteContextType = PerfilPaciente & {
  actualizarPerfil: (cambios: Partial<PerfilPaciente>) => void;
};

const CLAVE_STORAGE = 'perfil-paciente';

const PERFIL_INICIAL: PerfilPaciente = {
  nombre: 'Valentín Michelic',
  dni: '40.123.456',
  contrasena: 'p',
  email: 'valentin@test.com',
  telefono: '',
  domicilio: '',
  fotoUri: null,
  coberturaIds: ['swiss-smg20', 'osde-210'],
  numerosAfiliado: { 'swiss-smg20': '62-4418902/01' },
  alergias: 'penicilina',
};

const PerfilPacienteContext = createContext<PerfilPacienteContextType | undefined>(undefined);

export function PerfilPacienteProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilPaciente>(PERFIL_INICIAL);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarPerfil() {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_STORAGE);
        if (guardado !== null) {
          setPerfil({ ...PERFIL_INICIAL, ...JSON.parse(guardado) });
        }
      } catch {
        // Si falla la lectura, se queda con el perfil inicial.
      }
    }
    cargarPerfil();
  }, []);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    async function actualizarPerfil(cambios: Partial<PerfilPaciente>) {
      const nuevo = { ...perfil, ...cambios };
      setPerfil(nuevo);
      try {
        await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevo));
      } catch {
        // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
      }
    }
    return { ...perfil, actualizarPerfil };
  }, [perfil]);

  return <PerfilPacienteContext.Provider value={value}>{children}</PerfilPacienteContext.Provider>;
}

export function usePerfilPaciente() {
  const contexto = useContext(PerfilPacienteContext);
  if (contexto === undefined) {
    throw new Error('usePerfilPaciente tiene que usarse dentro de un PerfilPacienteProvider');
  }
  return contexto;
}
