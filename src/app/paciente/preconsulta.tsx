import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_CONFIRMADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useMedicamentos } from '@/contextos/MedicamentosContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { useTurnos } from '@/contextos/TurnosContext';
import {
  ETIQUETAS_CAMPOS,
  PASOS,
  RESPUESTAS_VACIAS,
  SINTOMAS,
  type RespuestasPreconsulta,
} from '@/datos/preconsulta';
import { RECETAS } from '@/datos/recetas';
import { pedirRespuestaIA } from '@/servicios/preconsulta-ia';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

type Mensaje = {
  id: string;
  autor: 'asistente' | 'paciente';
  texto: string;
};

type Fase = 'chat' | 'resumen' | 'enviada';

// Campos del resumen que se editan como texto (los síntomas se muestran separados por coma).
const CAMPOS_RESUMEN: (keyof RespuestasPreconsulta)[] = [
  'motivo',
  'duracion',
  'sintomas',
  'medicacion',
  'alergias',
  'adicional',
];

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/paciente');
  }
}

export default function PantallaPreconsulta() {
  const { turnoId } = useLocalSearchParams<{ turnoId?: string }>();
  const { turnos } = useTurnos();
  const { nombre } = usePerfilPaciente();
  const { medicamentos } = useMedicamentos();
  const { buscarPorTurno, enviarPreconsulta } = usePreconsultas();

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
  const [escribiendo, setEscribiendo] = useState(false);
  // Texto que el paciente ve y edita en el resumen (los síntomas como una sola línea).
  const [sintomasTexto, setSintomasTexto] = useState(
    existente ? existente.respuestas.sintomas.join(', ') : ''
  );

  // Medicación que ya tiene en la app: la que le recetó el médico y la que cargó él mismo.
  const medicamentosCargados = [
    ...RECETAS.map((receta) => receta.medicamento),
    ...medicamentos.map((medicamento) => medicamento.nombre),
  ];
  const contexto = { nombre: nombre.split(' ')[0], medicamentosCargados };

  // Al entrar (si no había una preconsulta enviada) el asistente saluda y hace la primera pregunta.
  useEffect(() => {
    async function empezar() {
      setEscribiendo(true);
      const textos = await pedirRespuestaIA(0, RESPUESTAS_VACIAS, contexto);
      agregarMensajes('asistente', textos);
      setEscribiendo(false);
    }
    if (turno && !existente) {
      empezar();
    }
    // Solo al montar la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el turno no existe (URL escrita a mano), se vuelve al home.
  if (!turno) {
    return <Redirect href="/paciente" />;
  }

  function agregarMensajes(autor: Mensaje['autor'], textos: string[]) {
    setMensajes((anteriores) => [
      ...anteriores,
      ...textos.map((t, indice) => ({ id: `${Date.now()}-${anteriores.length}-${indice}`, autor, texto: t })),
    ]);
  }

  // Guarda la respuesta, la muestra en el chat y pide al asistente el siguiente mensaje.
  async function responder(textoPaciente: string, nuevasRespuestas: RespuestasPreconsulta) {
    agregarMensajes('paciente', [textoPaciente]);
    setRespuestas(nuevasRespuestas);
    setTexto('');
    setSintomasMarcados([]);

    const siguiente = paso + 1;
    setPaso(siguiente);
    setEscribiendo(true);
    const textos = await pedirRespuestaIA(siguiente, nuevasRespuestas, contexto);
    agregarMensajes('asistente', textos);
    setEscribiendo(false);
    if (siguiente === PASOS.length) {
      setSintomasTexto(nuevasRespuestas.sintomas.join(', '));
      setFase('resumen');
    }
  }

  function enviarTexto(saltear: boolean) {
    const clave = PASOS[paso].clave;
    const valor = saltear ? '' : texto.trim();
    if (!saltear && valor === '') return;
    responder(saltear ? 'Prefiero no responder' : valor, { ...respuestas, [clave]: valor });
  }

  function enviarSintomas() {
    responder(
      sintomasMarcados.length > 0 ? sintomasMarcados.join(', ') : 'Ninguno',
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

  function enviarAlMedico() {
    if (!turno) return;
    const ahora = new Date();
    const dos = (n: number) => String(n).padStart(2, '0');
    enviarPreconsulta({
      turnoId: turno.id,
      paciente: nombre,
      medico: turno.medico,
      especialidad: turno.especialidad,
      fecha: turno.fecha,
      hora: turno.hora,
      respuestas: {
        ...respuestas,
        sintomas: sintomasTexto
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s !== ''),
      },
      enviadaEl: `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())} ${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`,
    });
    setFase('enviada');
  }

  const pasoActual = fase === 'chat' ? Math.min(paso, PASOS.length) : PASOS.length;
  const encabezadoFecha = `${detalleFecha(turno.fecha).diaSemana} ${formatearFecha(turno.fecha)} · ${turno.hora} h`;

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoFila}>
          <Pressable onPress={volver}>
            <Text style={styles.volver}>‹</Text>
          </Pressable>
          <View style={styles.encabezadoTextos}>
            <Text style={styles.titulo}>Preconsulta</Text>
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
            ListHeaderComponent={
              escribiendo ? (
                <View style={styles.filaAsistente}>
                  <View style={styles.burbujaAsistente}>
                    <Text style={styles.escribiendo}>Escribiendo…</Text>
                  </View>
                </View>
              ) : null
            }
            renderItem={({ item }) =>
              item.autor === 'asistente' ? (
                <View style={styles.filaAsistente}>
                  <View style={styles.avatarAsistente}>
                    <Text style={styles.avatarAsistenteTexto}>IA</Text>
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

          {!escribiendo && paso < PASOS.length && PASOS[paso].tipo === 'sintomas' && (
            <View style={styles.zonaRespuesta}>
              <View style={styles.chipsFila}>
                {SINTOMAS.map((sintoma) => {
                  const marcado = sintomasMarcados.includes(sintoma);
                  return (
                    <Pressable
                      key={sintoma}
                      style={[styles.sintomaChip, marcado && styles.sintomaChipMarcado]}
                      onPress={() => alternarSintoma(sintoma)}>
                      <Text style={[styles.sintomaChipTexto, marcado && styles.sintomaChipTextoMarcado]}>
                        {marcado ? '✓ ' : ''}
                        {sintoma}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable style={styles.botonPrimario} onPress={enviarSintomas}>
                <Text style={styles.botonPrimarioTexto}>
                  {sintomasMarcados.length > 0 ? 'Listo' : 'Ninguno de estos'}
                </Text>
              </Pressable>
            </View>
          )}

          {!escribiendo && paso < PASOS.length && PASOS[paso].tipo === 'texto' && (
            <View style={styles.zonaRespuesta}>
              <View style={styles.filaInput}>
                <TextInput
                  style={styles.input}
                  value={texto}
                  onChangeText={setTexto}
                  placeholder="Escribí tu respuesta..."
                  placeholderTextColor="#8A8A8A"
                  onSubmitEditing={() => enviarTexto(false)}
                />
                <Pressable style={styles.botonEnviar} onPress={() => enviarTexto(false)}>
                  <Text style={styles.botonEnviarTexto}>↑</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => enviarTexto(true)}>
                <Text style={styles.saltear}>Saltear esta pregunta</Text>
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
              <Text style={styles.resumenIntro}>
                Este es el resumen que va a ver tu médico. Podés corregir lo que quieras. Fue armado con un
                asistente de IA a partir de tus respuestas; no es un diagnóstico.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.campoCaja}>
                <Text style={styles.campoEtiqueta}>{ETIQUETAS_CAMPOS[item]}</Text>
                <TextInput
                  style={styles.campoInput}
                  multiline
                  placeholder="Sin datos"
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
                {existente ? 'Actualizar y enviar al médico' : 'Enviar al médico'}
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
          <Text style={styles.enviadaTitulo}>Preconsulta enviada</Text>
          <Text style={styles.enviadaTexto}>
            {turno.medico} la va a ver antes de tu turno. Podés volver a entrar y actualizarla cuando
            quieras.
          </Text>
          <Pressable style={styles.botonPrimarioAncho} onPress={() => router.dismissTo('/paciente')}>
            <Text style={styles.botonPrimarioTexto}>Volver al inicio</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_PACIENTE,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  encabezadoFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    fontSize: 30,
    color: '#1A1A1A',
    marginRight: 14,
  },
  encabezadoTextos: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitulo: {
    fontSize: 12,
    color: '#5A5A5A',
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
    backgroundColor: '#DCE6F8',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  burbujaAsistenteTexto: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  escribiendo: {
    fontSize: 13,
    color: '#8A8A8A',
    fontStyle: 'italic',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12 + MARGEN_INFERIOR,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chipsFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sintomaChip: {
    borderWidth: 1,
    borderColor: '#CFDAF2',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sintomaChipMarcado: {
    backgroundColor: COLOR_PACIENTE,
    borderColor: COLOR_PACIENTE,
  },
  sintomaChipTexto: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  sintomaChipTextoMarcado: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
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
    color: '#5A5A5A',
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
    color: '#5A5A5A',
    lineHeight: 19,
    marginBottom: 16,
  },
  campoCaja: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  campoEtiqueta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campoInput: {
    fontSize: 14,
    color: '#1A1A1A',
    padding: 0,
  },
  barraEnviar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12 + MARGEN_INFERIOR,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  enviadaTexto: {
    fontSize: 14,
    color: '#5A5A5A',
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
