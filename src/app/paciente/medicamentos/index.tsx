import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useRecetas } from '@/contextos/RecetasContext';
import { recetaVigente, vencimientoReceta, Receta } from '@/datos/recetas';
import { formatearFecha } from '@/utilidades/turnos';

// Tab "Recetados": medicamentos que asignó el médico, cada uno con su receta.
export default function MedicamentosRecetados() {
  const { misRecetas } = useRecetas();
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);

  // Las recetas vigentes van primero.
  const recetas = [...misRecetas].sort((a, b) => Number(recetaVigente(b)) - Number(recetaVigente(a)));

  return (
    <View style={styles.pantalla}>
      <FlatList
        contentContainerStyle={[styles.contenido, recetas.length === 0 && styles.contenidoVacio]}
        data={recetas}
        keyExtractor={(receta) => receta.id}
        ListEmptyComponent={
          <Text style={styles.vacioTexto}>Tu médico todavía no te recetó medicamentos.</Text>
        }
        renderItem={({ item }) => {
          const vigente = recetaVigente(item);
          return (
            <Pressable style={styles.tarjeta} onPress={() => setRecetaSeleccionada(item)}>
              <View style={styles.icono}>
                <Text style={styles.iconoTexto}>{item.abreviatura}</Text>
              </View>
              <View style={styles.datos}>
                <Text style={styles.nombre}>{item.medicamento}</Text>
                <Text style={styles.detalle}>{item.indicacion}</Text>
                <Text style={styles.detalle}>
                  {vigente ? 'Válida hasta' : 'Venció el'} {formatearFecha(vencimientoReceta(item))}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: vigente ? COLOR_CONFIRMADO : COLOR_CANCELADO }]}>
                <Text style={styles.chipTexto}>{vigente ? 'Vigente' : 'Vencida'}</Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Modal
        visible={recetaSeleccionada !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setRecetaSeleccionada(null)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            {recetaSeleccionada && (
              <>
                <View style={styles.modalEncabezado}>
                  <Text style={styles.modalEtiqueta}>Receta</Text>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: recetaVigente(recetaSeleccionada) ? COLOR_CONFIRMADO : COLOR_CANCELADO },
                    ]}>
                    <Text style={styles.chipTexto}>
                      {recetaVigente(recetaSeleccionada) ? 'Vigente' : 'Vencida'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalNombre}>{recetaSeleccionada.medicamento}</Text>
                <Text style={styles.modalIndicacion}>{recetaSeleccionada.indicacion}</Text>

                <View style={styles.filas}>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>Recetado por</Text>
                    <Text style={styles.filaValor}>{recetaSeleccionada.medico}</Text>
                  </View>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>Emitida el</Text>
                    <Text style={styles.filaValor}>{formatearFecha(recetaSeleccionada.fechaEmision)}</Text>
                  </View>
                  <View style={[styles.fila, styles.filaUltima]}>
                    <Text style={styles.filaEtiqueta}>Válida hasta</Text>
                    <Text style={styles.filaValor}>
                      {formatearFecha(vencimientoReceta(recetaSeleccionada))}
                    </Text>
                  </View>
                </View>

                <View style={styles.codigoCaja}>
                  <Text style={styles.codigoEtiqueta}>Código de receta</Text>
                  <Text style={styles.codigo}>{recetaSeleccionada.codigo}</Text>
                  <Text style={styles.codigoNota}>
                    {recetaVigente(recetaSeleccionada)
                      ? 'Mostralo en la farmacia para retirar tu medicamento.'
                      : 'Esta receta ya venció. Pedile una nueva a tu médico.'}
                  </Text>
                </View>

                <Pressable style={styles.cerrar} onPress={() => setRecetaSeleccionada(null)}>
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
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  datos: {
    flex: 1,
    marginRight: 10,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
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
    marginBottom: 14,
  },
  modalEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalIndicacion: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 2,
    marginBottom: 14,
  },
  filas: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    marginBottom: 14,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  filaUltima: {
    borderBottomWidth: 0,
  },
  filaEtiqueta: {
    fontSize: 13,
    color: '#8A8A8A',
  },
  filaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  codigoCaja: {
    backgroundColor: FONDO_PACIENTE,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  codigoEtiqueta: {
    fontSize: 11,
    color: '#5A5A5A',
  },
  codigo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLOR_PACIENTE,
    letterSpacing: 1,
    marginVertical: 4,
  },
  codigoNota: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
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
