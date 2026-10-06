import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import {
  HOY,
  ID_PACIENTE_APP,
  PACIENTES,
  TURNOS_DE_EJEMPLO,
  type EstadoTurno,
  type TurnoDeEjemplo,
} from '@/datos/consultorio';

export type { EstadoTurno };

// Un turno. Lo usan los tres roles: el paciente lo saca, la secretaría lo administra y el médico lo atiende.
export type Turno = TurnoDeEjemplo & {
  cobertura: string; // con qué cobertura se saca el turno
};

type TurnosContextType = {
  turnos: Turno[]; // los turnos de todos los pacientes
  misTurnos: Turno[]; // solo los del paciente que usa la app
  agregarTurno: (turno: Turno) => void;
  reprogramarTurno: (id: string, fecha: string, hora: string, estado?: EstadoTurno) => void;
  cancelarTurno: (id: string) => void;
  cambiarEstadoTurno: (id: string, estado: EstadoTurno) => void; // lo usa el médico (confirmar, atender)
  activarAdelanto: (id: string, activo: boolean) => void; // anota o saca el turno de la lista de espera para adelantarlo
};

// Cobertura del paciente de un turno de ejemplo, como texto ("Swiss Medical SMG20").
function coberturaDe(idPaciente: string) {
  const paciente = PACIENTES.find((p) => p.id === idPaciente);
  return paciente ? `${paciente.cobertura} ${paciente.plan}`.trim() : '';
}

const TURNOS_INICIALES: Turno[] = TURNOS_DE_EJEMPLO.map((turno) => ({
  ...turno,
  cobertura: coberturaDe(turno.idPaciente),
}));

const TurnosContext = createContext<TurnosContextType | undefined>(undefined);

export function TurnosProvider({ children }: { children: ReactNode }) {
  const [turnos, setTurnos] = useState<Turno[]>(TURNOS_INICIALES);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    function agregarTurno(turno: Turno) {
      setTurnos((anteriores) => [...anteriores, turno]);
    }
    // Cambia fecha y hora del mismo turno (mismo id). Por defecto queda pendiente hasta que se reconfirme;
    // la secretaría lo puede dejar confirmado.
    function reprogramarTurno(id: string, fecha: string, hora: string, estado: EstadoTurno = 'pendiente') {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? { ...turno, fecha, hora, estado } : turno
        )
      );
    }
    function activarAdelanto(id: string, activo: boolean) {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? { ...turno, adelantoDesde: activo ? HOY : undefined } : turno
        )
      );
    }
    function cancelarTurno(id: string) {
      cambiarEstadoTurno(id, 'cancelado');
    }
    function cambiarEstadoTurno(id: string, estado: EstadoTurno) {
      setTurnos((anteriores) =>
        anteriores.map((turno) => (turno.id === id ? { ...turno, estado } : turno))
      );
    }
    const misTurnos = turnos.filter((turno) => turno.idPaciente === ID_PACIENTE_APP);
    return { turnos, misTurnos, agregarTurno, reprogramarTurno, cancelarTurno, cambiarEstadoTurno, activarAdelanto };
  }, [turnos]);

  return <TurnosContext.Provider value={value}>{children}</TurnosContext.Provider>;
}

export function useTurnos() {
  const contexto = useContext(TurnosContext);
  if (contexto === undefined) {
    throw new Error('useTurnos tiene que usarse dentro de un TurnosProvider');
  }
  return contexto;
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
