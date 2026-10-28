import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useSesion } from '@/contextos/SesionContext';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// Medicamentos que el propio paciente agrega (los recetados por el médico están en RecetasContext). Vienen de la API.
// El paciente ve solo los suyos; el médico y la secretaría reciben los de todos los pacientes del consultorio, así el
// médico ve la medicación de cada paciente y las interacciones.
export type MedicamentoPropio = {
  id: string;
  idPaciente: string;
  nombre: string;
  dosis: string; // cómo lo toma
  motivo: string; // para qué lo toma
};

// Lo que carga el paciente: el id y el paciente los completa la API.
export type MedicamentoNuevo = {
  nombre: string;
  dosis: string;
  motivo: string;
};

// Las funciones devuelven el mensaje de error de la API, o '' si salió bien.
type MedicamentosContextType = {
  medicamentos: MedicamentoPropio[];
  agregarMedicamento: (medicamento: MedicamentoNuevo) => Promise<string>;
  editarMedicamento: (id: string, cambios: MedicamentoNuevo) => Promise<string>;
  eliminarMedicamento: (id: string) => Promise<string>;
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: MedicamentosContextType = {
  medicamentos: [],
  agregarMedicamento: async () => '',
  editarMedicamento: async () => '',
  eliminarMedicamento: async () => '',
};

const MedicamentosContext = createContext(VALOR_POR_DEFECTO);

// Un medicamento tal como lo devuelve la API (GET /api/medicamentos).
type MedicamentoApi = {
  id: number;
  pacienteId: number;
  nombre: string;
  dosis: string;
  motivo: string;
};

function medicamentoDesdeApi(medicamento: MedicamentoApi): MedicamentoPropio {
  return {
    id: String(medicamento.id),
    idPaciente: String(medicamento.pacienteId),
    nombre: medicamento.nombre,
    dosis: medicamento.dosis,
    motivo: medicamento.motivo,
  };
}

export function MedicamentosProvider({ children }: { children: ReactNode }) {
  const { usuario, idPaciente } = useSesion();
  const [medicamentos, setMedicamentos] = useState<MedicamentoPropio[]>([]);

  async function recargarMedicamentos() {
    if (usuario === null) {
      setMedicamentos([]);
      return;
    }
    // El paciente pide los suyos; el médico y la secretaría, los de todo el consultorio.
    let ruta = `/api/medicamentos?consultorioId=${ID_CONSULTORIO}`;
    if (usuario.rol === 'paciente') {
      ruta = `/api/medicamentos?pacienteId=${idPaciente}`;
    }
    const respuesta = await pedir('GET', ruta);
    if (respuesta.ok) {
      setMedicamentos(respuesta.datos.map(medicamentoDesdeApi));
    }
  }

  // Se cargan cada vez que cambia quién inició sesión.
  useEffect(() => {
    recargarMedicamentos();
  }, [usuario]);

  // Manda el cambio a la API y, si salió bien, vuelve a pedir la lista.
  async function enviar(metodo: string, ruta: string, cuerpo?: object) {
    const respuesta = await pedir(metodo, ruta, cuerpo);
    if (respuesta.ok) {
      await recargarMedicamentos();
    }
    return respuesta.error;
  }

  function agregarMedicamento(medicamento: MedicamentoNuevo) {
    return enviar('POST', '/api/medicamentos', { ...medicamento, pacienteId: Number(idPaciente) });
  }

  function editarMedicamento(id: string, cambios: MedicamentoNuevo) {
    return enviar('PATCH', `/api/medicamentos/${id}`, cambios);
  }

  function eliminarMedicamento(id: string) {
    return enviar('DELETE', `/api/medicamentos/${id}`);
  }

  return (
    <MedicamentosContext.Provider
      value={{ medicamentos, agregarMedicamento, editarMedicamento, eliminarMedicamento }}>
      {children}
    </MedicamentosContext.Provider>
  );
}

export function useMedicamentos() {
  return useContext(MedicamentosContext);
}
