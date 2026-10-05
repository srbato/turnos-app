import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { DetalleEstudioModal, COLORES_ESTUDIO, ETIQUETAS_ESTUDIO } from '@/components/modal-estudio';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import type { Estudio } from '@/datos/estudios';

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
      <DetalleEstudioModal
        estudio={estudioSeleccionado}
        onCerrar={() => setEstudioSeleccionado(null)}
      />
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
});
