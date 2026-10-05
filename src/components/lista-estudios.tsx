import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PACIENTE, COLOR_PENDIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import type { EstadoEstudio, Estudio } from '@/datos/estudios';

const COLORES_ESTUDIO: Record<EstadoEstudio, string> = {
  pendiente: COLOR_PENDIENTE,
  vencido: COLOR_CANCELADO,
  realizado: COLOR_CONFIRMADO,
};

const ETIQUETAS_ESTUDIO: Record<EstadoEstudio, string> = {
  pendiente: 'Pendiente',
  vencido: 'Vencido',
  realizado: 'Realizado',
};

const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para el recuadro de indicaciones

type Props = {
  estudios: Estudio[];
  textoVacio: string;
};

// Lista de estudios para las tabs de Estudios. Tocar uno abre su detalle.
export function ListaEstudios({ estudios, textoVacio }: Props) {
  const [estudioSeleccionado, setEstudioSeleccionado] = useState<Estudio | null>(null);

  return (
    <View style={styles.pantalla}>
      <FlatList
        contentContainerStyle={[styles.contenido, estudios.length === 0 && styles.contenidoVacio]}
        data={estudios}
        keyExtractor={(estudio) => estudio.id}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioTexto}>{textoVacio}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta} onPress={() => setEstudioSeleccionado(item)}>
            <View style={styles.tipo}>
              <Text style={styles.tipoTexto}>{item.tipo}</Text>
            </View>
            <View style={styles.datos}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.detalle}>{item.detalle}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: COLORES_ESTUDIO[item.estado] }]}>
              <Text style={styles.chipTexto}>{ETIQUETAS_ESTUDIO[item.estado]}</Text>
            </View>
          </Pressable>
        )}
      />

      <Modal
        visible={estudioSeleccionado !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setEstudioSeleccionado(null)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            {estudioSeleccionado && (
              <>
                <View style={styles.modalEncabezado}>
                  <Text style={styles.modalEtiqueta}>Detalle del estudio</Text>
                  <View
                    style={[styles.chip, { backgroundColor: COLORES_ESTUDIO[estudioSeleccionado.estado] }]}>
                    <Text style={styles.chipTexto}>{ETIQUETAS_ESTUDIO[estudioSeleccionado.estado]}</Text>
                  </View>
                </View>

                <View style={styles.modalCuerpo}>
                  <View style={styles.tipo}>
                    <Text style={styles.tipoTexto}>{estudioSeleccionado.tipo}</Text>
                  </View>
                  <View style={styles.datos}>
                    <Text style={styles.modalTitulo}>{estudioSeleccionado.titulo}</Text>
                    <Text style={styles.detalle}>{estudioSeleccionado.detalle}</Text>
                  </View>
                </View>

                <View style={styles.modalFila}>
                  <Text style={styles.modalFilaEtiqueta}>Pedido por</Text>
                  <Text style={styles.modalFilaValor}>{estudioSeleccionado.medico}</Text>
                </View>

                {estudioSeleccionado.indicaciones.length > 0 && (
                  <View style={styles.avisoCaja}>
                    {estudioSeleccionado.indicaciones.map((indicacion) => (
                      <Text key={indicacion} style={styles.avisoTexto}>
                        • {indicacion}
                      </Text>
                    ))}
                  </View>
                )}

                {estudioSeleccionado.estado === 'pendiente' && (
                  <Pressable
                    style={styles.botonPrimario}
                    onPress={() => {
                      setEstudioSeleccionado(null);
                      router.push('/paciente/sacar-turno');
                    }}>
                    <Text style={styles.botonPrimarioTexto}>Sacar turno para este estudio</Text>
                  </Pressable>
                )}
                <Pressable style={styles.cerrar} onPress={() => setEstudioSeleccionado(null)}>
                  <Text style={styles.cerrarTexto}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
  },
  contenidoVacio: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
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
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
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
  vacio: {
    paddingHorizontal: 20,
  },
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
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
