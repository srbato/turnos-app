import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MenuMedico } from '@/components/menu-medico';
import { buscarMedicamentos, ResultadoVademecum } from '@/servicios/vademecum';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_ERROR = '#D64545';

// Pantalla de consulta del vademécum (CIMA, de la AEMPS de España). Solo se mira: no se guarda nada ni se toca el
// flujo de recetas. El estado es de esta pantalla y no lo comparte nadie, así que alcanza con useState.
export default function Vademecum() {
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
      setAviso('Escribí el nombre de un medicamento.');
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
      setError('No se pudo consultar el vademécum. Revisá tu conexión e intentá de nuevo.');
    }
    setCargando(false);
  }

  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/medico/recetas');
    }
  }

  const medicamentos = resultado ? resultado.medicamentos : [];

  // Lo que se muestra cuando no hay filas: buscando, error, sin resultados o todavía no se buscó nada.
  let mensajeVacio = <Text style={styles.vacioTexto}>Escribí el nombre de un medicamento y apretá Buscar.</Text>;
  if (cargando) {
    mensajeVacio = (
      <View style={styles.vacioCentrado}>
        <ActivityIndicator size="small" color={COLOR_MEDICO} />
        <Text style={styles.vacioTexto}>Buscando…</Text>
      </View>
    );
  } else if (error !== '') {
    mensajeVacio = (
      <View style={styles.vacioCentrado}>
        <Text style={[styles.vacioTexto, styles.errorTexto]}>{error}</Text>
        <Pressable style={styles.botonReintentar} onPress={buscar}>
          <Text style={styles.botonReintentarTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  } else if (resultado) {
    mensajeVacio = <Text style={styles.vacioTexto}>No hay medicamentos que coincidan con «{ultimaBusqueda}».</Text>;
  }

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <Pressable onPress={volver} hitSlop={10}>
          <Text style={styles.volver}>‹ Recetas</Text>
        </Pressable>
        <Text style={styles.titulo}>Vademécum</Text>
        <Text style={styles.ayuda}>
          Datos de CIMA, el vademécum de España (AEMPS). Es solo de consulta: los nombres comerciales y la condición de
          receta son los de allá.
        </Text>

        <View style={styles.filaBuscar}>
          <TextInput
            style={styles.buscador}
            value={texto}
            onChangeText={(nuevo) => {
              setTexto(nuevo);
              setAviso('');
            }}
            onSubmitEditing={buscar}
            returnKeyType="search"
            placeholder="Ej: ibuprofeno"
            placeholderTextColor="#8A8E95"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={[styles.botonBuscar, cargando && styles.botonBuscarOcupado]}
            disabled={cargando}
            onPress={buscar}>
            <Text style={styles.botonBuscarTexto}>Buscar</Text>
          </Pressable>
        </View>
        {aviso !== '' && <Text style={styles.avisoTexto}>{aviso}</Text>}
      </SafeAreaView>

      <FlatList
        style={styles.lista}
        contentContainerStyle={styles.listaContenido}
        data={medicamentos}
        keyExtractor={(medicamento) => medicamento.nregistro}
        ListHeaderComponent={
          resultado && resultado.total > medicamentos.length ? (
            <Text style={styles.cantidad}>
              Mostrando los primeros {medicamentos.length} de {resultado.total}. Probá con un nombre más específico.
            </Text>
          ) : null
        }
        ListEmptyComponent={<View style={styles.vacio}>{mensajeVacio}</View>}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={styles.datos}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.laboratorio}>{item.laboratorio}</Text>
            </View>
            {item.receta && (
              <View style={styles.marcaReceta}>
                <Text style={styles.marcaRecetaTexto}>Con receta</Text>
              </View>
            )}
          </View>
        )}
      />

      <MenuMedico activa="recetas" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  encabezado: {
    backgroundColor: FONDO_GRAFITO,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  volver: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A9ADB4',
    marginBottom: 6,
  },
  titulo: {
    fontSize: 22,
    fontFamily: FUENTE_TITULOS,
    color: '#FFFFFF',
  },
  ayuda: {
    fontSize: 12,
    color: '#A9ADB4',
    marginTop: 6,
  },
  filaBuscar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  buscador: {
    flex: 1,
    backgroundColor: '#2B2F36',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
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
    color: '#F2A3A3',
    marginTop: 8,
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    padding: 20,
    paddingBottom: 24,
  },
  cantidad: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginBottom: 10,
  },
  vacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  vacioCentrado: {
    alignItems: 'center',
    gap: 10,
  },
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
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
    color: COLOR_MEDICO,
    fontSize: 13,
    fontWeight: '700',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  datos: {
    flex: 1,
    marginRight: 8,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  laboratorio: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 3,
  },
  marcaReceta: {
    backgroundColor: '#FBDCDC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  marcaRecetaTexto: {
    color: COLOR_ERROR,
    fontSize: 11,
    fontWeight: '700',
  },
});
