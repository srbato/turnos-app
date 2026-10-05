import { ListaTurnos } from '@/components/lista-turnos';
import { useTurnos } from '@/contextos/TurnosContext';
import { fechaHoraComoDate } from '@/utilidades/turnos';

// Tab "Próximos": turnos no cancelados que todavía no pasaron, del más cercano al más lejano.
export default function TurnosProximos() {
  const { turnos } = useTurnos();
  const ahora = new Date();

  const proximos = turnos
    .filter((turno) => turno.estado !== 'cancelado' && fechaHoraComoDate(turno.fecha, turno.hora) >= ahora)
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    );

  return <ListaTurnos turnos={proximos} textoVacio="No tenés ningún turno próximamente." />;
}
