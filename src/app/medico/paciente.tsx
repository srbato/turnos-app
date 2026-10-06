import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedicamentos } from '@/contextos/MedicamentosContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { useRecetas } from '@/contextos/RecetasContext';
import { useSesion } from '@/contextos/SesionContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { EstadoTurno } from '@/datos/consultorio';
import { filasPreconsulta } from '@/datos/preconsulta';
import { datosParaMedico } from '@/utilidades/datos-medico';
import { fechaHoraComoDate, formatearFecha } from '@/utilidades/turnos';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_RIESGO_ALTO = '#D64545';
const COLOR_GRIS = '#8A8A8A';
const FONDO_RIESGO_ALTO = '#FBDCDC';

const COLORES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  cancelado: COLOR_GRIS,
  atendido: COLOR_GRIS,
  ausente: COLOR_RIESGO_ALTO,
};

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
  atendido: 'Atendido',
  ausente: 'No asistió',
};

// Ficha de un paciente, vista por el médico. El id del paciente llega por la URL.
export default function FichaPaciente() {
  const { id } = useLocalSearchParams();
  const { turnos } = useTurnos();
  const { medicoLogueado } = useSesion();
  const { buscarPorTurno } = usePreconsultas();
  const perfilPaciente = usePerfilPaciente();
  const { medicamentos: medicamentosPropios } = useMedicamentos();
  const { recetas } = useRecetas();
  const { pacientes, paciente, medicamentos, interacciones } = datosParaMedico(
    perfilPaciente,
    medicamentosPropios,
    recetas
  );
  // id del turno que tiene la preconsulta desplegada ('' si ninguno).
  const [idTurnoAbierto, setIdTurnoAbierto] = useState('');

  const pacienteDeLaFicha = pacientes.find((pacienteDeLaLista) => pacienteDeLaLista.id === id);

  if (!pacienteDeLaFicha) {
    return (
      <SafeAreaView style={styles.pantallaVacia}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volverVacio}>‹ Pacientes</Text>
        </Pressable>
        <Text style={styles.textoVacio}>No se encontró el paciente.</Text>
      </SafeAreaView>
    );
  }

  // El paciente de la app es el único que carga sus medicamentos.
  const esPacienteDeLaApp = pacienteDeLaFicha.id === paciente.id;
  const medicamentosRiesgo = medicamentos.filter((medicamento) => medicamento.riesgo);

  // Recetas que este médico le hizo a este paciente, de la más nueva a la más vieja.
  const recetasDelPaciente = recetas
    .filter((receta) => receta.idPaciente === pacienteDeLaFicha.id && receta.medico === medicoLogueado.nombre)
    .sort((a, b) => (a.fechaEmision < b.fechaEmision ? 1 : -1));

  // Turnos de este paciente con este médico, del más nuevo al más viejo.
  const turnosConElMedico = turnos
    .filter((turno) => turno.idPaciente === pacienteDeLaFicha.id && turno.medico === medicoLogueado.nombre)
    .sort(
      (a, b) => fechaHoraComoDate(b.fecha, b.hora).getTime() - fechaHoraComoDate(a.fecha, a.hora).getTime()
    );

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>‹ Pacientes</Text>
        </Pressable>
        <View style={styles.filaPaciente}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{pacienteDeLaFicha.iniciales}</Text>
          </View>
          <View style={styles.datosPaciente}>
            <Text style={styles.nombre}>
              {pacienteDeLaFicha.nombre} {pacienteDeLaFicha.apellido}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {pacienteDeLaFicha.email}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.contenido}>
        {pacienteDeLaFicha.alerta !== '' && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>⚠ {pacienteDeLaFicha.alerta}</Text>
          </View>
        )}

        {esPacienteDeLaApp &&
          interacciones.map((interaccion) => (
            <View key={interaccion.medicamentos.join('+')} style={styles.aviso}>
              <Text style={styles.avisoTexto}>
                ⚠ Interacción detectada: {interaccion.medicamentos.join(' + ')}. {interaccion.descripcion}
              </Text>
            </View>
          ))}

        <Text style={styles.seccion}>Datos</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Cobertura</Text>
          <Text style={styles.valor}>
            {pacienteDeLaFicha.cobertura} {pacienteDeLaFicha.plan}
          </Text>
          <Text style={styles.etiqueta}>N° de afiliado</Text>
          <Text style={styles.valor}>{pacienteDeLaFicha.numeroAfiliado}</Text>
          <Text style={styles.etiqueta}>Alergias</Text>
          <Text style={styles.valor}>{pacienteDeLaFicha.alergias}</Text>
        </View>

        <Text style={styles.seccion}>Medicación</Text>
        <View style={styles.tarjeta}>
          {!esPacienteDeLaApp && (
            <Text style={styles.valor}>No cargó su medicación en la app.</Text>
          )}
          {esPacienteDeLaApp && medicamentos.length === 0 && (
            <Text style={styles.valor}>No tiene medicamentos cargados.</Text>
          )}
          {esPacienteDeLaApp &&
            medicamentos.map((medicamento) => (
              <View key={medicamento.id} style={styles.filaMedicamento}>
                <Text style={styles.valor}>
                  {medicamento.nombre}
                  {medicamento.riesgo ? '  ⚠' : ''}
                </Text>
                <Text style={styles.detalleMedicamento}>{medicamento.detalle}</Text>
              </View>
            ))}
        </View>

        <Text style={styles.seccion}>Recetas que le hiciste</Text>
        <View style={styles.tarjeta}>
          {recetasDelPaciente.length === 0 && <Text style={styles.valor}>Todavía no le hiciste recetas.</Text>}
          {recetasDelPaciente.map((receta) => (
            <View key={receta.id} style={styles.filaMedicamento}>
              <Text style={styles.valor}>
                ℞ {receta.medicamento}
                {receta.riesgo ? '  ⚠' : ''}
              </Text>
              <Text style={styles.detalleMedicamento}>
                {receta.indicacion} · {formatearFecha(receta.fechaEmision)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.seccion}>Turnos con vos</Text>
        {turnosConElMedico.map((turno) => {
          const abierto = idTurnoAbierto === turno.id;
          const preconsulta = buscarPorTurno(turno.id);
          return (
            <View key={turno.id} style={styles.tarjeta}>
              <View style={styles.filaTurno}>
                <Text style={styles.valor}>
                  {formatearFecha(turno.fecha)} · {turno.hora} h
                </Text>
                <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[turno.estado] }]}>
                  <Text style={styles.chipEstadoTexto}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
                </View>
              </View>

              {!preconsulta && (
                <Text style={styles.detalleMedicamento}>Sin preconsulta</Text>
              )}

              {preconsulta && (
                <Pressable onPress={() => setIdTurnoAbierto(abierto ? '' : turno.id)}>
                  <Text style={styles.verPreconsulta}>
                    {abierto ? 'Ocultar preconsulta ▴' : 'Ver preconsulta ▾'}
                  </Text>
                </Pressable>
              )}

              {abierto &&
                preconsulta &&
                filasPreconsulta(preconsulta.respuestas).map((fila) => (
                  <View key={fila.titulo} style={styles.filaPreconsulta}>
                    <Text style={styles.etiqueta}>{fila.titulo}</Text>
                    <Text style={styles.valor}>{fila.valor}</Text>
                  </View>
                ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  pantallaVacia: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    padding: 20,
  },
  volverVacio: {
    fontSize: 16,
    fontWeight: '700',
    color: COLOR_MEDICO,
    marginBottom: 20,
  },
  textoVacio: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  encabezado: {
    backgroundColor: FONDO_GRAFITO,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  volver: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A9ADB4',
    marginBottom: 14,
  },
  filaPaciente: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLOR_MEDICO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  datosPaciente: {
    flex: 1,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 13,
    color: '#A9ADB4',
    marginTop: 2,
  },
  contenido: {
    padding: 20,
    paddingBottom: 32,
  },
  aviso: {
    backgroundColor: FONDO_RIESGO_ALTO,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  avisoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_RIESGO_ALTO,
  },
  seccion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_MEDICO,
    marginTop: 6,
  },
  valor: {
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 2,
  },
  filaMedicamento: {
    marginBottom: 8,
  },
  detalleMedicamento: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 4,
  },
  filaTurno: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  verPreconsulta: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_MEDICO,
    marginTop: 8,
  },
  filaPreconsulta: {
    marginTop: 4,
  },
});
