import { ListaEstudios } from '@/components/lista-estudios';
import { useEstudios } from '@/contextos/EstudiosContext';

// Tab "Historial": estudios ya realizados o con la orden vencida.
export default function EstudiosHistorial() {
  const { estudios } = useEstudios();
  const historial = estudios.filter((estudio) => estudio.estado !== 'pendiente');

  return <ListaEstudios estudios={historial} textoVacio="Todavía no tenés estudios en el historial." />;
}
