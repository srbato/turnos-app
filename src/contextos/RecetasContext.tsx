import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useSesion } from '@/contextos/SesionContext';
import { Receta } from '@/datos/recetas';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// Las recetas de los pacientes del consultorio. Vienen de la API: la fecha de emisión y el código los pone el servidor.

// Lo que el médico completa al emitir una receta.
export type RecetaNueva = {
  idPaciente: string;
  idMedico: string;
  medicamento: string;
  indicacion: string;
  riesgo: boolean;
};

// Lo que el médico puede corregir de una receta ya emitida: el paciente, la fecha y el código no cambian.
export type CambiosReceta = {
  medicamento: string;
  indicacion: string;
  riesgo: boolean;
};

// Las funciones devuelven el mensaje de error de la API, o '' si salió bien.
type RecetasContextType = {
  recetas: Receta[]; // las recetas de todos los pacientes
  misRecetas: Receta[]; // solo las del paciente que inició sesión
  emitirReceta: (receta: RecetaNueva) => Promise<string>;
  editarReceta: (id: string, cambios: CambiosReceta) => Promise<string>; // el médico corrige una receta vigente
  eliminarReceta: (id: string) => Promise<string>; // el médico la elimina si no correspondía
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: RecetasContextType = {
  recetas: [],
  misRecetas: [],
  emitirReceta: async () => '',
  editarReceta: async () => '',
  eliminarReceta: async () => '',
};

const RecetasContext = createContext(VALOR_POR_DEFECTO);

// Una receta tal como la devuelve la API (GET /api/recetas).
type RecetaApi = {
  id: number;
  pacienteId: number;
  medicoId: number;
  medicamento: string;
  indicacion: string;
  fechaEmision: string;
  vigenciaDias: number;
  codigo: string;
  riesgo: boolean;
  medico: { nombre: string };
};

function recetaDesdeApi(receta: RecetaApi): Receta {
  return {
    id: String(receta.id),
    idPaciente: String(receta.pacienteId),
    idMedico: String(receta.medicoId),
    medicamento: receta.medicamento,
    abreviatura: receta.medicamento.slice(0, 3).toUpperCase(),
    indicacion: receta.indicacion,
    medico: receta.medico.nombre,
    fechaEmision: receta.fechaEmision,
    vigenciaDias: receta.vigenciaDias,
    codigo: receta.codigo,
    riesgo: receta.riesgo,
  };
}

export function RecetasProvider({ children }: { children: ReactNode }) {
  const { idPaciente } = useSesion();
  const [recetas, setRecetas] = useState<Receta[]>([]);

  async function recargarRecetas() {
    const respuesta = await pedir('GET', `/api/recetas?consultorioId=${ID_CONSULTORIO}`);
    if (respuesta.ok) {
      setRecetas(respuesta.datos.map(recetaDesdeApi));
    }
  }

  useEffect(() => {
    recargarRecetas();
  }, [idPaciente]);

  // Manda el cambio a la API y, si salió bien, vuelve a pedir las recetas.
  async function enviar(metodo: string, ruta: string, cuerpo?: object) {
    const respuesta = await pedir(metodo, ruta, cuerpo);
    if (respuesta.ok) {
      await recargarRecetas();
    }
    return respuesta.error;
  }

  // La receta emitida por un médico le aparece al paciente en Mis medicamentos > Recetados.
  function emitirReceta(nueva: RecetaNueva) {
    return enviar('POST', '/api/recetas', {
      pacienteId: Number(nueva.idPaciente),
      medicoId: Number(nueva.idMedico),
      medicamento: nueva.medicamento,
      indicacion: nueva.indicacion,
      riesgo: nueva.riesgo,
    });
  }

  function editarReceta(id: string, cambios: CambiosReceta) {
    return enviar('PATCH', `/api/recetas/${id}`, cambios);
  }

  function eliminarReceta(id: string) {
    return enviar('DELETE', `/api/recetas/${id}`);
  }

  const misRecetas = recetas.filter((receta) => receta.idPaciente === idPaciente);

  return (
    <RecetasContext.Provider value={{ recetas, misRecetas, emitirReceta, editarReceta, eliminarReceta }}>
      {children}
    </RecetasContext.Provider>
  );
}

export function useRecetas() {
  return useContext(RecetasContext);
}
