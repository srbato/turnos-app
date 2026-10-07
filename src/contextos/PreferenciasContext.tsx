import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type Idioma = 'es' | 'en';

type Preferencias = {
  idioma: Idioma;
  modoOscuro: boolean;
  recordatorios: boolean;
};

// Lo que se comparte: las preferencias y las funciones para cambiarlas.
type PreferenciasContextType = Preferencias & {
  cambiarIdioma: (idioma: Idioma) => void;
  alternarModoOscuro: () => void;
  alternarRecordatorios: () => void;
};

const CLAVE_STORAGE = 'preferencias';

// El perfil siempre fue oscuro, por eso el modo oscuro arranca activado.
const PREFERENCIAS_INICIALES: Preferencias = {
  idioma: 'es',
  modoOscuro: true,
  recordatorios: true,
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PreferenciasContextType = {
  ...PREFERENCIAS_INICIALES,
  cambiarIdioma: () => {},
  alternarModoOscuro: () => {},
  alternarRecordatorios: () => {},
};

const PreferenciasContext = createContext(VALOR_POR_DEFECTO);

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_INICIALES);

  // Al abrir la app se recupera lo guardado en el dispositivo, si hay algo.
  useEffect(() => {
    async function cargarPreferencias() {
      try {
        const guardado = await AsyncStorage.getItem(CLAVE_STORAGE);
        if (guardado !== null) {
          setPreferencias({ ...PREFERENCIAS_INICIALES, ...JSON.parse(guardado) });
        }
      } catch {
        // Si falla la lectura, se queda con las preferencias iniciales.
      }
    }
    cargarPreferencias();
  }, []);

  // Actualiza las preferencias en memoria y las guarda en el dispositivo.
  async function guardar(nuevas: Preferencias) {
    setPreferencias(nuevas);
    try {
      await AsyncStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevas));
    } catch {
      // Si falla el guardado, el cambio igual queda en memoria hasta cerrar la app.
    }
  }

  function cambiarIdioma(idioma: Idioma) {
    guardar({ ...preferencias, idioma: idioma });
  }

  function alternarModoOscuro() {
    guardar({ ...preferencias, modoOscuro: !preferencias.modoOscuro });
  }

  function alternarRecordatorios() {
    guardar({ ...preferencias, recordatorios: !preferencias.recordatorios });
  }

  return (
    <PreferenciasContext.Provider
      value={{ ...preferencias, cambiarIdioma, alternarModoOscuro, alternarRecordatorios }}>
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  return useContext(PreferenciasContext);
}
