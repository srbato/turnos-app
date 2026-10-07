import { StyleSheet, Text, View } from 'react-native';

import { COLOR_MEDICO } from '@/constantes/colores';
import { Consulta } from '@/datos/consultorio';

// conNotas: las notas privadas solo las ve el médico que las escribió.
type Props = {
  consulta: Consulta;
  conNotas: boolean;
};

// Lo que el médico anotó al atender un turno (una entrada de la historia clínica). Los campos vacíos no se muestran.
export function DetalleConsulta({ consulta, conNotas }: Props) {
  const filas = [
    { titulo: 'Motivo', valor: consulta.motivo },
    { titulo: 'Diagnóstico', valor: consulta.diagnostico },
    { titulo: 'Indicaciones', valor: consulta.indicaciones },
  ];
  if (conNotas) {
    filas.push({ titulo: 'Notas privadas', valor: consulta.notas });
  }

  return (
    <View>
      {filas
        .filter((fila) => fila.valor !== '')
        .map((fila) => (
          <View key={fila.titulo} style={styles.fila}>
            <Text style={styles.etiqueta}>{fila.titulo}</Text>
            <Text style={styles.valor}>{fila.valor}</Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    marginTop: 6,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_MEDICO,
  },
  valor: {
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 2,
  },
});
