import { StyleSheet, Text, View } from 'react-native';

import { COLOR_MEDICO } from '@/constantes/colores';
import { Consulta } from '@/datos/consultorio';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

// conNotas: las notas privadas solo las ve el médico que las escribió.
type Props = {
  consulta: Consulta;
  conNotas: boolean;
};

// Lo que el médico anotó al atender un turno (una entrada de la historia clínica). Los campos vacíos no se muestran.
export function DetalleConsulta({ consulta, conNotas }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro));
  const t = TEXTOS_MEDICO[idioma];
  const filas = [
    { titulo: t.consulta.motivo, valor: consulta.motivo },
    { titulo: t.consulta.diagnostico, valor: consulta.diagnostico },
    { titulo: t.consulta.indicaciones, valor: consulta.indicaciones },
  ];
  if (conNotas) {
    filas.push({ titulo: t.consulta.notasPrivadas, valor: consulta.notas });
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

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
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
    color: c.texto,
    marginTop: 2,
  },
});
