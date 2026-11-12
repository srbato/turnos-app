import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useRecetas } from '@/contextos/RecetasContext';
import { recetaVigente, vencimientoReceta, Receta } from '@/datos/recetas';
import { formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// Tab "Recetados": medicamentos que asignó el médico, cada uno con su receta.
export default function MedicamentosRecetados() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
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
          <Text style={styles.vacioTexto}>{t.medicamentos.sinRecetados}</Text>
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
                  {vigente ? t.medicamentos.validaHasta : t.medicamentos.vencioEl} {formatearFecha(vencimientoReceta(item))}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: vigente ? COLOR_CONFIRMADO : COLOR_CANCELADO }]}>
                <Text style={styles.chipTexto}>{vigente ? t.medicamentos.vigente : t.medicamentos.vencida}</Text>
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
                  <Text style={styles.modalEtiqueta}>{t.medicamentos.receta}</Text>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: recetaVigente(recetaSeleccionada) ? COLOR_CONFIRMADO : COLOR_CANCELADO },
                    ]}>
                    <Text style={styles.chipTexto}>
                      {recetaVigente(recetaSeleccionada) ? t.medicamentos.vigente : t.medicamentos.vencida}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalNombre}>{recetaSeleccionada.medicamento}</Text>
                <Text style={styles.modalIndicacion}>{recetaSeleccionada.indicacion}</Text>

                <View style={styles.filas}>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>{t.medicamentos.recetadoPor}</Text>
                    <Text style={styles.filaValor}>{recetaSeleccionada.medico}</Text>
                  </View>
                  <View style={styles.fila}>
                    <Text style={styles.filaEtiqueta}>{t.medicamentos.emitidaEl}</Text>
                    <Text style={styles.filaValor}>{formatearFecha(recetaSeleccionada.fechaEmision)}</Text>
                  </View>
                  <View style={[styles.fila, styles.filaUltima]}>
                    <Text style={styles.filaEtiqueta}>{t.medicamentos.validaHasta}</Text>
                    <Text style={styles.filaValor}>
                      {formatearFecha(vencimientoReceta(recetaSeleccionada))}
                    </Text>
                  </View>
                </View>

                <View style={styles.codigoCaja}>
                  <Text style={styles.codigoEtiqueta}>{t.medicamentos.codigo}</Text>
                  <Text style={styles.codigo}>{recetaSeleccionada.codigo}</Text>
                  <Text style={styles.codigoNota}>
                    {recetaVigente(recetaSeleccionada)
                      ? t.medicamentos.mostrarEnFarmacia
                      : t.medicamentos.recetaVencida}
                  </Text>
                </View>

                <Pressable style={styles.cerrar} onPress={() => setRecetaSeleccionada(null)}>
                  <Text style={styles.cerrarTexto}>{t.comun.cerrar}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: c.fondo,
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
    color: c.textoSecundario,
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: c.acento,
  },
  datos: {
    flex: 1,
    marginRight: 10,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
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
    backgroundColor: c.tarjeta,
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
    color: c.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: c.texto,
  },
  modalIndicacion: {
    fontSize: 14,
    color: c.textoSecundario,
    marginTop: 2,
    marginBottom: 14,
  },
  filas: {
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
    marginBottom: 14,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.bordeSuave,
  },
  filaUltima: {
    borderBottomWidth: 0,
  },
  filaEtiqueta: {
    fontSize: 13,
    color: c.textoTenue,
  },
  filaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: c.texto,
  },
  codigoCaja: {
    backgroundColor: c.chipAzul,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  codigoEtiqueta: {
    fontSize: 11,
    color: c.textoSecundario,
  },
  codigo: {
    fontSize: 22,
    fontWeight: '700',
    color: c.acento,
    letterSpacing: 1,
    marginVertical: 4,
  },
  codigoNota: {
    fontSize: 12,
    color: c.textoSecundario,
    textAlign: 'center',
  },
  cerrar: {
    alignItems: 'center',
    paddingTop: 14,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textoSecundario,
  },
});
