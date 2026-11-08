import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { avisarCuandoVenza, guardarToken, ID_CONSULTORIO, pedir } from '@/servicios/api';

// Quién inició sesión: un paciente, un médico o una secretaria. El login lo valida la API (POST /api/login).
// Se guarda en el dispositivo, así al volver a abrir la app no hay que ingresar de nuevo.

export type Rol = 'paciente' | 'medico' | 'secretaria';

export type Usuario = {
  rol: Rol;
  id: string; // el id de esa persona en la base (como texto, igual que el resto de los ids de la app)
  nombre: string;
  token: string; // el "pase" que dio la API al iniciar sesión: se manda en cada pedido
};

// Lo que se manda al registrarse como paciente (POST /api/pacientes).
export type DatosRegistro = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  domicilio: string;
  alergias: string;
  contrasena: string;
  coberturas: { id: string; numeroAfiliado: string }[];
};

type SesionContextType = {
  usuario: Usuario | null; // null: nadie inició sesión
  idPaciente: string; // el id del paciente que inició sesión ('' si no es un paciente)
  iniciarSesion: (rol: Rol, email: string, contrasena: string) => Promise<string>; // devuelve el error, o '' si entró
  cerrarSesion: () => void;
  registrarPaciente: (datos: DatosRegistro) => Promise<string>; // devuelve el error, o '' si se creó la cuenta
};

const CLAVE_STORAGE = 'sesion';

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: SesionContextType = {
  usuario: null,
  idPaciente: '',
  iniciarSesion: async () => '',
  cerrarSesion: () => {},
  registrarPaciente: async () => '',
};

const SesionContext = createContext(VALOR_POR_DEFECTO);

export function SesionProvider({ children }: { children: ReactNode }) {
  const { recargarPacientes, vaciarPacientes } = useConsultorio();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Al abrir la app se recupera la sesión guardada en el dispositivo, si hay una.
  useEffect(() => {
    async function cargarSesion() {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_STORAGE);
        if (guardado !== null) {
          const sesion: Usuario = JSON.parse(guardado);
          // Una sesión guardada sin token no sirve: hay que volver a ingresar.
          if (sesion.token) {
            guardarToken(sesion.token);
            setUsuario(sesion);
          }
        }
      } catch {
        // Si falla la lectura, hay que volver a ingresar.
      }
    }
    cargarSesion();

    // Si la API rechaza el token, se cierra la sesión y se vuelve al inicio.
    avisarCuandoVenza(() => {
      guardarSesion(null);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    });
  }, []);

  // Los pacientes solo se pueden pedir con una sesión iniciada; al cerrarla, no quedan en memoria.
  useEffect(() => {
    if (usuario === null) {
      vaciarPacientes();
    } else {
      recargarPacientes();
    }
  }, [usuario]);

  async function guardarSesion(nuevo: Usuario | null) {
    // El token se guarda antes que el usuario: los contextos cargan sus datos apenas cambia el usuario.
    guardarToken(nuevo === null ? '' : nuevo.token);
    setUsuario(nuevo);
    try {
      if (nuevo === null) {
        await AsyncStorage.removeItem(CLAVE_STORAGE);
      } else {
        await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevo));
      }
    } catch {
      // Si falla el guardado, la sesión igual queda en memoria hasta cerrar la app.
    }
  }

  async function iniciarSesion(rol: Rol, email: string, contrasena: string) {
    const respuesta = await pedir('POST', '/api/login', {
      consultorioId: ID_CONSULTORIO,
      rol: rol,
      email: email,
      contrasena: contrasena,
    });
    if (!respuesta.ok) {
      return respuesta.error;
    }
    await guardarSesion({
      rol: rol,
      id: String(respuesta.datos.id),
      nombre: respuesta.datos.nombre,
      token: respuesta.datos.token,
    });
    return '';
  }

  function cerrarSesion() {
    guardarSesion(null);
  }

  async function registrarPaciente(datos: DatosRegistro) {
    const respuesta = await pedir('POST', '/api/pacientes', { ...datos, consultorioId: ID_CONSULTORIO });
    return respuesta.error;
  }

  let idPaciente = '';
  if (usuario && usuario.rol === 'paciente') {
    idPaciente = usuario.id;
  }

  return (
    <SesionContext.Provider value={{ usuario, idPaciente, iniciarSesion, cerrarSesion, registrarPaciente }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  return useContext(SesionContext);
}
