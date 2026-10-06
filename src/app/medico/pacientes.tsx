import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuMedico } from '@/components/menu-medico';
import { NuevoTurnoSecretaria } from '@/components/nuevo-turno-secretaria';
import { TablaPacientes } from '@/components/tabla-pacientes';
import { useMedicamentos } from '@/contextos/MedicamentosContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useRecetas } from '@/contextos/RecetasContext';
import { useSesion } from '@/contextos/SesionContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { HOY } from '@/datos/consultorio';
import { datosParaMedico } from '@/utilidades/datos-medico';
import { buscarProximoTurno, detalleFecha, fechaHoraComoDate } from '@/utilidades/turnos';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_RIESGO_ALTO = '#D64545';
const FONDO_RIESGO_ALTO = '#FBDCDC';

export default function PacientesDelMedico() {
  const { turnos } = useTurnos();
  const { medicoLogueado } = useSesion();
  const perfilPaciente = usePerfilPaciente();
  const { medicamentos: medicamentosPropios } = useMedicamentos();
  const { recetas } = useRecetas();
  const { consultorio } = useConsultorio();
  const { pacientes } = datosParaMedico(perfilPaciente, consultorio.pacientes, medicamentosPropios, recetas);
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState<'mios' | 'todos'>('mios'); // mis pacientes (tarjetas) o todos los del consultorio (tabla)
  const [idPacienteElegido, setIdPacienteElegido] = useState('');

  // Se calcula en cada render: no hace falta useEffect para esto.
  // Los pacientes del médico son los que tienen (o tuvieron) algún turno con él.
  const turnosDelMedico = turnos.filter((turno) => turno.medico === medicoLogueado.nombre);
  const pacientesDelMedico = pacientes.filter((paciente) =>
    turnosDelMedico.some((turno) => turno.idPaciente === paciente.id)
  );
  const pacientesFiltrados = pacientesDelMedico.filter((paciente) =>
    `${paciente.nombre} ${paciente.apellido}`.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <Text style={styles.subtituloEncabezado}>{medicoLogueado.nombre}</Text>
        <Text style={styles.titulo}>{vista === 'mios' ? 'Tus pacientes' : 'Pacientes del consultorio'}</Text>
        <View style={styles.vistaFila}>
          <Pressable style={[styles.vistaChip, vista === 'mios' && styles.vistaChipActivo]} onPress={() => setVista('mios')}>
            <Text style={[styles.vistaTexto, vista === 'mios' && styles.vistaTextoActivo]}>Mis pacientes</Text>
          </Pressable>
          <Pressable style={[styles.vistaChip, vista === 'todos' && styles.vistaChipActivo]} onPress={() => setVista('todos')}>
            <Text style={[styles.vistaTexto, vista === 'todos' && styles.vistaTextoActivo]}>Todos</Text>
          </Pressable>
        </View>
        {vista === 'mios' && (
          <TextInput
            style={styles.buscador}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#8A8E95"
          />
        )}
      </SafeAreaView>

      {vista === 'todos' ? (
        <TablaPacientes
          pacientes={pacientes}
          color={COLOR_MEDICO}
          onElegir={(paciente) => setIdPacienteElegido(paciente.id)}
          onVerFicha={(paciente) => router.push(`/medico/paciente?id=${paciente.id}`)}
        />
      ) : (
        <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
          <Text style={styles.cantidad}>
            {pacientesFiltrados.length} paciente{pacientesFiltrados.length === 1 ? '' : 's'}
          </Text>

          {pacientesFiltrados.length === 0 && (
            <View style={styles.estadoVacio}>
              <Text style={styles.estadoVacioTexto}>
                {pacientesDelMedico.length === 0
                  ? 'Todavía no tenés pacientes con turnos.'
                  : 'No hay pacientes con ese nombre.'}
              </Text>
            </View>
          )}

          {pacientesFiltrados.map((paciente) => {
            const turnosDelPaciente = turnosDelMedico.filter((turno) => turno.idPaciente === paciente.id);
            const proximoTurno = buscarProximoTurno(turnosDelPaciente);
            // Si no tiene un turno próximo, se muestra el último que tuvo.
            const ultimoTurno = turnosDelPaciente
              .filter((turno) => turno.estado !== 'cancelado')
              .sort(
                (a, b) =>
                  fechaHoraComoDate(b.fecha, b.hora).getTime() - fechaHoraComoDate(a.fecha, a.hora).getTime()
              )[0];

            let textoTurno = 'Sin turnos';
            if (proximoTurno) {
              const fecha = detalleFecha(proximoTurno.fecha);
              textoTurno = `Próximo: ${fecha.diaSemana} ${fecha.dia} · ${proximoTurno.hora} h`;
            } else if (ultimoTurno) {
              const fecha = detalleFecha(ultimoTurno.fecha);
              textoTurno = `Último: ${fecha.diaSemana} ${fecha.dia} · ${ultimoTurno.hora} h`;
            }

            return (
              <Pressable
                key={paciente.id}
                style={styles.tarjeta}
                onPress={() => router.push(`/medico/paciente?id=${paciente.id}`)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>{paciente.iniciales}</Text>
                </View>
                <View style={styles.datos}>
                  <Text style={styles.nombre}>
                    {paciente.nombre} {paciente.apellido}
                  </Text>
                  <Text style={styles.detalle}>{paciente.cobertura}</Text>
                  <Text style={styles.detalle}>{textoTurno}</Text>
                </View>
                {paciente.alerta !== '' && (
                  <View style={styles.chipRiesgo}>
                    <Text style={styles.chipRiesgoTexto}>Riesgo</Text>
                  </View>
                )}
                <Text style={styles.flecha}>›</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {idPacienteElegido !== '' && (
        <NuevoTurnoSecretaria
          fecha={HOY}
          medicoInicial={medicoLogueado.nombre}
          horaInicial=""
          idPacienteInicial={idPacienteElegido}
          medicoFijo={medicoLogueado.nombre}
          color={COLOR_MEDICO}
          onCerrar={() => setIdPacienteElegido('')}
        />
      )}

      <MenuMedico activa="pacientes" />
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
    paddingBottom: 20,
  },
  subtituloEncabezado: {
    fontSize: 13,
    color: '#A9ADB4',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 14,
  },
  vistaFila: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  vistaChip: {
    borderWidth: 1,
    borderColor: '#4A4F58',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  vistaChipActivo: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  vistaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A9ADB4',
  },
  vistaTextoActivo: {
    color: '#1E2126',
  },
  buscador: {
    backgroundColor: '#2B2F36',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
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
    color: '#8A8A8A',
    marginBottom: 10,
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR_MEDICO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipRiesgo: {
    backgroundColor: FONDO_RIESGO_ALTO,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  chipRiesgoTexto: {
    color: COLOR_RIESGO_ALTO,
    fontSize: 11,
    fontWeight: '700',
  },
  flecha: {
    fontSize: 20,
    color: '#B0B3B8',
  },
});
