import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { ListaTurnos } from '@/components/lista-turnos';
import { useTurnos } from '@/contextos/TurnosContext';
import { fechaHoraComoDate } from '@/utilidades/turnos';

// Tab "Próximos": turnos no cancelados que todavía no pasaron, del más cercano al más lejano.
export default function TurnosProximos() {
  const { idioma } = usePreferencias();
  const t = TEXTOS_PACIENTE[idioma];
  const { misTurnos } = useTurnos();
  const ahora = new Date();

  const proximos = misTurnos
    .filter((turno) => turno.estado !== 'cancelado' && turno.estado !== 'atendido' && turno.estado !== 'ausente' && fechaHoraComoDate(turno.fecha, turno.hora) >= ahora)
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    );

  return <ListaTurnos turnos={proximos} textoVacio={t.turnos.sinProximos} />;
}
