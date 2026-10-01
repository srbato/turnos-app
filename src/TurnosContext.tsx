import { createContext, ReactNode, useState } from 'react';
import { Turno, TURNOS_PACIENTE } from './datos';

// Guarda los turnos del paciente mientras la app está abierta, para que todas
// las pantallas vean la misma lista (por ejemplo: sacar turno agrega uno y el
// inicio lo muestra). Si se cierra la app, se vuelve a los datos de prueba.

export const TurnosContext = createContext({
  turnos: TURNOS_PACIENTE,
  agregarTurno: (turnoNuevo: Turno) => {},
  cancelarTurno: (id: string) => {},
  reprogramarTurno: (id: string, fecha: string, hora: string) => {},
});

type PropsTurnosProvider = {
  children: ReactNode;
};

export function TurnosProvider(props: PropsTurnosProvider) {
  const [turnos, setTurnos] = useState(TURNOS_PACIENTE);

  const agregarTurno = (turnoNuevo: Turno) => {
    setTurnos([...turnos, turnoNuevo]);
  };

  const cancelarTurno = (id: string) => {
    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        const turnoCancelado: Turno = { ...turno, estado: 'cancelado' };
        return turnoCancelado;
      }
      return turno;
    });
    setTurnos(turnosActualizados);
  };

  const reprogramarTurno = (id: string, fecha: string, hora: string) => {
    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        const turnoReprogramado: Turno = { ...turno, fecha: fecha, hora: hora, estado: 'pendiente' };
        return turnoReprogramado;
      }
      return turno;
    });
    setTurnos(turnosActualizados);
  };

  return (
    <TurnosContext.Provider value={{ turnos, agregarTurno, cancelarTurno, reprogramarTurno }}>
      {props.children}
    </TurnosContext.Provider>
  );
}
