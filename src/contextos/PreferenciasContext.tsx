import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Idioma = 'es' | 'en';

type Preferencias = {
  idioma: Idioma;
  modoOscuro: boolean;
  recordatorios: boolean;
};

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

const PreferenciasContext = createContext<PreferenciasContextType | undefined>(undefined);

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<Preferencias>(PREFERENCIAS_INICIALES);

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

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
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
      guardar({ ...preferencias, idioma });
    }
    function alternarModoOscuro() {
      guardar({ ...preferencias, modoOscuro: !preferencias.modoOscuro });
    }
    function alternarRecordatorios() {
      guardar({ ...preferencias, recordatorios: !preferencias.recordatorios });
    }
    return { ...preferencias, cambiarIdioma, alternarModoOscuro, alternarRecordatorios };
  }, [preferencias]);

  return <PreferenciasContext.Provider value={value}>{children}</PreferenciasContext.Provider>;
}

export function usePreferencias() {
  const contexto = useContext(PreferenciasContext);
  if (contexto === undefined) {
    throw new Error('usePreferencias tiene que usarse dentro de un PreferenciasProvider');
  }
  return contexto;
}
