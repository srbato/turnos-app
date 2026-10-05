import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLOR_MEDICO } from '@/constantes/colores';
import { ETIQUETAS_CAMPOS, type Preconsulta, type RespuestasPreconsulta } from '@/datos/preconsulta';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

const CAMPOS: (keyof RespuestasPreconsulta)[] = [
  'motivo',
  'duracion',
  'sintomas',
  'medicacion',
  'alergias',
  'adicional',
];

type Props = {
  preconsulta: Preconsulta | null; // null = modal cerrado
  onCerrar: () => void;
};

// Resumen de preconsulta para el médico. Solo lectura.
export function DetallePreconsultaModal({ preconsulta, onCerrar }: Props) {
  return (
    <Modal visible={preconsulta !== null} animationType="fade" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          {preconsulta && (
            <>
              <Text style={styles.etiqueta}>Preconsulta</Text>
              <Text style={styles.paciente}>{preconsulta.paciente}</Text>
              <Text style={styles.turno}>
                {detalleFecha(preconsulta.fecha).diaSemana} {formatearFecha(preconsulta.fecha)} ·{' '}
                {preconsulta.hora} h · {preconsulta.especialidad}
              </Text>

              <ScrollView style={styles.lista}>
                {CAMPOS.map((campo) => {
                  const valor = preconsulta.respuestas[campo];
                  const texto = Array.isArray(valor) ? valor.join(', ') : valor;
                  return (
                    <View key={campo} style={styles.fila}>
                      <Text style={styles.filaEtiqueta}>{ETIQUETAS_CAMPOS[campo]}</Text>
                      <Text style={texto === '' ? styles.filaVacia : styles.filaValor}>
                        {texto === '' ? 'No informó' : texto}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              <Text style={styles.nota}>
                Armado con un asistente de IA a partir de lo que informó el paciente (enviado el{' '}
                {preconsulta.enviadaEl}). No es un diagnóstico.
              </Text>
              <Pressable style={styles.boton} onPress={onCerrar}>
                <Text style={styles.botonTexto}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(30, 33, 38, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paciente: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  turno: {
    fontSize: 13,
    color: COLOR_MEDICO,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 12,
  },
  lista: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
  fila: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  filaEtiqueta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  filaValor: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  filaVacia: {
    fontSize: 14,
    color: '#9A9A9A',
    fontStyle: 'italic',
  },
  nota: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 12,
    lineHeight: 16,
  },
  boton: {
    backgroundColor: COLOR_MEDICO,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
