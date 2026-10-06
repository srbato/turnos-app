import { StyleSheet, Switch, Text, View } from 'react-native';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { DIAS_MINIMOS_ADELANTO } from '@/datos/adelantos';

type Props = {
  activo: boolean;
  onCambiar: (activo: boolean) => void;
};

// Opción del paciente: entrar a la lista de espera para que le ofrezcan adelantar su turno.
export function OpcionAdelanto({ activo, onCambiar }: Props) {
  return (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>Avisarme si se libera un horario antes</Text>
        <Text style={styles.detalle}>
          Si alguien cancela con {DIAS_MINIMOS_ADELANTO} días o más de anticipación, te ofrecemos adelantar tu turno.
          Se le ofrece primero a quien hace más tiempo espera.
        </Text>
      </View>
      <Switch
        value={activo}
        onValueChange={onCambiar}
        trackColor={{ true: COLOR_PACIENTE, false: '#C9D3E3' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  textos: {
    flex: 1,
    marginRight: 12,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 3,
  },
});
