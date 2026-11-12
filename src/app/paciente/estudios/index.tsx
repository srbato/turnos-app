import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { ListaEstudios } from '@/components/lista-estudios';
import { useEstudios } from '@/contextos/EstudiosContext';

// Tab "Pendientes": estudios que todavía hay que hacer.
export default function EstudiosPendientes() {
  const { idioma } = usePreferencias();
  const t = TEXTOS_PACIENTE[idioma];
  const { estudios } = useEstudios();
  const pendientes = estudios.filter((estudio) => estudio.estado === 'pendiente');

  return <ListaEstudios estudios={pendientes} textoVacio={t.estudios.sinPendientes} />;
}
