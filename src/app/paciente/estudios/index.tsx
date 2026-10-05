import { ListaEstudios } from '@/components/lista-estudios';
import { ESTUDIOS } from '@/datos/estudios';

// Tab "Pendientes": estudios que todavía hay que hacer.
export default function EstudiosPendientes() {
  const pendientes = ESTUDIOS.filter((estudio) => estudio.estado === 'pendiente');

  return <ListaEstudios estudios={pendientes} textoVacio="No tenés estudios pendientes." />;
}
