import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { HOY, ID_PACIENTE_APP } from '@/datos/consultorio';
import { RECETAS, type Receta } from '@/datos/recetas';

// Lo que el médico completa al emitir una receta; el resto de los datos los completa el contexto.
export type RecetaNueva = {
  idPaciente: string;
  medico: string;
  medicamento: string;
  indicacion: string;
  riesgo: boolean;
};

type RecetasContextType = {
  recetas: Receta[]; // las recetas de todos los pacientes
  misRecetas: Receta[]; // solo las del paciente que usa la app
  emitirReceta: (receta: RecetaNueva) => void;
  editarReceta: (id: string, cambios: CambiosReceta) => void; // el médico corrige una receta vigente
  eliminarReceta: (id: string) => void; // el médico la elimina si no correspondía
};

// Lo que el médico puede corregir de una receta ya emitida: el paciente, la fecha y el código no cambian.
export type CambiosReceta = Pick<RecetaNueva, 'medicamento' | 'indicacion' | 'riesgo'>;

const VIGENCIA_POR_DEFECTO_DIAS = 30;

const RecetasContext = createContext<RecetasContextType | undefined>(undefined);

export function RecetasProvider({ children }: { children: ReactNode }) {
  const [recetas, setRecetas] = useState<Receta[]>(RECETAS);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    // La receta emitida por un médico le aparece enseguida al paciente en Mis medicamentos > Recetados.
    function emitirReceta(nueva: RecetaNueva) {
      const numero = String(recetas.length + 1).padStart(4, '0');
      const receta: Receta = {
        ...nueva,
        id: `r-${Date.now()}`,
        abreviatura: nueva.medicamento.slice(0, 3).toUpperCase(),
        fechaEmision: HOY,
        vigenciaDias: VIGENCIA_POR_DEFECTO_DIAS,
        codigo: `RX-${HOY.slice(0, 4)}-${numero}`,
      };
      setRecetas((anteriores) => [...anteriores, receta]);
    }
    function editarReceta(id: string, cambios: CambiosReceta) {
      setRecetas((anteriores) =>
        anteriores.map((receta) =>
          receta.id === id
            ? { ...receta, ...cambios, abreviatura: cambios.medicamento.slice(0, 3).toUpperCase() }
            : receta
        )
      );
    }
    function eliminarReceta(id: string) {
      setRecetas((anteriores) => anteriores.filter((receta) => receta.id !== id));
    }
    const misRecetas = recetas.filter((receta) => receta.idPaciente === ID_PACIENTE_APP);
    return { recetas, misRecetas, emitirReceta, editarReceta, eliminarReceta };
  }, [recetas]);

  return <RecetasContext.Provider value={value}>{children}</RecetasContext.Provider>;
}

export function useRecetas() {
  const contexto = useContext(RecetasContext);
  if (contexto === undefined) {
    throw new Error('useRecetas tiene que usarse dentro de un RecetasProvider');
  }
  return contexto;
}
