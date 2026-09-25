import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Mensaje = {
  id: string;
  autor: 'medica' | 'paciente';
  texto: string;
};

const MENSAJES_INICIALES: Mensaje[] = [
  { id: '1', autor: 'medica', texto: 'Hola Martín. Contame, ¿cuál es el motivo principal de la consulta?' },
  { id: '2', autor: 'paciente', texto: 'Dolor de cabeza hace 5 días, sobre todo a la tarde.' },
  { id: '3', autor: 'medica', texto: '¿Tuviste alguno de estos síntomas junto con el dolor?' },
];

type Sintoma = { id: string; etiqueta: string; marcado: boolean };

const SINTOMAS_INICIALES: Sintoma[] = [
  { id: 'nauseas', etiqueta: 'Náuseas', marcado: true },
  { id: 'vision', etiqueta: 'Visión borrosa', marcado: true },
  { id: 'fiebre', etiqueta: 'Fiebre', marcado: false },
  { id: 'mareos', etiqueta: 'Mareos', marcado: false },
  { id: 'ninguno', etiqueta: 'Ninguno', marcado: false },
];

const RESUMEN_CARGADO = ['Medicación: Enalapril 10 mg, Ibuprofeno 400 mg', 'Alergias: penicilina'];

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';

const PASO_ACTUAL = 3;
const PASOS_TOTALES = 5;
const INICIALES_MEDICO = 'LF';

export default function Preconsulta() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(MENSAJES_INICIALES);
  const [sintomas, setSintomas] = useState<Sintoma[]>(SINTOMAS_INICIALES);
  const [respuesta, setRespuesta] = useState('');

  function alternarSintoma(id: string) {
    setSintomas(sintomas.map((s) => (s.id === id ? { ...s, marcado: !s.marcado } : s)));
  }

  function enviarRespuesta() {
    const texto = respuesta.trim();
    if (texto === '') return;
    setMensajes([...mensajes, { id: String(Date.now()), autor: 'paciente', texto }]);
    setRespuesta('');
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoFila}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.volver}>‹</Text>
          </Pressable>
          <View style={styles.encabezadoTextos}>
            <Text style={styles.titulo}>Preconsulta</Text>
            <Text style={styles.subtitulo}>Dra. Lucía Fernández · mar 25/09</Text>
          </View>
          <View style={styles.pasoChip}>
            <Text style={styles.pasoChipTexto}>
              Paso {PASO_ACTUAL} de {PASOS_TOTALES}
            </Text>
          </View>
        </View>
        <View style={styles.progresoFila}>
          {Array.from({ length: PASOS_TOTALES }).map((_, indice) => (
            <View
              key={indice}
              style={[styles.progresoSegmento, indice < PASO_ACTUAL && styles.progresoSegmentoLleno]}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.horaMensajes}>Hoy · 09:38</Text>

        {mensajes.map((mensaje) =>
          mensaje.autor === 'medica' ? (
            <View key={mensaje.id} style={styles.filaMedica}>
              <View style={styles.avatarMedica}>
                <Text style={styles.avatarMedicaTexto}>{INICIALES_MEDICO}</Text>
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

        <View style={styles.resumenCaja}>
          <Text style={styles.resumenTitulo}>Ya cargado en tu resumen</Text>
          {RESUMEN_CARGADO.map((linea) => (
            <Text key={linea} style={styles.resumenLinea}>
              • {linea}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.filaInput}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
