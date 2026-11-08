import { createContext, ReactNode, useContext, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MARGEN_SUPERIOR } from '@/constantes/pantalla';

// Un cartel rojo arriba de la pantalla para avisar que algo no se pudo hacer (por ejemplo, la API rechazó un cambio).
// Lo usan las acciones que no tienen un formulario donde mostrar el error.

// Segundos que queda visible el cartel, si no se lo toca antes.
const SEGUNDOS_VISIBLE = 5;

type ErroresContextType = {
  mostrarError: (mensaje: string) => void; // si el mensaje está vacío no hace nada: las acciones devuelven '' si salieron bien
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: ErroresContextType = {
  mostrarError: () => {},
};

const ErroresContext = createContext(VALOR_POR_DEFECTO);

export function ErroresProvider({ children }: { children: ReactNode }) {
  const [mensaje, setMensaje] = useState('');
  // El reloj del cartel: se guarda para reiniciarlo si llega otro error antes de que se oculte.
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  function mostrarError(texto: string) {
    if (texto === '') {
      return;
    }
    setMensaje(texto);
    if (reloj.current !== null) {
      clearTimeout(reloj.current);
    }
    reloj.current = setTimeout(() => setMensaje(''), SEGUNDOS_VISIBLE * 1000);
  }

  return (
    <ErroresContext.Provider value={{ mostrarError }}>
      <View style={styles.contenedor}>
        {children}
        {mensaje !== '' && (
          <Pressable style={styles.cartel} onPress={() => setMensaje('')}>
            <Text style={styles.texto}>{mensaje}</Text>
          </Pressable>
        )}
      </View>
    </ErroresContext.Provider>
  );
}

export function useErrores() {
  return useContext(ErroresContext);
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  cartel: {
    position: 'absolute',
    top: MARGEN_SUPERIOR,
    left: 16,
    right: 16,
    backgroundColor: '#C0392B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
