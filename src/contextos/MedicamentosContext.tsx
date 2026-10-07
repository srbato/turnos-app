import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Medicamentos que el propio paciente agrega (los recetados por el médico viven en datos/recetas.ts).
export type MedicamentoPropio = {
  id: string;
  nombre: string;
  dosis: string; // cómo lo toma
  motivo: string; // para qué lo toma
};

type MedicamentosContextType = {
  medicamentos: MedicamentoPropio[];
  agregarMedicamento: (medicamento: MedicamentoPropio) => void;
  editarMedicamento: (medicamento: MedicamentoPropio) => void;
  eliminarMedicamento: (id: string) => void;
};

const CLAVE_STORAGE = 'medicamentos-propios';

const MEDICAMENTOS_INICIALES: MedicamentoPropio[] = [
  { id: '1', nombre: 'Ibuprofeno 400 mg', dosis: 'Cada 8 h si hay dolor', motivo: 'Dolor' },
];

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: MedicamentosContextType = {
  medicamentos: MEDICAMENTOS_INICIALES,
  agregarMedicamento: () => {},
  editarMedicamento: () => {},
  eliminarMedicamento: () => {},
};

const MedicamentosContext = createContext(VALOR_POR_DEFECTO);

export function MedicamentosProvider({ children }: { children: ReactNode }) {
  const [medicamentos, setMedicamentos] = useState(MEDICAMENTOS_INICIALES);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarMedicamentos() {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_STORAGE);
        if (guardado !== null) {
          setMedicamentos(JSON.parse(guardado));
        }
      } catch {
        // Si falla la lectura, se queda con los medicamentos iniciales.
      }
    }
    cargarMedicamentos();
  }, []);

  // Actualiza la lista en memoria y la guarda en el dispositivo.
  async function guardarLista(nuevos: MedicamentoPropio[]) {
    setMedicamentos(nuevos);
    try {
      await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevos));
    } catch {
      // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
    }
  }

  function agregarMedicamento(medicamento: MedicamentoPropio) {
    guardarLista([...medicamentos, medicamento]);
  }

  // Reemplaza el medicamento que tenga el mismo id.
  function editarMedicamento(medicamento: MedicamentoPropio) {
    guardarLista(
      medicamentos.map((m) => {
        if (m.id === medicamento.id) {
          return medicamento;
        }
        return m;
      })
    );
  }

  function eliminarMedicamento(id: string) {
    guardarLista(medicamentos.filter((m) => m.id !== id));
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
