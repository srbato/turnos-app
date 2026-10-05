import { ListaTurnos } from '@/components/lista-turnos';
import { useTurnos } from '@/contextos/TurnosContext';
import { fechaHoraComoDate } from '@/utilidades/turnos';

// Tab "Historial": turnos cancelados o que ya pasaron, del más reciente al más viejo.
export default function TurnosHistorial() {
  const { turnos } = useTurnos();
  const ahora = new Date();

  const historial = turnos
    .filter((turno) => turno.estado === 'cancelado' || fechaHoraComoDate(turno.fecha, turno.hora) < ahora)
    .sort(
      (a, b) => fechaHoraComoDate(b.fecha, b.hora).getTime() - fechaHoraComoDate(a.fecha, a.hora).getTime()
    );

  return <ListaTurnos turnos={historial} textoVacio="Todavía no tenés turnos en el historial." />;
}
