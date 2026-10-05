import { ListaEstudios } from '@/components/lista-estudios';
import { ESTUDIOS } from '@/datos/estudios';

// Tab "Historial": estudios ya realizados o con la orden vencida.
export default function EstudiosHistorial() {
  const historial = ESTUDIOS.filter((estudio) => estudio.estado !== 'pendiente');

  return <ListaEstudios estudios={historial} textoVacio="Todavía no tenés estudios en el historial." />;
}
