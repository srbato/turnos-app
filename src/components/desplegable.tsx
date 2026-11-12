import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { aclarar, PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

export type OpcionDesplegable = {
  id: string;
  texto: string;
  detalle?: string; // línea más chica debajo del texto (por ejemplo, la cobertura de un paciente)
};

// Se usa de una de dos formas: selección simple (elegida + onElegir) o selección múltiple (elegidas + onAlternar).
type Props = {
  opciones: OpcionDesplegable[];
  placeholder: string;
  // 'modal': la lista se abre en un Modal.
  // 'expandido': la lista se despliega en el lugar, debajo del botón (para usarlo adentro de otro Modal).
  modo: 'modal' | 'expandido';
  color: string; // color del rol
  textoVacio?: string;
  // Selección simple: se elige una sola opción y la lista se cierra.
  // La opción elegida va aparte de "opciones": si hay un buscador, puede quedar fuera de la lista filtrada y igual tiene que verse.
  elegida?: OpcionDesplegable;
  onElegir?: (id: string) => void;
  // Selección múltiple: cada toque marca o desmarca una opción y la lista queda abierta para marcar más.
  elegidas?: string[]; // ids de las opciones marcadas
  onAlternar?: (id: string) => void;
  // Si se pasa, la lista trae un campo para filtrar las opciones mientras se escribe (solo en modo 'modal').
  // El texto es el placeholder del campo. Las pantallas que ya filtran por su cuenta no lo usan.
  placeholderBuscador?: string;
};

// Pasa a minúsculas y le saca las tildes, para que "jose" encuentre "José".
function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

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
  textoVacio,
  placeholderBuscador,
}: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const t = TEXTOS_MEDICO[idioma];
  const styles = crearEstilos(paletaApp(modoOscuro));
  // El color del rol es oscuro: como texto sobre fondo oscuro se aclara.
  const colorTexto = modoOscuro ? aclarar(color) : color;
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const esMultiple = onAlternar !== undefined;
  const conBuscador = placeholderBuscador !== undefined && modo === 'modal';

  // Abre o cierra la lista; al cerrarla se borra lo escrito para que la próxima vez arranque completa.
  function cambiarAbierto(nuevoValor: boolean) {
    setAbierto(nuevoValor);
    setBusqueda('');
  }

  // Con buscador, se muestran solo las opciones cuyo texto o detalle contienen lo escrito.
  const consulta = normalizar(busqueda.trim());
  const opcionesVisibles =
    conBuscador && consulta !== ''
      ? opciones.filter((opcion) => normalizar(`${opcion.texto} ${opcion.detalle ?? ''}`).includes(consulta))
      : opciones;

  function tocarOpcion(id: string) {
    if (onAlternar !== undefined) {
      onAlternar(id);
    } else if (onElegir !== undefined) {
      onElegir(id);
      cambiarAbierto(false);
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
      data={opcionesVisibles}
      keyboardShouldPersistTaps="handled"
      // La FlatList solo vuelve a dibujar las filas si cambia "data": hay que avisarle cuando cambian las marcadas.
      extraData={esMultiple ? elegidas : elegida}
      keyExtractor={(opcion) => opcion.id}
      ListEmptyComponent={
        <Text style={styles.vacio}>
          {opciones.length > 0 ? t.desplegable.sinCoincidencias : (textoVacio ?? t.desplegable.sinOpciones)}
        </Text>
      }
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
      <Pressable style={[styles.boton, { borderColor: color }]} onPress={() => cambiarAbierto(!abierto)}>
        <Text style={[styles.botonTexto, !hayElegidas && styles.botonPlaceholder]} numberOfLines={esMultiple ? 2 : 1}>
          {hayElegidas ? textoBoton : placeholder}
        </Text>
        <Text style={[styles.flecha, { color: colorTexto }]}>{abierto ? '▴' : '▾'}</Text>
      </Pressable>

      {modo === 'expandido' && abierto && <View style={[styles.contenedorExpandido, { borderColor: color }]}>{lista}</View>}

      {modo === 'modal' && (
        <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => cambiarAbierto(false)}>
          <View style={styles.fondo}>
            {/* Tocar afuera de la tarjeta cierra la lista. */}
            <Pressable style={StyleSheet.absoluteFill} onPress={() => cambiarAbierto(false)} />
            <View style={styles.tarjeta}>
              <Text style={styles.titulo}>{placeholder}</Text>
              {conBuscador && (
                <TextInput
                  style={[styles.buscador, { borderColor: color }]}
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder={placeholderBuscador}
                  placeholderTextColor="#8A8A8A"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
              {lista}
              <Pressable style={[styles.botonCerrar, { borderColor: color }]} onPress={() => cambiarAbierto(false)}>
                <Text style={[styles.botonCerrarTexto, { color: colorTexto }]}>{t.desplegable.cerrar}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: c.tarjeta,
  },
  botonTexto: {
    flex: 1,
    fontSize: 15,
    color: c.texto,
  },
  botonPlaceholder: {
    color: c.textoTenue,
  },
  flecha: {
    fontSize: 13,
  },
  contenedorExpandido: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    padding: 4,
    backgroundColor: c.tarjeta,
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
    color: c.texto,
  },
  filaDetalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 1,
  },
  filaTextoElegida: {
    color: '#FFFFFF',
  },
  vacio: {
    fontSize: 13,
    color: c.textoTenue,
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
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  buscador: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: c.texto,
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
