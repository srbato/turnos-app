import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { Cobertura } from '@/datos/catalogo';
import { Paciente } from '@/datos/consultorio';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// El consultorio con el que se trabaja: sus datos, su configuración (Ajustes) y sus pacientes, y las obras sociales que
// existen en la app. Todo viene de la API.
// Es lo primero que se carga: hasta que llega, la app muestra una pantalla de espera.

export type Consultorio = {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  atencion: string; // días y horarios de atención, como texto
  duracionTurno: number; // minutos de cada turno
  sobreturnos: number;
  recordatorioAutomatico: boolean;
  puntosRiesgoMedio: number;
  puntosRiesgoAlto: number;
  avisosAntesDeActuar: number;
  pacientes: Paciente[];
};

type ConsultorioContextType = {
  consultorio: Consultorio;
  coberturas: Cobertura[]; // todas las obras sociales que se pueden elegir
  recargarConsultorio: () => Promise<void>; // después de cambiar los Ajustes
  recargarPacientes: () => Promise<void>; // después de un registro o de cambiar un perfil
};

const CONSULTORIO_VACIO: Consultorio = {
  id: ID_CONSULTORIO,
  nombre: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  atencion: '',
  duracionTurno: 20,
  sobreturnos: 0,
  recordatorioAutomatico: false,
  puntosRiesgoMedio: 1,
  puntosRiesgoAlto: 2,
  avisosAntesDeActuar: 3,
  pacientes: [],
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: ConsultorioContextType = {
  consultorio: CONSULTORIO_VACIO,
  coberturas: [],
  recargarConsultorio: async () => {},
  recargarPacientes: async () => {},
};

const ConsultorioContext = createContext(VALOR_POR_DEFECTO);

// Un paciente tal como lo devuelve la API (GET /api/pacientes).
type PacienteApi = {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  alergias: string;
  alerta: string;
  faltas: number;
  asistencias: number;
  coberturas: { coberturaId: string; numeroAfiliado: string; cobertura: { nombre: string } }[];
};

// Convierte un paciente de la API a la forma que usan las pantallas.
function pacienteDesdeApi(paciente: PacienteApi): Paciente {
  const coberturas = paciente.coberturas.map((c) => c.cobertura.nombre);
  // Un N° de afiliado por cada obra social que lo tenga cargado: "Swiss Medical SMG20: 62-4418902/01".
  const afiliados = paciente.coberturas
    .filter((c) => c.numeroAfiliado !== '')
    .map((c) => `${c.cobertura.nombre}: ${c.numeroAfiliado}`);
  return {
    id: String(paciente.id),
    dni: paciente.dni,
    nombre: paciente.nombre,
    apellido: paciente.apellido,
    iniciales: `${paciente.nombre[0] ?? ''}${paciente.apellido[0] ?? ''}`.toUpperCase(),
    email: paciente.email,
    coberturaIds: paciente.coberturas.map((c) => c.coberturaId),
    cobertura: coberturas.length > 0 ? coberturas.join(' / ') : 'Sin cobertura cargada',
    plan: '',
    numeroAfiliado: afiliados.length > 0 ? afiliados.join(' · ') : 'No cargado',
    alergias: paciente.alergias || 'No informó',
    alerta: paciente.alerta,
    faltas: paciente.faltas,
    asistencias: paciente.asistencias,
  };
}

export function ConsultorioProvider({ children }: { children: ReactNode }) {
  const [consultorio, setConsultorio] = useState(CONSULTORIO_VACIO);
  const [coberturas, setCoberturas] = useState<Cobertura[]>([]);
  const [cargado, setCargado] = useState(false);
  const [error, setError] = useState('');

  async function cargarPacientes() {
    const respuesta = await pedir('GET', `/api/pacientes?consultorioId=${ID_CONSULTORIO}`);
    if (respuesta.ok) {
      const pacientes: Paciente[] = respuesta.datos.map(pacienteDesdeApi);
      setConsultorio((anterior) => ({ ...anterior, pacientes: pacientes }));
    }
    return respuesta;
  }

  async function cargarConsultorio() {
    const respuesta = await pedir('GET', `/api/consultorios/${ID_CONSULTORIO}`);
    if (respuesta.ok) {
      // Los datos del consultorio llegan sin los pacientes: se conservan los que ya estaban.
      setConsultorio((anterior) => ({ ...respuesta.datos, pacientes: anterior.pacientes }));
    }
    return respuesta;
  }

  async function cargarCoberturas() {
    const respuesta = await pedir('GET', '/api/coberturas');
    if (respuesta.ok) {
      setCoberturas(respuesta.datos);
    }
    return respuesta;
  }

  // Primera carga: el consultorio, sus pacientes y las obras sociales. Si la API no responde, se muestra el error y un botón para reintentar.
  async function cargarTodo() {
    setError('');
    const datos = await cargarConsultorio();
    const pacientes = await cargarPacientes();
    const listaCoberturas = await cargarCoberturas();
    if (!datos.ok || !pacientes.ok || !listaCoberturas.ok) {
      setError(datos.error || pacientes.error || listaCoberturas.error);
      return;
    }
    setCargado(true);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  async function recargarConsultorio() {
    await cargarConsultorio();
  }

  async function recargarPacientes() {
    await cargarPacientes();
  }

  if (!cargado) {
    return (
      <View style={styles.espera}>
        {error === '' ? (
          <ActivityIndicator size="large" color={COLOR_PACIENTE} />
        ) : (
          <>
            <Text style={styles.titulo}>{error}</Text>
            <Text style={styles.detalle}>Revisá que la API esté encendida (npm run dev en turnos-api).</Text>
            <Pressable style={styles.boton} onPress={cargarTodo}>
              <Text style={styles.botonTexto}>Reintentar</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <ConsultorioContext.Provider value={{ consultorio, coberturas, recargarConsultorio, recargarPacientes }}>
      {children}
    </ConsultorioContext.Provider>
  );
}

export function useConsultorio() {
  return useContext(ConsultorioContext);
}

const styles = StyleSheet.create({
  espera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  detalle: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
    marginTop: 8,
  },
  boton: {
    marginTop: 20,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
