import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PACIENTE, COLOR_PENDIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { EstadoEstudio, Estudio } from '@/datos/estudios';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

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
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
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
                <Text style={styles.modalEtiqueta}>{t.estudios.detalle}</Text>
                <View
                  style={[styles.chip, { backgroundColor: COLORES_ESTUDIO[estudio.estado] }]}>
                  <Text style={styles.chipTexto}>{t.estadosEstudio[estudio.estado]}</Text>
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
                <Text style={styles.modalFilaEtiqueta}>{t.estudios.pedidoPor}</Text>
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
                  <Text style={styles.botonPrimarioTexto}>{t.estudios.sacarTurno}</Text>
                </Pressable>
              )}
              <Pressable style={styles.cerrar} onPress={() => onCerrar()}>
                <Text style={styles.cerrarTexto}>{t.comun.cerrar}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  tipo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: c.acento,
  },
  datos: {
    flex: 1,
  },
  detalle: {
    fontSize: 13,
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
    marginBottom: 16,
  },
  modalEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
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
    color: c.texto,
  },
  modalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
    marginBottom: 14,
  },
  modalFilaEtiqueta: {
    fontSize: 13,
    color: c.textoTenue,
  },
  modalFilaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: c.texto,
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
    color: c.textoSecundario,
  },
});
