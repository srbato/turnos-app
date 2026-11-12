import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { buscarMedicamentos, MedicamentoVademecum, ResultadoVademecum } from '@/servicios/vademecum';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_ERROR = '#D64545';

type Props = {
  oscuro?: boolean; // true: sobre el encabezado oscuro de la pantalla Vademécum; false: sobre fondo blanco (formulario)
  // Si se pasa, tocar un medicamento lo elige (lo usa el formulario de receta). Si no, la lista es solo de consulta.
  onElegir?: (medicamento: MedicamentoVademecum) => void;
};

// Buscador de medicamentos en CIMA (el vademécum de la AEMPS, de España): un campo, un botón Buscar y la lista de
// resultados. El estado es de este componente y no lo comparte nadie, así que alcanza con useState.
export function BuscadorMedicamentos({ oscuro = false, onElegir }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro));
  const t = TEXTOS_MEDICO[idioma];
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(''); // el campo estaba vacío
  // null = todavía no se buscó nada (o se está buscando / falló); si hay valor, es lo que devolvió CIMA.
  const [resultado, setResultado] = useState<ResultadoVademecum | null>(null);
  const [ultimaBusqueda, setUltimaBusqueda] = useState('');

  // Solo se busca al apretar el botón (nunca en cada tecla) y con algo escrito.
  async function buscar() {
    const consulta = texto.trim();
    if (consulta === '') {
      setAviso(t.buscador.avisoVacio);
      return;
    }
    if (cargando) {
      return;
    }
    setAviso('');
    setError('');
    setResultado(null);
    setCargando(true);
    try {
      const encontrados = await buscarMedicamentos(consulta);
      setResultado(encontrados);
      setUltimaBusqueda(consulta);
    } catch {
      setError(t.buscador.errorRed);
    }
    setCargando(false);
  }

  const medicamentos = resultado ? resultado.medicamentos : [];

  // Lo que se muestra cuando no hay filas: buscando, error, sin resultados o todavía no se buscó nada.
  let mensajeVacio = <Text style={styles.vacioTexto}>{t.buscador.pista}</Text>;
  if (cargando) {
    mensajeVacio = (
      <View style={styles.vacioCentrado}>
        <ActivityIndicator size="small" color={COLOR_MEDICO} />
        <Text style={styles.vacioTexto}>{t.buscador.buscando}</Text>
      </View>
    );
  } else if (error !== '') {
    mensajeVacio = (
      <View style={styles.vacioCentrado}>
        <Text style={[styles.vacioTexto, styles.errorTexto]}>{error}</Text>
        <Pressable style={styles.botonReintentar} onPress={buscar}>
          <Text style={styles.botonReintentarTexto}>{t.buscador.reintentar}</Text>
        </Pressable>
      </View>
    );
  } else if (resultado) {
    mensajeVacio = <Text style={styles.vacioTexto}>{t.buscador.sinResultados(ultimaBusqueda)}</Text>;
  }

  return (
    <View style={[styles.contenedor, oscuro && styles.contenedorOscuro]}>
      <View style={oscuro ? styles.bandaOscura : styles.bandaClara}>
        <View style={styles.filaBuscar}>
          <TextInput
            style={[styles.buscador, oscuro ? styles.buscadorOscuro : styles.buscadorClaro]}
            value={texto}
            onChangeText={(nuevo) => {
              setTexto(nuevo);
              setAviso('');
            }}
            onSubmitEditing={buscar}
            returnKeyType="search"
            placeholder={t.buscador.ejemplo}
            placeholderTextColor="#8A8E95"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[styles.botonBuscar, cargando && styles.botonBuscarOcupado]}
            disabled={cargando}
            onPress={buscar}>
            <Text style={styles.botonBuscarTexto}>{t.buscador.buscar}</Text>
          </Pressable>
        </View>
        {aviso !== '' && <Text style={[styles.avisoTexto, oscuro && styles.avisoTextoOscuro]}>{aviso}</Text>}
      </View>

      <FlatList
        style={styles.lista}
        contentContainerStyle={oscuro ? styles.listaContenidoOscuro : styles.listaContenidoClaro}
        keyboardShouldPersistTaps="handled"
        data={medicamentos}
        keyExtractor={(medicamento) => medicamento.nregistro}
        ListHeaderComponent={
          resultado && resultado.total > medicamentos.length ? (
            <Text style={styles.cantidad}>{t.buscador.mostrando(medicamentos.length, resultado.total)}</Text>
          ) : null
        }
        ListEmptyComponent={<View style={oscuro ? styles.vacioOscuro : styles.vacioClaro}>{mensajeVacio}</View>}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tarjeta, oscuro ? styles.tarjetaOscura : styles.tarjetaClara]}
            disabled={onElegir === undefined}
            onPress={() => onElegir && onElegir(item)}>
            <View style={styles.datos}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.laboratorio}>{item.laboratorio}</Text>
            </View>
            <View style={styles.lateral}>
              {item.receta && (
                <View style={styles.marcaReceta}>
                  <Text style={styles.marcaRecetaTexto}>{t.buscador.conReceta}</Text>
                </View>
              )}
              {onElegir !== undefined && <Text style={styles.elegir}>{t.buscador.elegir}</Text>}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  contenedorOscuro: {
    backgroundColor: c.fondo,
  },
  bandaOscura: {
    backgroundColor: FONDO_GRAFITO,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  bandaClara: {
    paddingBottom: 10,
  },
  filaBuscar: {
    flexDirection: 'row',
    gap: 8,
  },
  buscador: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  buscadorOscuro: {
    backgroundColor: '#2B2F36',
    color: '#FFFFFF',
  },
  buscadorClaro: {
    backgroundColor: c.tarjeta,
    borderWidth: 1,
    borderColor: c.borde,
    color: c.texto,
  },
  botonBuscar: {
    backgroundColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  botonBuscarOcupado: {
    opacity: 0.5,
  },
  botonBuscarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  avisoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_ERROR,
    marginTop: 8,
  },
  avisoTextoOscuro: {
    color: '#F2A3A3',
  },
  lista: {
    flex: 1,
  },
  listaContenidoOscuro: {
    padding: 20,
    paddingBottom: 24,
  },
  listaContenidoClaro: {
    paddingBottom: 8,
  },
  cantidad: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginBottom: 10,
  },
  vacioOscuro: {
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    padding: 20,
  },
  vacioClaro: {
    backgroundColor: c.fondo,
    borderRadius: 12,
    padding: 20,
  },
  vacioCentrado: {
    alignItems: 'center',
    gap: 10,
  },
  vacioTexto: {
    fontSize: 14,
    color: c.textoSecundario,
    textAlign: 'center',
  },
  errorTexto: {
    color: COLOR_ERROR,
    fontWeight: '600',
  },
  botonReintentar: {
    borderWidth: 1,
    borderColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  botonReintentarTexto: {
    color: c.acento,
    fontSize: 13,
    fontWeight: '700',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  tarjetaOscura: {
    backgroundColor: c.tarjeta,
  },
  tarjetaClara: {
    backgroundColor: c.fondo,
  },
  datos: {
    flex: 1,
    marginRight: 8,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  laboratorio: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 3,
  },
  lateral: {
    alignItems: 'flex-end',
    gap: 6,
  },
  marcaReceta: {
    backgroundColor: c.chipRojo,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  marcaRecetaTexto: {
    color: COLOR_ERROR,
    fontSize: 11,
    fontWeight: '700',
  },
  elegir: {
    fontSize: 12,
    fontWeight: '700',
    color: c.acento,
  },
});
