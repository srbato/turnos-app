import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

// Lo que se comparte: los datos del perfil y las funciones para cambiarlos.
type PerfilPacienteContextType = PerfilPaciente & {
  actualizarPerfil: (perfilNuevo: PerfilPaciente) => void;
  cambiarContrasena: (nueva: string) => void;
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

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PerfilPacienteContextType = {
  ...PERFIL_INICIAL,
  actualizarPerfil: () => {},
  cambiarContrasena: () => {},
};

const PerfilPacienteContext = createContext(VALOR_POR_DEFECTO);

export function PerfilPacienteProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState(PERFIL_INICIAL);

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

  // Reemplaza el perfil por el nuevo y lo guarda en el dispositivo.
  async function actualizarPerfil(perfilNuevo: PerfilPaciente) {
    setPerfil(perfilNuevo);
    try {
      await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(perfilNuevo));
    } catch {
      // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
    }
  }

  function cambiarContrasena(nueva: string) {
    actualizarPerfil({ ...perfil, contrasena: nueva });
  }

  return (
    <PerfilPacienteContext.Provider value={{ ...perfil, actualizarPerfil, cambiarContrasena }}>
      {children}
    </PerfilPacienteContext.Provider>
  );
}

export function usePerfilPaciente() {
  return useContext(PerfilPacienteContext);
}
