import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type OpcionDesplegable = {
  id: string;
  texto: string;
  detalle?: string; // línea más chica debajo del texto (por ejemplo, la cobertura de un paciente)
};

type PropsComunes = {
  opciones: OpcionDesplegable[];
  placeholder: string;
  // 'modal': la lista se abre en un Modal.
  // 'expandido': la lista se despliega en el lugar, debajo del botón (para usarlo adentro de otro Modal).
  modo: 'modal' | 'expandido';
  color: string; // color del rol
  textoVacio?: string;
};

// Selección simple: se elige una sola opción y la lista se cierra.
type PropsSimple = PropsComunes & {
  // La opción elegida va aparte de "opciones": si hay un buscador, puede quedar fuera de la lista filtrada y igual tiene que verse.
  elegida?: OpcionDesplegable;
  onElegir: (id: string) => void;
  elegidas?: undefined;
  onAlternar?: undefined;
};

// Selección múltiple: cada toque marca o desmarca una opción y la lista queda abierta para marcar más.
type PropsMultiple = PropsComunes & {
  elegidas: string[]; // ids de las opciones marcadas
  onAlternar: (id: string) => void;
  elegida?: undefined;
  onElegir?: undefined;
};

// Se pasa onElegir (simple) o onAlternar (múltiple), nunca los dos: así TypeScript avisa si se mezclan.
type Props = PropsSimple | PropsMultiple;

// Lista desplegable: muestra lo elegido (o un placeholder) y al tocarla abre la lista de opciones.
export function Desplegable({
  opciones,
  elegida,
  onElegir,
  elegidas,
  onAlternar,
  placeholder,
  modo,
  color,
  textoVacio = 'No hay opciones para elegir.',
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const esMultiple = onAlternar !== undefined;

  function tocarOpcion(id: string) {
    if (onAlternar !== undefined) {
      onAlternar(id);
    } else if (onElegir !== undefined) {
      onElegir(id);
      setAbierto(false);
    }
  }

  function estaElegida(id: string) {
    return esMultiple ? (elegidas ?? []).includes(id) : id === elegida?.id;
  }

  // Lo que muestra el botón cerrado: en múltiple, los textos de las marcadas separados por coma (en el orden en que se marcaron).
  const hayElegidas = esMultiple ? (elegidas ?? []).length > 0 : elegida !== undefined;
  const textoBoton = esMultiple
    ? (elegidas ?? []).map((id) => opciones.find((opcion) => opcion.id === id)?.texto ?? id).join(', ')
    : elegida?.texto;

  // La lista es la misma en los dos modos; solo cambia el alto máximo.
  const lista = (
    <FlatList
      style={modo === 'modal' ? styles.listaModal : styles.listaExpandida}
      data={opciones}
      // La FlatList solo vuelve a dibujar las filas si cambia "data": hay que avisarle cuando cambian las marcadas.
      extraData={esMultiple ? elegidas : elegida}
      keyExtractor={(opcion) => opcion.id}
      ListEmptyComponent={<Text style={styles.vacio}>{textoVacio}</Text>}
      renderItem={({ item }) => {
        const esElegida = estaElegida(item.id);
        return (
          <Pressable style={[styles.fila, esElegida && { backgroundColor: color }]} onPress={() => tocarOpcion(item.id)}>
            <View style={styles.filaTextos}>
              <Text style={[styles.filaTexto, esElegida && styles.filaTextoElegida]}>{item.texto}</Text>
              {item.detalle !== undefined && (
                <Text style={[styles.filaDetalle, esElegida && styles.filaTextoElegida]}>{item.detalle}</Text>
              )}
            </View>
            {esMultiple && esElegida && <Text style={styles.filaTilde}>✓</Text>}
          </Pressable>
        );
      }}
    />
  );

  return (
    <View>
      <Pressable style={[styles.boton, { borderColor: color }]} onPress={() => setAbierto(!abierto)}>
        <Text style={[styles.botonTexto, !hayElegidas && styles.botonPlaceholder]} numberOfLines={esMultiple ? 2 : 1}>
          {hayElegidas ? textoBoton : placeholder}
        </Text>
        <Text style={[styles.flecha, { color }]}>{abierto ? '▴' : '▾'}</Text>
      </Pressable>

      {modo === 'expandido' && abierto && <View style={[styles.contenedorExpandido, { borderColor: color }]}>{lista}</View>}

      {modo === 'modal' && (
        <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
          <View style={styles.fondo}>
            {/* Tocar afuera de la tarjeta cierra la lista. */}
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setAbierto(false)} />
            <View style={styles.tarjeta}>
              <Text style={styles.titulo}>{placeholder}</Text>
              {lista}
              <Pressable style={[styles.botonCerrar, { borderColor: color }]} onPress={() => setAbierto(false)}>
                <Text style={[styles.botonCerrarTexto, { color }]}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
  },
  botonTexto: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  botonPlaceholder: {
    color: '#8A8A8A',
  },
  flecha: {
    fontSize: 13,
  },
  contenedorExpandido: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    padding: 4,
    backgroundColor: '#FFFFFF',
  },
  listaExpandida: {
    maxHeight: 170,
  },
  listaModal: {
    maxHeight: 320,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filaTextos: {
    flex: 1,
  },
  filaTilde: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  filaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  filaDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  filaTextoElegida: {
    color: '#FFFFFF',
  },
  vacio: {
    fontSize: 13,
    color: '#8A8A8A',
    padding: 12,
    textAlign: 'center',
  },
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  botonCerrar: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  botonCerrarTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
});
