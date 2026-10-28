import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useSesion } from '@/contextos/SesionContext';
import { EstadoEstudio, Estudio } from '@/datos/estudios';
import { pedir } from '@/servicios/api';

// Los estudios que los médicos le pidieron al paciente que inició sesión. Vienen de la API y por ahora solo se muestran.

type EstudiosContextType = {
  estudios: Estudio[];
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: EstudiosContextType = {
  estudios: [],
};

const EstudiosContext = createContext(VALOR_POR_DEFECTO);

// Un estudio tal como lo devuelve la API (GET /api/estudios).
type EstudioApi = {
  id: number;
  tipo: string;
  titulo: string;
  detalle: string;
  indicaciones: string;
  estado: EstadoEstudio;
  medico: { nombre: string };
};

function estudioDesdeApi(estudio: EstudioApi): Estudio {
  return {
    id: String(estudio.id),
    tipo: estudio.tipo,
    titulo: estudio.titulo,
    detalle: estudio.detalle,
    medico: estudio.medico.nombre,
    // En la base van una por línea.
    indicaciones: estudio.indicaciones === '' ? [] : estudio.indicaciones.split('\n'),
    estado: estudio.estado,
  };
}

export function EstudiosProvider({ children }: { children: ReactNode }) {
  const { idPaciente } = useSesion();
  const [estudios, setEstudios] = useState<Estudio[]>([]);

  // Se cargan cada vez que inicia sesión otro paciente.
  useEffect(() => {
    async function cargarEstudios() {
      if (idPaciente === '') {
        setEstudios([]);
        return;
      }
      const respuesta = await pedir('GET', `/api/estudios?pacienteId=${idPaciente}`);
      if (respuesta.ok) {
        setEstudios(respuesta.datos.map(estudioDesdeApi));
      }
    }
    cargarEstudios();
  }, [idPaciente]);

  return <EstudiosContext.Provider value={{ estudios }}>{children}</EstudiosContext.Provider>;
}

export function useEstudios() {
  return useContext(EstudiosContext);
}
