import { createContext, ReactNode, useContext, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { Consulta, HOY, ID_PACIENTE_APP, EstadoTurno, Paciente, TurnoDeEjemplo } from '@/datos/consultorio';

// Un turno. Lo usan los tres roles: el paciente lo saca, la secretaría lo administra y el médico lo atiende.
// Tiene todo lo de un turno de ejemplo y, además, la cobertura con la que se sacó.
export type Turno = TurnoDeEjemplo & {
  cobertura: string; // con qué cobertura se saca el turno
};

// Una cancelación que hace el sistema o Secretaría, con su motivo.
type Cancelacion = { id: string; motivo: string };

type TurnosContextType = {
  turnos: Turno[]; // los turnos de todos los pacientes
  misTurnos: Turno[]; // solo los del paciente que usa la app
  agregarTurno: (turno: Turno) => void;
  reprogramarTurno: (id: string, fecha: string, hora: string, estado?: EstadoTurno) => void;
  cancelarTurno: (id: string) => void;
  cancelarConMotivo: (cancelaciones: Cancelacion[]) => void; // cancelaciones del sistema o por riesgo
  enviarAviso: (id: string, maximo: number) => void; // Secretaría le avisó al paciente que confirme: se anota la fecha (hasta el máximo configurado)
  cambiarEstadoTurno: (id: string, estado: EstadoTurno) => void; // lo usa el médico (confirmar, atender)
  registrarConsulta: (id: string, consulta: Consulta) => void; // el médico atiende el turno y anota la consulta
  activarAdelanto: (id: string, activo: boolean) => void; // anota o saca el turno de la lista de espera para adelantarlo
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: TurnosContextType = {
  turnos: [],
  misTurnos: [],
  agregarTurno: () => {},
  reprogramarTurno: () => {},
  cancelarTurno: () => {},
  cancelarConMotivo: () => {},
  enviarAviso: () => {},
  cambiarEstadoTurno: () => {},
  registrarConsulta: () => {},
  activarAdelanto: () => {},
};

// Cobertura del paciente de un turno de ejemplo, como texto ("Swiss Medical SMG20").
function coberturaDe(pacientes: Paciente[], idPaciente: string) {
  const paciente = pacientes.find((p) => p.id === idPaciente);
  if (!paciente) {
    return '';
  }
  return `${paciente.cobertura} ${paciente.plan}`.trim();
}

const TurnosContext = createContext(VALOR_POR_DEFECTO);

// Los turnos son los del consultorio activo: cada consultorio tiene su propia agenda.
export function TurnosProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const turnosIniciales: Turno[] = consultorio.turnos.map((turno) => ({
    ...turno,
    cobertura: coberturaDe(consultorio.pacientes, turno.idPaciente),
  }));
  const [turnos, setTurnos] = useState(turnosIniciales);

  function agregarTurno(turno: Turno) {
    setTurnos((anteriores) => [...anteriores, turno]);
  }

  // Cambia fecha y hora del mismo turno (mismo id). Por defecto queda pendiente hasta que se reconfirme;
  // la secretaría lo puede dejar confirmado.
  function reprogramarTurno(id: string, fecha: string, hora: string, estado: EstadoTurno = 'pendiente') {
    setTurnos((anteriores) =>
      anteriores.map((turno) => {
        if (turno.id === id) {
          return { ...turno, fecha: fecha, hora: hora, estado: estado };
        }
        return turno;
      })
    );
  }

  function activarAdelanto(id: string, activo: boolean) {
    setTurnos((anteriores) =>
      anteriores.map((turno) => {
        if (turno.id !== id) {
          return turno;
        }
        if (activo) {
          return { ...turno, adelantoDesde: HOY };
        }
        return { ...turno, adelantoDesde: undefined };
      })
    );
  }

  // Cancela con un motivo guardado (el médico no atiende ese día, o Secretaría lo cancela por riesgo de
  // inasistencia): así Secretaría sabe por qué y avisa al paciente, y ese horario no se ofrece solo a la lista.
  function cancelarConMotivo(cancelaciones: Cancelacion[]) {
    setTurnos((anteriores) =>
      anteriores.map((turno) => {
        const cancelacion = cancelaciones.find((c) => c.id === turno.id);
        if (cancelacion) {
          const turnoCancelado: Turno = { ...turno, estado: 'cancelado', motivoCancelacion: cancelacion.motivo };
          return turnoCancelado;
        }
        return turno;
      })
    );
  }

  function cancelarTurno(id: string) {
    cambiarEstadoTurno(id, 'cancelado');
  }

  // Al confirmar se deja anotado que el paciente confirmó, aunque después el turno pase a atendido (suma a su historial).
  function cambiarEstadoTurno(id: string, estado: EstadoTurno) {
    setTurnos((anteriores) =>
      anteriores.map((turno) => {
        if (turno.id !== id) {
          return turno;
        }
        if (estado === 'confirmado') {
          return { ...turno, estado: estado, confirmo: true };
        }
        return { ...turno, estado: estado };
      })
    );
  }

  // El médico atendió el turno: queda como atendido, con lo que anotó. Si ya tenía una consulta, se reemplaza
  // (así la puede corregir).
  function registrarConsulta(id: string, consulta: Consulta) {
    setTurnos((anteriores) =>
      anteriores.map((turno) => {
        if (turno.id === id) {
          const turnoAtendido: Turno = { ...turno, estado: 'atendido', consulta: consulta };
          return turnoAtendido;
        }
        return turno;
      })
    );
  }

  // Se pueden mandar como máximo "maximo" avisos por turno (lo configura Secretaría): con eso alcanza para actuar.
  function enviarAviso(id: string, maximo: number) {
    setTurnos((anteriores) =>
      anteriores.map((turno) => {
        if (turno.id !== id) {
          return turno;
        }
        const avisos = turno.avisos || [];
        if (avisos.length >= maximo) {
          return turno;
        }
        return { ...turno, avisos: [...avisos, HOY] };
      })
    );
  }

  const misTurnos = turnos.filter((turno) => turno.idPaciente === ID_PACIENTE_APP);

  return (
    <TurnosContext.Provider
      value={{
        turnos,
        misTurnos,
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
