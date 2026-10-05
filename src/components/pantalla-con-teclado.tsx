import { ReactNode, useEffect, useState } from 'react';
import { Animated, Keyboard, StyleProp, ViewStyle } from 'react-native';

// Tiempo que tarda el contenido en subir o bajar cuando aparece o se va el teclado.
// El teclado de iOS tarda más (unos 250 ms): acá se sube más rápido para que no se sienta lento.
const DURACION_MS = 100;

type Props = {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

// Igual que KeyboardAvoidingView, pero con la velocidad de la animación controlada por nosotros:
// al abrirse el teclado se agrega un espacio abajo (con su alto) y el contenido sube.
export function PantallaConTeclado({ style, children }: Props) {
  const [espacioAbajo] = useState(() => new Animated.Value(0));

  useEffect(() => {
    function moverA(alto: number) {
      // paddingBottom no se puede animar con el driver nativo, por eso useNativeDriver es false.
      Animated.timing(espacioAbajo, {
        toValue: alto,
        duration: DURACION_MS,
        useNativeDriver: false,
      }).start();
    }

    // iOS avisa antes de mostrar/ocultar el teclado (will...); Android solo después (did...).
    const suscripciones = [
      Keyboard.addListener('keyboardWillShow', (evento) => moverA(evento.endCoordinates.height)),
      Keyboard.addListener('keyboardDidShow', (evento) => moverA(evento.endCoordinates.height)),
      Keyboard.addListener('keyboardWillHide', () => moverA(0)),
      Keyboard.addListener('keyboardDidHide', () => moverA(0)),
    ];
    return () => suscripciones.forEach((suscripcion) => suscripcion.remove());
  }, [espacioAbajo]);

  return <Animated.View style={[style, { paddingBottom: espacioAbajo }]}>{children}</Animated.View>;
}
