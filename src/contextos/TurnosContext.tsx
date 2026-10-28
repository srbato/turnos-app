import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useSesion } from '@/contextos/SesionContext';
import { Consulta, EstadoTurno } from '@/datos/consultorio';
import { Preconsulta } from '@/datos/preconsulta';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// Los turnos del consultorio. Los usan los tres roles: el paciente los saca, la secretaría los administra y el médico
// los atiende. Vienen de la API: cada cambio se le manda a la API y después se vuelve a pedir la lista.

export type Turno = {
  id: string;
  idPaciente: string;
  idMedico: string;
  medico: string; // nombre del médico
  especialidad: string;
  sala: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string; // nombre del consultorio
  estado: EstadoTurno;
  instrucciones: string[];
  cobertura: string; // obra social con la que se sacó ('' si fue particular)
  avisos?: string[]; // fechas (AAAA-MM-DD) en que Secretaría le avisó al paciente que confirme
  confirmo?: boolean; // el paciente confirmó este turno alguna vez (aunque después lo hayan atendido)
  motivoCancelacion?: string; // si lo canceló el sistema o Secretaría por riesgo; si falta, lo canceló una persona
  adelantoDesde?: string; // AAAA-MM-DD desde que está en la lista de espera para adelantarlo (si falta, no está)
  reservadoEl?: string; // AAAA-MM-DD en que se sacó
  consulta?: Consulta; // lo que anotó el médico al atenderlo (solo en turnos atendidos)
};

// Lo que hace falta para sacar un turno nuevo.
export type TurnoNuevo = {
  idPaciente: string;
  idMedico: string;
  fecha: string;
  hora: string;
  coberturaId: string | null; // null: particular
  adelanto: boolean; // anotarlo en la lista de espera para adelantarlo
};

// Las funciones devuelven el mensaje de error de la API, o '' si salió bien.
type TurnosContextType = {
  turnos: Turno[]; // los turnos de todos los pacientes
  misTurnos: Turno[]; // solo los del paciente que inició sesión
  preconsultas: Preconsulta[]; // las preconsultas enviadas (vienen junto con cada turno)
  recargarTurnos: () => Promise<void>;
  agregarTurno: (nuevo: TurnoNuevo) => Promise<string>;
  reprogramarTurno: (id: string, fecha: string, hora: string, estado?: EstadoTurno) => Promise<string>;
  cancelarTurno: (id: string) => Promise<string>;
  cancelarConMotivo: (id: string, motivo: string) => Promise<string>; // cancelación por riesgo de inasistencia
  enviarAviso: (id: string) => Promise<string>; // Secretaría le avisa al paciente que confirme
  cambiarEstadoTurno: (id: string, estado: EstadoTurno) => Promise<string>; // confirmar, atendido, ausente
  registrarConsulta: (id: string, consulta: Consulta) => Promise<string>; // el médico atiende y anota la consulta
  activarAdelanto: (id: string, activo: boolean) => Promise<string>; // anota o saca el turno de la lista de espera
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: TurnosContextType = {
  turnos: [],
  misTurnos: [],
  preconsultas: [],
  recargarTurnos: async () => {},
  agregarTurno: async () => '',
  reprogramarTurno: async () => '',
  cancelarTurno: async () => '',
  cancelarConMotivo: async () => '',
  enviarAviso: async () => '',
  cambiarEstadoTurno: async () => '',
  registrarConsulta: async () => '',
  activarAdelanto: async () => '',
};

const TurnosContext = createContext(VALOR_POR_DEFECTO);

// Un turno tal como lo devuelve la API (GET /api/turnos).
type TurnoApi = {
  id: number;
  pacienteId: number;
  medicoId: number;
  fecha: string;
  hora: string;
  estado: EstadoTurno;
  instrucciones: string;
  confirmo: boolean;
  motivoCancelacion: string | null;
  adelantoDesde: string | null;
  reservadoEl: string;
  medico: { nombre: string; especialidad: string; sala: string };
  paciente: { nombre: string; apellido: string };
  cobertura: { nombre: string } | null;
  avisos: { fecha: string }[];
  consulta: Consulta | null;
  preconsulta: {
    motivo: string;
    duracion: string;
    sintomas: string;
    medicacion: string;
    alergias: string;
    adicional: string;
    enviadaEl: string;
  } | null;
};

// Convierte un turno de la API a la forma que usan las pantallas. Lo que en la API es null, acá queda sin definir.
function turnoDesdeApi(turno: TurnoApi, sede: string): Turno {
  return {
    id: String(turno.id),
    idPaciente: String(turno.pacienteId),
    idMedico: String(turno.medicoId),
    medico: turno.medico.nombre,
    especialidad: turno.medico.especialidad,
    sala: turno.medico.sala,
    fecha: turno.fecha,
    hora: turno.hora,
    sede: sede,
    estado: turno.estado,
    instrucciones: turno.instrucciones === '' ? [] : turno.instrucciones.split('\n'),
    cobertura: turno.cobertura ? turno.cobertura.nombre : '',
    avisos: turno.avisos.map((aviso) => aviso.fecha),
    confirmo: turno.confirmo,
    motivoCancelacion: turno.motivoCancelacion ?? undefined,
    adelantoDesde: turno.adelantoDesde ?? undefined,
    reservadoEl: turno.reservadoEl,
    consulta: turno.consulta ?? undefined,
  };
}

// La preconsulta de un turno (si la tiene), en la forma que usan las pantallas.
function preconsultaDesdeApi(turno: TurnoApi): Preconsulta | null {
  const p = turno.preconsulta;
  if (!p) {
    return null;
  }
  // La fecha de envío llega como fecha completa: se muestra como 'AAAA-MM-DD HH:MM'.
  const enviada = new Date(p.enviadaEl);
  const dia = `${enviada.getFullYear()}-${String(enviada.getMonth() + 1).padStart(2, '0')}-${String(enviada.getDate()).padStart(2, '0')}`;
  const hora = `${String(enviada.getHours()).padStart(2, '0')}:${String(enviada.getMinutes()).padStart(2, '0')}`;
  return {
    turnoId: String(turno.id),
    paciente: `${turno.paciente.nombre} ${turno.paciente.apellido}`,
    medico: turno.medico.nombre,
    especialidad: turno.medico.especialidad,
    fecha: turno.fecha,
    hora: turno.hora,
    respuestas: {
      motivo: p.motivo,
      duracion: p.duracion,
      sintomas: p.sintomas === '' ? [] : p.sintomas.split(', '),
      medicacion: p.medicacion,
      alergias: p.alergias,
      adicional: p.adicional,
    },
    enviadaEl: `${dia} ${hora}`,
  };
}

export function TurnosProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const { idPaciente } = useSesion();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [preconsultas, setPreconsultas] = useState<Preconsulta[]>([]);

  async function recargarTurnos() {
    const respuesta = await pedir('GET', `/api/turnos?consultorioId=${ID_CONSULTORIO}`);
    if (!respuesta.ok) {
      return;
    }
    const lista: TurnoApi[] = respuesta.datos;
    setTurnos(lista.map((turno) => turnoDesdeApi(turno, consultorio.nombre)));
    const conPreconsulta: Preconsulta[] = [];
    lista.forEach((turno) => {
      const preconsulta = preconsultaDesdeApi(turno);
      if (preconsulta) {
        conPreconsulta.push(preconsulta);
      }
    });
    setPreconsultas(conPreconsulta);
  }

  // Se cargan al abrir la app y cada vez que cambia quién inició sesión.
  useEffect(() => {
    recargarTurnos();
  }, [idPaciente]);

  // Manda un cambio a la API y, si salió bien, vuelve a pedir los turnos: la pantalla muestra lo que quedó guardado.
  async function enviar(metodo: string, ruta: string, cuerpo?: object) {
    const respuesta = await pedir(metodo, ruta, cuerpo);
    if (respuesta.ok) {
      await recargarTurnos();
    }
    return respuesta.error;
  }

  function agregarTurno(nuevo: TurnoNuevo) {
    return enviar('POST', '/api/turnos', {
      pacienteId: Number(nuevo.idPaciente),
      medicoId: Number(nuevo.idMedico),
      fecha: nuevo.fecha,
      hora: nuevo.hora,
      coberturaId: nuevo.coberturaId,
      adelanto: nuevo.adelanto,
    });
  }

  // Cambia fecha y hora del mismo turno. La API lo deja pendiente hasta que se reconfirme, salvo que se diga otro estado.
  function reprogramarTurno(id: string, fecha: string, hora: string, estado?: EstadoTurno) {
    return enviar('PATCH', `/api/turnos/${id}`, { fecha: fecha, hora: hora, estado: estado });
  }

  function cancelarTurno(id: string) {
    return enviar('PATCH', `/api/turnos/${id}`, { estado: 'cancelado' });
  }

  // Cancela con un motivo guardado: así Secretaría sabe por qué, y ese horario no se ofrece solo a la lista de espera.
  function cancelarConMotivo(id: string, motivo: string) {
    return enviar('PATCH', `/api/turnos/${id}`, { estado: 'cancelado', motivoCancelacion: motivo });
  }

  // La API controla el máximo de avisos que configuró el consultorio.
  function enviarAviso(id: string) {
    return enviar('POST', `/api/turnos/${id}/avisos`);
  }

  function cambiarEstadoTurno(id: string, estado: EstadoTurno) {
    return enviar('PATCH', `/api/turnos/${id}`, { estado: estado });
  }

  // El médico atendió el turno: queda como atendido, con lo que anotó (o la corrige si ya tenía una).
  function registrarConsulta(id: string, consulta: Consulta) {
    return enviar('PUT', `/api/turnos/${id}/consulta`, consulta);
  }

  function activarAdelanto(id: string, activo: boolean) {
    return enviar('PATCH', `/api/turnos/${id}`, { adelanto: activo });
  }

  const misTurnos = turnos.filter((turno) => turno.idPaciente === idPaciente);

  return (
    <TurnosContext.Provider
      value={{
        turnos,
        misTurnos,
        preconsultas,
        recargarTurnos,
        agregarTurno,
        reprogramarTurno,
        cancelarTurno,
        cancelarConMotivo,
        enviarAviso,
        cambiarEstadoTurno,
        registrarConsulta,
        activarAdelanto,
      }}>
      {children}
    </TurnosContext.Provider>
  );
}

export function useTurnos() {
  return useContext(TurnosContext);
}

// Horas ya tomadas de un médico en una fecha. Los turnos cancelados liberan el horario.
// idIgnorado sirve al reprogramar: el horario del propio turno no cuenta como ocupado.
export function horasOcupadas(turnos: Turno[], medico: string, fecha: string, idIgnorado?: string) {
  return turnos
    .filter(
      (turno) =>
        turno.medico === medico &&
        turno.fecha === fecha &&
        turno.estado !== 'cancelado' &&
        turno.id !== idIgnorado
    )
    .map((turno) => turno.hora);
}

// Historia clínica de un paciente: sus turnos atendidos que tienen la consulta anotada, del más nuevo al más viejo.
// Incluye las consultas con todos los médicos del consultorio.
export function historiaClinica(turnos: Turno[], idPaciente: string) {
  return turnos
    .filter((turno) => turno.idPaciente === idPaciente && turno.consulta !== undefined)
    .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));
}
