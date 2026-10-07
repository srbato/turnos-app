import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PACIENTE, COLOR_PENDIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { EstadoEstudio, Estudio } from '@/datos/estudios';

export const COLORES_ESTUDIO: Record<EstadoEstudio, string> = {
  pendiente: COLOR_PENDIENTE,
  vencido: COLOR_CANCELADO,
  realizado: COLOR_CONFIRMADO,
};

export const ETIQUETAS_ESTUDIO: Record<EstadoEstudio, string> = {
  pendiente: 'Pendiente',
  vencido: 'Vencido',
  realizado: 'Realizado',
};

const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para el recuadro de indicaciones

type Props = {
  estudio: Estudio | null; // null = modal cerrado
  onCerrar: () => void;
};

// Modal con el detalle de un estudio. Lo usan el home y la sección Estudios.
export function DetalleEstudioModal({ estudio, onCerrar }: Props) {
  return (
    <Modal
      visible={estudio !== null}
      animationType="fade"
      transparent
      onRequestClose={onCerrar}>
      <View style={styles.fondoModal}>
        <View style={styles.tarjetaModal}>
          {estudio && (
            <>
              <View style={styles.modalEncabezado}>
                <Text style={styles.modalEtiqueta}>Detalle del estudio</Text>
                <View
                  style={[styles.chip, { backgroundColor: COLORES_ESTUDIO[estudio.estado] }]}>
                  <Text style={styles.chipTexto}>{ETIQUETAS_ESTUDIO[estudio.estado]}</Text>
                </View>
              </View>

              <View style={styles.modalCuerpo}>
                <View style={styles.tipo}>
                  <Text style={styles.tipoTexto}>{estudio.tipo}</Text>
                </View>
                <View style={styles.datos}>
                  <Text style={styles.modalTitulo}>{estudio.titulo}</Text>
                  <Text style={styles.detalle}>{estudio.detalle}</Text>
                </View>
              </View>

              <View style={styles.modalFila}>
                <Text style={styles.modalFilaEtiqueta}>Pedido por</Text>
                <Text style={styles.modalFilaValor}>{estudio.medico}</Text>
              </View>

              {estudio.indicaciones.length > 0 && (
                <View style={styles.avisoCaja}>
                  {estudio.indicaciones.map((indicacion) => (
                    <Text key={indicacion} style={styles.avisoTexto}>
                      • {indicacion}
                    </Text>
                  ))}
                </View>
              )}

              {estudio.estado === 'pendiente' && (
                <Pressable
                  style={styles.botonPrimario}
                  onPress={() => {
                    onCerrar();
                    router.push('/paciente/sacar-turno');
                  }}>
                  <Text style={styles.botonPrimarioTexto}>Sacar turno para este estudio</Text>
                </Pressable>
              )}
              <Pressable style={styles.cerrar} onPress={() => onCerrar()}>
                <Text style={styles.cerrarTexto}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tipo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  datos: {
    flex: 1,
  },
  detalle: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalCuerpo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    marginBottom: 14,
  },
  modalFilaEtiqueta: {
    fontSize: 13,
    color: '#8A8A8A',
  },
  modalFilaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  avisoCaja: {
    backgroundColor: FONDO_PENDIENTE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  avisoTexto: {
    fontSize: 13,
    color: '#7A5A12',
    lineHeight: 19,
  },
  botonPrimario: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cerrar: {
    alignItems: 'center',
    paddingTop: 14,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
});
