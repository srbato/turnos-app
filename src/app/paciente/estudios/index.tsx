import { ListaEstudios } from '@/components/lista-estudios';
import { useEstudios } from '@/contextos/EstudiosContext';

// Tab "Pendientes": estudios que todavía hay que hacer.
export default function EstudiosPendientes() {
  const { estudios } = useEstudios();
  const pendientes = estudios.filter((estudio) => estudio.estado === 'pendiente');

  return <ListaEstudios estudios={pendientes} textoVacio="No tenés estudios pendientes." />;
}
