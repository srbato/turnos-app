import { ListaTurnos } from '@/components/lista-turnos';
import { useTurnos } from '@/contextos/TurnosContext';
import { fechaHoraComoDate } from '@/utilidades/turnos';

// Tab "Historial": turnos cancelados, atendidos o que ya pasaron, del más reciente al más viejo.
export default function TurnosHistorial() {
  const { misTurnos } = useTurnos();
  const ahora = new Date();

  const historial = misTurnos
    .filter((turno) => turno.estado === 'cancelado' || turno.estado === 'atendido' || turno.estado === 'ausente' || fechaHoraComoDate(turno.fecha, turno.hora) < ahora)
    .sort(
      (a, b) => fechaHoraComoDate(b.fecha, b.hora).getTime() - fechaHoraComoDate(a.fecha, a.hora).getTime()
    );

  return <ListaTurnos turnos={historial} textoVacio="Todavía no tenés turnos en el historial." />;
}
