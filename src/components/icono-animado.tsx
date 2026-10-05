import { useEffect, useState } from 'react';
import { Animated, StyleProp, StyleSheet, TextStyle, View } from 'react-native';

// Alto de la "ventana" donde se ve el ícono. El ícono más grande de las barras usa fuente de 20.
const ALTO_VENTANA = 28;

type Props = {
  icono: string; // símbolo cuando la sección NO está seleccionada
  iconoActivo: string; // símbolo cuando la sección está seleccionada
  activo: boolean;
  style: StyleProp<TextStyle>;
};

// Ícono de una barra de menú. Cuando la sección está seleccionada cambia de símbolo (por ejemplo, la casita
// vacía pasa a estar rellena) y, al aparecer la pantalla, emerge desde abajo: arranca debajo de la ventana
// (recortado por overflow: 'hidden') y sube hasta su lugar con un pequeño rebote.
export function IconoAnimado({ icono, iconoActivo, activo, style }: Props) {
  // 0 = ícono oculto debajo de la ventana, 1 = ícono en su lugar.
  const [progreso] = useState(() => new Animated.Value(activo ? 0 : 1));

  useEffect(() => {
    if (activo) {
      Animated.spring(progreso, {
        toValue: 1,
        friction: 6, // menos fricción = más rebote
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [activo, progreso]);

  const subir = progreso.interpolate({ inputRange: [0, 1], outputRange: [ALTO_VENTANA, 0] });

  return (
    <View style={styles.ventana}>
      <Animated.Text style={[style, { transform: [{ translateY: subir }] }]}>
        {activo ? iconoActivo : icono}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ventana: {
    height: ALTO_VENTANA,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
