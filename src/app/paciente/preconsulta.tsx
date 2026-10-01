import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEDICOS } from '../../datos';
import { buscarProximoTurno, formatearFecha } from '../../fechas';
import { PacienteContext } from '../../PacienteContext';
import { TurnosContext } from '../../TurnosContext';

type Mensaje = {
  id: string;
  autor: 'medica' | 'paciente';
  texto: string;
};

// Las preguntas de la preconsulta, en orden. Cada respuesta avanza un paso.
const PREGUNTAS = [
  'Contame, ¿cuál es el motivo principal de la consulta?',
  '¿Desde hace cuánto te pasa?',
  '¿Tuviste alguno de estos síntomas? Marcá los que correspondan.',
  '¿Estás tomando algún medicamento que no esté en tu lista?',
  '¿Querés contarle algo más a tu médico antes del turno?',
];
const PASOS_TOTALES = PREGUNTAS.length;
const PASO_SINTOMAS = 3; // en este paso se responde con los chips de síntomas

type Sintoma = { id: string; etiqueta: string; marcado: boolean };

const SINTOMAS_INICIALES: Sintoma[] = [
  { id: 'nauseas', etiqueta: 'Náuseas', marcado: false },
  { id: 'vision', etiqueta: 'Visión borrosa', marcado: false },
  { id: 'fiebre', etiqueta: 'Fiebre', marcado: false },
  { id: 'mareos', etiqueta: 'Mareos', marcado: false },
];

const MENSAJE_FINAL = '¡Gracias! Ya tengo tu preconsulta. Nos vemos en el turno.';

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';

// Primer mensaje del chat: saluda al paciente por su nombre.
function saludo(nombre: string): Mensaje {
  return { id: 'saludo', autor: 'medica', texto: `Hola ${nombre}.` };
}

// Arma el chat completo (preguntas + respuestas) de una preconsulta ya hecha.
function armarChatCompleto(nombre: string, respuestas: string[]) {
  const chat: Mensaje[] = [saludo(nombre)];
  for (let i = 0; i < PREGUNTAS.length; i++) {
    chat.push({ id: 'pregunta' + i, autor: 'medica', texto: PREGUNTAS[i] });
    chat.push({ id: 'respuesta' + i, autor: 'paciente', texto: respuestas[i] });
  }
  chat.push({ id: 'final', autor: 'medica', texto: MENSAJE_FINAL });
  return chat;
}

export default function Preconsulta() {
  const { turnos, guardarPreconsulta } = useContext(TurnosContext);
  const { paciente, medicamentos } = useContext(PacienteContext);

  // La preconsulta es para el próximo turno del paciente.
  const proximoTurno = buscarProximoTurno(turnos);

  // Si ya la completó, se muestra el chat terminado; si no, empieza en el paso 1.
  const [paso, setPaso] = useState(
    proximoTurno && proximoTurno.preconsulta.length > 0 ? PASOS_TOTALES + 1 : 1
  );
  const [mensajes, setMensajes] = useState<Mensaje[]>(
    proximoTurno && proximoTurno.preconsulta.length > 0
      ? armarChatCompleto(paciente.nombre, proximoTurno.preconsulta)
      : [saludo(paciente.nombre), { id: '1', autor: 'medica', texto: PREGUNTAS[0] }]
  );
  const [sintomas, setSintomas] = useState<Sintoma[]>(SINTOMAS_INICIALES);
  const [respuesta, setRespuesta] = useState('');

  const terminado = paso > PASOS_TOTALES;

  const resumenCargado = [
    `Medicación: ${medicamentos.map((medicamento) => medicamento.nombre).join(', ')}`,
    `Alergias: ${paciente.alergias}`,
  ];

  if (!proximoTurno) {
    return (
      <SafeAreaView style={styles.pantallaVacia}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volverVacio}>‹ Preconsulta</Text>
        </Pressable>
        <View style={styles.estadoVacio}>
          <Text style={styles.estadoVacioTexto}>
            No tenés turnos próximos. Cuando saques uno, vas a poder hacer la preconsulta acá.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const medicoDelTurno = MEDICOS.find((medico) => medico.nombre === proximoTurno.medico);
  const inicialesMedico = medicoDelTurno ? medicoDelTurno.iniciales : '';

  function alternarSintoma(id: string) {
    setSintomas(sintomas.map((s) => (s.id === id ? { ...s, marcado: !s.marcado } : s)));
  }

  // Agrega la respuesta del paciente y, después, la siguiente pregunta
  // (o el mensaje final si era la última).
  function responder(texto: string) {
    const nuevosMensajes: Mensaje[] = [
      ...mensajes,
      { id: String(Date.now()), autor: 'paciente', texto: texto },
    ];

    if (paso < PASOS_TOTALES) {
      nuevosMensajes.push({ id: String(Date.now() + 1), autor: 'medica', texto: PREGUNTAS[paso] });
    } else {
      nuevosMensajes.push({ id: String(Date.now() + 1), autor: 'medica', texto: MENSAJE_FINAL });

      // Era la última pregunta: se guardan todas las respuestas en el turno,
      // así el médico las puede ver desde su agenda.
      const respuestas = nuevosMensajes
        .filter((mensaje) => mensaje.autor === 'paciente')
        .map((mensaje) => mensaje.texto);
      guardarPreconsulta(proximoTurno.id, respuestas);
    }

    setMensajes(nuevosMensajes);
    setPaso(paso + 1);
  }

  function enviarRespuesta() {
    const texto = respuesta.trim();
    if (texto === '') return;
    responder(texto);
    setRespuesta('');
  }

  function enviarSintomas() {
    const marcados = sintomas.filter((s) => s.marcado).map((s) => s.etiqueta);
    if (marcados.length > 0) {
      responder(marcados.join(', '));
    } else {
      responder('Ninguno');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <View style={styles.encabezadoFila}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.volver}>‹</Text>
          </Pressable>
          <View style={styles.encabezadoTextos}>
            <Text style={styles.titulo}>Preconsulta</Text>
            <Text style={styles.subtitulo}>
              {proximoTurno.medico} · {formatearFecha(proximoTurno.fecha)}
            </Text>
          </View>
          <View style={styles.pasoChip}>
            <Text style={styles.pasoChipTexto}>
              {terminado ? 'Completa' : `Paso ${paso} de ${PASOS_TOTALES}`}
            </Text>
          </View>
        </View>
        <View style={styles.progresoFila}>
          {PREGUNTAS.map((pregunta, indice) => (
            <View
              key={pregunta}
              style={[styles.progresoSegmento, indice < paso && styles.progresoSegmentoLleno]}
            />
          ))}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.horaMensajes}>Hoy</Text>

        {mensajes.map((mensaje) =>
          mensaje.autor === 'medica' ? (
            <View key={mensaje.id} style={styles.filaMedica}>
              <View style={styles.avatarMedica}>
                <Text style={styles.avatarMedicaTexto}>{inicialesMedico}</Text>
              </View>
              <View style={styles.burbujaMedica}>
                <Text style={styles.burbujaMedicaTexto}>{mensaje.texto}</Text>
              </View>
            </View>
          ) : (
            <View key={mensaje.id} style={styles.filaPaciente}>
              <View style={styles.burbujaPaciente}>
                <Text style={styles.burbujaPacienteTexto}>{mensaje.texto}</Text>
              </View>
            </View>
          )
        )}

        {paso === PASO_SINTOMAS && (
          <View style={styles.chipsFila}>
            {sintomas.map((sintoma) => (
              <Pressable
                key={sintoma.id}
                style={[styles.sintomaChip, sintoma.marcado && styles.sintomaChipMarcado]}
                onPress={() => alternarSintoma(sintoma.id)}>
                <Text
                  style={[styles.sintomaChipTexto, sintoma.marcado && styles.sintomaChipTextoMarcado]}>
                  {sintoma.marcado ? '✓ ' : ''}
                  {sintoma.etiqueta}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.resumenCaja}>
          <Text style={styles.resumenTitulo}>Ya cargado en tu resumen</Text>
          {resumenCargado.map((linea) => (
            <Text key={linea} style={styles.resumenLinea}>
              • {linea}
            </Text>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView style={styles.filaInput} edges={['bottom']}>
        {terminado && (
          <Pressable style={styles.botonAncho} onPress={() => router.back()}>
            <Text style={styles.botonAnchoTexto}>Volver al inicio</Text>
          </Pressable>
        )}

        {!terminado && paso === PASO_SINTOMAS && (
          <Pressable style={styles.botonAncho} onPress={enviarSintomas}>
            <Text style={styles.botonAnchoTexto}>Enviar síntomas</Text>
          </Pressable>
        )}

        {!terminado && paso !== PASO_SINTOMAS && (
          <>
            <TextInput
              style={styles.input}
              value={respuesta}
              onChangeText={setRespuesta}
              placeholder="Escribí tu respuesta..."
              placeholderTextColor="#8A8A8A"
              onSubmitEditing={enviarRespuesta}
            />
            <Pressable style={styles.botonEnviar} onPress={enviarRespuesta}>
              <Text style={styles.botonEnviarTexto}>↑</Text>
            </Pressable>
          </>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantallaVacia: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
    padding: 20,
  },
  volverVacio: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  botonAncho: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonAnchoTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  encabezado: {
    backgroundColor: COLOR_PACIENTE,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  encabezadoFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 12,
  },
  encabezadoTextos: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitulo: {
    fontSize: 12,
    color: '#D7E6FE',
    marginTop: 1,
  },
  pasoChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pasoChipTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progresoFila: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
  },
  progresoSegmento: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progresoSegmentoLleno: {
    backgroundColor: '#FFFFFF',
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  horaMensajes: {
    fontSize: 12,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 14,
  },
  filaMedica: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    maxWidth: '85%',
  },
  avatarMedica: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1B4B8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarMedicaTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  burbujaMedica: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 12,
    flexShrink: 1,
  },
  burbujaMedicaTexto: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  filaPaciente: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  burbujaPaciente: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 14,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '85%',
  },
  burbujaPacienteTexto: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  chipsFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  sintomaChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E6FE',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sintomaChipMarcado: {
    backgroundColor: COLOR_PACIENTE,
    borderColor: COLOR_PACIENTE,
  },
  sintomaChipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  sintomaChipTextoMarcado: {
    color: '#FFFFFF',
  },
  resumenCaja: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  resumenTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  resumenLinea: {
    fontSize: 13,
    color: '#2F9E52',
    marginBottom: 3,
  },
  filaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 44,
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
});
