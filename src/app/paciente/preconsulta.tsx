import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Desplegable } from '@/components/desplegable';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CONFIRMADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useErrores } from '@/contextos/ErroresContext';
import { useMedicamentos } from '@/contextos/MedicamentosContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { useRecetas } from '@/contextos/RecetasContext';
import { useTurnos } from '@/contextos/TurnosContext';
import {
  CAMPOS_PRECONSULTA,
  ETIQUETAS_CAMPOS,
  PASOS,
  RESPUESTAS_VACIAS,
  SINTOMAS,
  RespuestasPreconsulta,
} from '@/datos/preconsulta';
import { respuestaDelAsistente } from '@/servicios/preconsulta-ia';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

type AutorMensaje = 'asistente' | 'paciente';

type Mensaje = {
  id: string;
  autor: AutorMensaje;
  texto: string;
};

type Fase = 'chat' | 'resumen' | 'enviada';

// Campos del resumen que se editan como texto (los síntomas se muestran separados por coma).
const CAMPOS_RESUMEN = CAMPOS_PRECONSULTA;

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/paciente');
  }
}

export default function PantallaPreconsulta() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  // Los síntomas se guardan siempre con su nombre en español (así los ve el médico); en pantalla se muestran traducidos.
  const etiquetaSintoma = (sintoma: string) => t.preconsulta.sintomas[SINTOMAS.indexOf(sintoma)] ?? sintoma;
  const { turnoId } = useLocalSearchParams<{ turnoId?: string }>();
  const { turnos } = useTurnos();
  const { nombre, alergias: alergiasDelPerfil } = usePerfilPaciente();
  const { medicamentos } = useMedicamentos();
  const { buscarPorTurno, enviarPreconsulta } = usePreconsultas();
  const { mostrarError } = useErrores();
  const { misRecetas } = useRecetas();

  const turno = turnos.find((t) => t.id === turnoId);
  const existente = turno ? buscarPorTurno(turno.id) : undefined;

  const [fase, setFase] = useState<Fase>(existente ? 'resumen' : 'chat');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestasPreconsulta>(
    existente ? existente.respuestas : RESPUESTAS_VACIAS
  );
  const [texto, setTexto] = useState('');
  const [sintomasMarcados, setSintomasMarcados] = useState<string[]>([]);
  // Texto que el paciente ve y edita en el resumen (los síntomas como una sola línea).
  const [sintomasTexto, setSintomasTexto] = useState(
    existente ? existente.respuestas.sintomas.join(', ') : ''
  );

  // Medicación que ya tiene en la app: la que le recetó el médico y la que cargó él mismo.
  const medicamentosCargados = [
    ...misRecetas.map((receta) => receta.medicamento),
    ...medicamentos.map((medicamento) => medicamento.nombre),
  ];
  const contexto = {
    nombre: nombre.split(' ')[0],
    medicamentosCargados,
    alergiasCargadas: alergiasDelPerfil.trim(),
  };

  // Al entrar (si no había una preconsulta enviada) el asistente saluda y hace la primera pregunta.
  useEffect(() => {
    if (turno && !existente) {
      agregarMensajes('asistente', respuestaDelAsistente(0, RESPUESTAS_VACIAS, contexto, idioma));
    }
    // Solo al montar la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el turno no existe (URL escrita a mano), se vuelve al home.
  if (!turno) {
    return <Redirect href="/paciente" />;
  }

  function agregarMensajes(autor: AutorMensaje, textos: string[]) {
    setMensajes((anteriores) => [
      ...anteriores,
      ...textos.map((t, indice) => ({ id: `${Date.now()}-${anteriores.length}-${indice}`, autor, texto: t })),
    ]);
  }

  // Guarda la respuesta, la muestra en el chat y pide al asistente el siguiente mensaje.
  function responder(textoPaciente: string, nuevasRespuestas: RespuestasPreconsulta) {
    agregarMensajes('paciente', [textoPaciente]);
    setRespuestas(nuevasRespuestas);
    setTexto('');
    setSintomasMarcados([]);

    const siguiente = paso + 1;
    setPaso(siguiente);
    agregarMensajes('asistente', respuestaDelAsistente(siguiente, nuevasRespuestas, contexto, idioma));
    if (siguiente === PASOS.length) {
      setSintomasTexto(nuevasRespuestas.sintomas.join(', '));
      if (nuevasRespuestas.alergias === '') {
        setRespuestas({ ...nuevasRespuestas, alergias: alergiasDelPerfil.trim() });
      }
      setFase('resumen');
    }
  }

  function enviarTexto(saltear: boolean) {
    const clave = PASOS[paso].clave;
    const valor = saltear ? '' : texto.trim();
    if (!saltear && valor === '') return;
    responder(saltear ? t.preconsulta.prefieroNo : valor, { ...respuestas, [clave]: valor });
  }

  function enviarSintomas() {
    responder(
      sintomasMarcados.length > 0 ? sintomasMarcados.map(etiquetaSintoma).join(', ') : t.preconsulta.ninguna,
      { ...respuestas, sintomas: sintomasMarcados }
    );
  }

  function alternarSintoma(sintoma: string) {
    setSintomasMarcados(
      sintomasMarcados.includes(sintoma)
        ? sintomasMarcados.filter((s) => s !== sintoma)
        : [...sintomasMarcados, sintoma]
    );
  }

  async function enviarAlMedico() {
    if (!turno) return;
    const error = await enviarPreconsulta(turno.id, {
      ...respuestas,
      sintomas: sintomasTexto
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== ''),
    });
    if (error !== '') {
      mostrarError(error);
      return;
    }
    setFase('enviada');
  }

  const pasoActual = fase === 'chat' ? Math.min(paso, PASOS.length) : PASOS.length;
  const encabezadoFecha = t.detalleTurno.hora(detalleFecha(turno.fecha, idioma).diaSemana, formatearFecha(turno.fecha), turno.hora);

  return (
    // Sube el contenido cuando aparece el teclado, así no tapa el campo de respuesta.
    <PantallaConTeclado style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoFila}>
          <Pressable onPress={volver}>
            <Text style={styles.volver}>‹</Text>
          </Pressable>
          <View style={styles.encabezadoTextos}>
            <Text style={styles.titulo}>{t.preconsulta.titulo}</Text>
            <Text style={styles.subtitulo}>
              {turno.medico} · {encabezadoFecha}
            </Text>
          </View>
        </View>
        <View style={styles.progresoFila}>
          {PASOS.map((p, indice) => (
            <View
              key={p.clave}
              style={[styles.progresoSegmento, indice < pasoActual && styles.progresoSegmentoLleno]}
            />
          ))}
        </View>
      </View>

      {fase === 'chat' && (
        <>
          {/* Lista invertida: arranca mostrando lo último, así el chat queda siempre abajo. */}
          <FlatList
            inverted
            style={styles.chat}
            contentContainerStyle={styles.chatContenido}
            data={[...mensajes].reverse()}
            keyExtractor={(mensaje) => mensaje.id}
            renderItem={({ item }) =>
              item.autor === 'asistente' ? (
                <View style={styles.filaAsistente}>
                  <View style={styles.avatarAsistente}>
                    <Text style={styles.avatarAsistenteTexto}>{t.preconsulta.asistente}</Text>
                  </View>
                  <View style={styles.burbujaAsistente}>
                    <Text style={styles.burbujaAsistenteTexto}>{item.texto}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.filaPaciente}>
                  <View style={styles.burbujaPaciente}>
                    <Text style={styles.burbujaPacienteTexto}>{item.texto}</Text>
                  </View>
                </View>
              )
            }
          />

          {paso < PASOS.length && PASOS[paso].tipo === 'sintomas' && (
            <View style={styles.zonaRespuesta}>
              <View style={styles.selectorSintomas}>
                <Desplegable
                  opciones={SINTOMAS.map((sintoma) => ({ id: sintoma, texto: etiquetaSintoma(sintoma) }))}
                  elegidas={sintomasMarcados}
                  onAlternar={alternarSintoma}
                  placeholder={t.preconsulta.elegirSintomas}
                  modo="modal"
                  color={COLOR_PACIENTE}
                />
              </View>
              <Pressable style={styles.botonPrimario} onPress={enviarSintomas}>
                <Text style={styles.botonPrimarioTexto}>
                  {sintomasMarcados.length > 0 ? t.preconsulta.listo : t.preconsulta.ninguno}
                </Text>
              </Pressable>
            </View>
          )}

          {paso < PASOS.length && PASOS[paso].tipo === 'texto' && (
            <View style={styles.zonaRespuesta}>
              <View style={styles.filaInput}>
                <TextInput
                  style={styles.input}
                  value={texto}
                  onChangeText={setTexto}
                  placeholder={t.preconsulta.escribi}
                  placeholderTextColor="#8A8A8A"
                  onSubmitEditing={() => enviarTexto(false)}
                />
                <Pressable style={styles.botonEnviar} onPress={() => enviarTexto(false)}>
                  <Text style={styles.botonEnviarTexto}>↑</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => enviarTexto(true)}>
                <Text style={styles.saltear}>{t.preconsulta.saltear}</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {fase === 'resumen' && (
        <View style={styles.resumenZona}>
          <FlatList
            contentContainerStyle={styles.resumenContenido}
            data={CAMPOS_RESUMEN}
            keyExtractor={(campo) => campo}
            ListHeaderComponent={
              <Text style={styles.resumenIntro}>{t.preconsulta.intro}</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.campoCaja}>
                <Text style={styles.campoEtiqueta}>{TEXTOS_MEDICO[idioma].preconsulta.campos[item]}</Text>
                <TextInput
                  style={styles.campoInput}
                  multiline
                  placeholder={t.preconsulta.sinDatos}
                  placeholderTextColor="#9A9A9A"
                  value={item === 'sintomas' ? sintomasTexto : (respuestas[item] as string)}
                  onChangeText={(valor) =>
                    item === 'sintomas'
                      ? setSintomasTexto(valor)
                      : setRespuestas({ ...respuestas, [item]: valor })
                  }
                />
              </View>
            )}
          />
          <View style={styles.barraEnviar}>
            <Pressable style={styles.botonPrimario} onPress={enviarAlMedico}>
              <Text style={styles.botonPrimarioTexto}>
                {existente ? t.preconsulta.actualizarYEnviar : t.preconsulta.enviar}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {fase === 'enviada' && (
        <View style={styles.enviadaZona}>
          <View style={styles.enviadaIcono}>
            <Text style={styles.enviadaTilde}>✓</Text>
          </View>
          <Text style={styles.enviadaTitulo}>{t.preconsulta.enviadaTitulo}</Text>
          <Text style={styles.enviadaTexto}>{t.preconsulta.enviadaTexto(turno.medico)}</Text>
          <Pressable style={styles.botonPrimarioAncho} onPress={() => router.dismissTo('/paciente')}>
            <Text style={styles.botonPrimarioTexto}>{t.preconsulta.volverAlInicio}</Text>
          </Pressable>
        </View>
      )}
    </PantallaConTeclado>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: c.tarjeta,
  },
  encabezadoFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    fontSize: 30,
    color: c.texto,
    marginRight: 14,
  },
  encabezadoTextos: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
  },
  subtitulo: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 2,
  },
  progresoFila: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  progresoSegmento: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.chipAzul,
  },
  progresoSegmentoLleno: {
    backgroundColor: COLOR_PACIENTE,
  },
  chat: {
    flex: 1,
  },
  chatContenido: {
    padding: 20,
  },
  filaAsistente: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '88%',
  },
  avatarAsistente: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLOR_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarAsistenteTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  burbujaAsistente: {
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  burbujaAsistenteTexto: {
    fontSize: 14,
    color: c.texto,
    lineHeight: 20,
  },
  filaPaciente: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  burbujaPaciente: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  burbujaPacienteTexto: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  zonaRespuesta: {
    backgroundColor: c.tarjeta,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12 + MARGEN_INFERIOR,
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
  },
  selectorSintomas: {
    marginBottom: 12,
  },
  filaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.borde,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
  },
  botonEnviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEnviarTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  saltear: {
    fontSize: 13,
    color: c.textoSecundario,
    textAlign: 'center',
    marginTop: 12,
  },
  botonPrimario: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resumenZona: {
    flex: 1,
  },
  resumenContenido: {
    padding: 20,
  },
  resumenIntro: {
    fontSize: 13,
    color: c.textoSecundario,
    lineHeight: 19,
    marginBottom: 16,
  },
  campoCaja: {
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  campoEtiqueta: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textoTenue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campoInput: {
    fontSize: 14,
    color: c.texto,
    padding: 0,
  },
  barraEnviar: {
    backgroundColor: c.tarjeta,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12 + MARGEN_INFERIOR,
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
  },
  enviadaZona: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  enviadaIcono: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLOR_CONFIRMADO,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  enviadaTilde: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  enviadaTitulo: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginBottom: 8,
  },
  enviadaTexto: {
    fontSize: 14,
    color: c.textoSecundario,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  botonPrimarioAncho: {
    alignSelf: 'stretch',
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
});
