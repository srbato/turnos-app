import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useSesion } from '@/contextos/SesionContext';
import { pedir } from '@/servicios/api';

// El perfil del paciente que inició sesión. Viene de la API (GET /api/pacientes/:id) y los cambios se guardan ahí.

export type PerfilPaciente = {
  nombre: string;
  apellido: string;
  dni: string; // se carga al registrarse y después no se edita: lo carga y lo corrige la secretaría del consultorio
  email: string;
  telefono: string;
  domicilio: string;
  fotoUri: string | null; // foto elegida de la galería (data URI), o null para mostrar las iniciales
  coberturaIds: string[]; // obras sociales del paciente (ids de la tabla de coberturas)
  numerosAfiliado: Record<string, string>; // N° de afiliado de cada obra social (clave = id de la obra social)
  alergias: string; // texto libre; lo ve el médico
};

// Lo que se comparte: los datos del perfil y las funciones para cambiarlos. Devuelven el error, o '' si salió bien.
type PerfilPacienteContextType = PerfilPaciente & {
  actualizarPerfil: (perfilNuevo: PerfilPaciente) => Promise<string>;
  cambiarContrasena: (actual: string, nueva: string) => Promise<string>;
};

const PERFIL_VACIO: PerfilPaciente = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  domicilio: '',
  fotoUri: null,
  coberturaIds: [],
  numerosAfiliado: {},
  alergias: '',
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PerfilPacienteContextType = {
  ...PERFIL_VACIO,
  actualizarPerfil: async () => '',
  cambiarContrasena: async () => '',
};

const PerfilPacienteContext = createContext(VALOR_POR_DEFECTO);

// Un paciente tal como lo devuelve la API.
type PacienteApi = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  domicilio: string;
  fotoUri: string | null;
  alergias: string;
  coberturas: { coberturaId: string; numeroAfiliado: string }[];
};

function perfilDesdeApi(paciente: PacienteApi): PerfilPaciente {
  const numerosAfiliado: Record<string, string> = {};
  paciente.coberturas.forEach((cobertura) => {
    if (cobertura.numeroAfiliado !== '') {
      numerosAfiliado[cobertura.coberturaId] = cobertura.numeroAfiliado;
    }
  });
  return {
    nombre: paciente.nombre,
    apellido: paciente.apellido,
    dni: paciente.dni,
    email: paciente.email,
    telefono: paciente.telefono,
    domicilio: paciente.domicilio,
    fotoUri: paciente.fotoUri,
    coberturaIds: paciente.coberturas.map((cobertura) => cobertura.coberturaId),
    numerosAfiliado: numerosAfiliado,
    alergias: paciente.alergias,
  };
}

export function PerfilPacienteProvider({ children }: { children: ReactNode }) {
  const { recargarPacientes } = useConsultorio();
  const { idPaciente } = useSesion();
  const [perfil, setPerfil] = useState(PERFIL_VACIO);

  async function cargarPerfil() {
    if (idPaciente === '') {
      setPerfil(PERFIL_VACIO);
      return;
    }
    const respuesta = await pedir('GET', `/api/pacientes/${idPaciente}`);
    if (respuesta.ok) {
      setPerfil(perfilDesdeApi(respuesta.datos));
    }
  }

  // Se carga cada vez que inicia sesión otro paciente.
  useEffect(() => {
    cargarPerfil();
  }, [idPaciente]);

  async function actualizarPerfil(perfilNuevo: PerfilPaciente) {
    const respuesta = await pedir('PATCH', `/api/pacientes/${idPaciente}`, {
      nombre: perfilNuevo.nombre,
      apellido: perfilNuevo.apellido,
      email: perfilNuevo.email,
      telefono: perfilNuevo.telefono,
      domicilio: perfilNuevo.domicilio,
      alergias: perfilNuevo.alergias,
      fotoUri: perfilNuevo.fotoUri,
      coberturas: perfilNuevo.coberturaIds.map((id) => ({
        id: id,
        numeroAfiliado: perfilNuevo.numerosAfiliado[id] ?? '',
      })),
    });
    if (!respuesta.ok) {
      return respuesta.error;
    }
    setPerfil(perfilDesdeApi(respuesta.datos));
    // El médico y la secretaría ven al paciente con sus datos nuevos.
    await recargarPacientes();
    return '';
  }

  // La API revisa que la contraseña actual sea la correcta.
  async function cambiarContrasena(actual: string, nueva: string) {
    const respuesta = await pedir('PATCH', `/api/pacientes/${idPaciente}/contrasena`, { actual: actual, nueva: nueva });
    return respuesta.error;
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
