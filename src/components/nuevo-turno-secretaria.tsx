import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { enLicencia, horariosDelMedico, MiembroMedico, usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { horasReservadas } from '@/datos/adelantos';
import { atiendeEseDia } from '@/datos/atencion';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { detalleFecha, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';

// "Dra. Lucía Fernández" -> "Fernández"
export function apellidoDelMedico(nombreCompleto: string) {
  const palabras = nombreCompleto.split(' ');
  return palabras[palabras.length - 1];
}

type Props = {
  fecha: string;
  medicoInicial: string;
  horaInicial: string;
  onCerrar: () => void;
  // Si se llega desde la tabla de pacientes: el paciente ya está elegido y se elige el día (en la agenda el día ya viene dado).
  idPacienteInicial?: string;
  // Si lo usa un médico: solo puede darse turnos con él mismo.
  medicoFijo?: string;
  color?: string; // color del rol (por defecto, el de Secretaría)
};

const DIAS_ELEGIBLES = 28; // 4 semanas hacia adelante, igual que en el resto de la app

// Alta de un turno por Secretaría o por un médico. Se monta cuando hace falta (los valores iniciales se toman al montar).
export function NuevoTurnoSecretaria({
  fecha: fechaInicial,
  medicoInicial,
  horaInicial,
  onCerrar,
  idPacienteInicial = '',
  medicoFijo,
  color = COLOR_SECRETARIA,
}: Props) {
  const { turnos, agregarTurno } = useTurnos();
  const { ofertas } = useAdelantos();
  const { medicos } = usePersonal();
  const { consultorio } = useConsultorio();
  const { duracionTurno, nombre: nombreConsultorio } = useConfiguracion();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);

  const [fecha, setFecha] = useState(fechaInicial);
  const [medico, setMedico] = useState(medicoFijo ?? medicoInicial);
  const [hora, setHora] = useState(horaInicial);
  const [idPaciente, setIdPaciente] = useState(idPacienteInicial);
  const [busqueda, setBusqueda] = useState('');
  const elegirDia = idPacienteInicial !== '';
  const pacienteElegido = pacientes.find((p) => p.id === idPacienteInicial);
  const hoy = new Date();
  const dias: string[] = [];
  for (let i = 0; i < DIAS_ELEGIBLES; i++) {
    dias.push(fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i)));
  }

  // Médicos que atienden ese día: no de baja, no de licencia en esa fecha y con ese día entre sus días de atención.
  function atiendeEn(m: MiembroMedico, dia: string) {
    return (
      m.estado !== 'baja' &&
      !enLicencia(m, dia) &&
      atiendeEseDia(m.franjas, dia) &&
      (medicoFijo === undefined || m.nombre === medicoFijo)
    );
  }
  const medicosActivos = medicos.filter((m) => atiendeEn(m, fecha));
  // Al cambiar de día, si el médico elegido no atiende ese día se vuelve a elegir.
  function elegirFecha(nueva: string) {
    setFecha(nueva);
    setHora('');
    if (!medicos.some((m) => m.nombre === medico && atiendeEn(m, nueva))) setMedico('');
  }
  // Un horario ofrecido a la lista de espera queda reservado hasta que el paciente responda.
  const reservadas = horasReservadas(ofertas, turnos, medico, fecha);
  const horasLibres = horariosDelMedico(medicos, medico, fecha, duracionTurno).filter(
    (h) => !reservadas.includes(h) && !turnos.some((t) => t.medico === medico && t.fecha === fecha && t.hora === h && t.estado !== 'cancelado')
  );
  // Si se llegó tocando un horario fuera de los horarios del médico, se agrega para poder elegirlo.
  const horasOfrecidas = horaInicial !== '' && !horasLibres.includes(horaInicial) && medico === medicoInicial
    ? [...horasLibres, horaInicial].sort()
    : horasLibres;

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.trim().toLowerCase())
  );
  const puedeGuardar = medico !== '' && hora !== '' && idPaciente !== '';

  function guardar() {
    // Se busca en el personal (incluye a los médicos dados de alta desde la app), no en la lista fija de ejemplo.
    const datosMedico = medicos.find((m) => m.nombre === medico);
    const datosPaciente = pacientes.find((p) => p.id === idPaciente);
    if (!datosMedico || !datosPaciente || hora === '') return;
    agregarTurno({
      id: String(Date.now()),
      idPaciente: datosPaciente.id,
      medico: datosMedico.nombre,
      especialidad: datosMedico.especialidad,
      sala: datosMedico.sala,
      fecha,
      hora,
      sede: nombreConsultorio,
      cobertura: `${datosPaciente.cobertura} ${datosPaciente.plan}`.trim(),
      estado: 'pendiente', // lo carga Secretaría (o un médico): queda pendiente hasta que el paciente confirme (se le avisa unos días antes)
      instrucciones: [],
      reservadoEl: HOY,
    });
    onCerrar();
  }

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCerrar}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>
            Nuevo turno · {detalleFecha(fecha).diaSemana} {formatearFecha(fecha).slice(0, 5)}
          </Text>

          {pacienteElegido && (
            <View style={styles.pacienteFijo}>
              <Text style={styles.filaPacienteNombre}>
                {pacienteElegido.nombre} {pacienteElegido.apellido}
              </Text>
              <Text style={styles.filaPacienteDetalle}>
                DNI {pacienteElegido.dni} · {pacienteElegido.cobertura}
              </Text>
            </View>
          )}

          {elegirDia && (
            <>
              <Text style={styles.etiquetaCampo}>Día</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
                {dias.map((dia) => (
                  <Pressable
                    key={dia}
                    style={[styles.chip, dia === fecha && { backgroundColor: color, borderColor: color }]}
                    onPress={() => elegirFecha(dia)}>
                    <Text style={[styles.chipTexto, dia === fecha && styles.chipTextoActivo]}>
                      {detalleFecha(dia).diaSemana.slice(0, 3)} {detalleFecha(dia).dia} {detalleFecha(dia).mes}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.etiquetaCampo}>Médico</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
            {medicosActivos.length === 0 && <Text style={styles.sinOpciones}>Ningún médico atiende ese día.</Text>}
            {medicosActivos.map((m) => (
              <Pressable
                key={m.nombre}
                style={[styles.chip, medico === m.nombre && { backgroundColor: color, borderColor: color }]}
                onPress={() => {
                  setMedico(m.nombre);
                  setHora('');
                }}>
                <Text style={[styles.chipTexto, medico === m.nombre && styles.chipTextoActivo]}>
                  {apellidoDelMedico(m.nombre)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.etiquetaCampo}>Horario libre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
            {medico !== '' &&
              horasOfrecidas.map((h) => (
                <Pressable
                  key={h}
                  style={[styles.chip, hora === h && { backgroundColor: color, borderColor: color }]}
                  onPress={() => setHora(h)}>
                  <Text style={[styles.chipTexto, hora === h && styles.chipTextoActivo]}>{h}</Text>
                </Pressable>
              ))}
          </ScrollView>

          {!elegirDia && (
            <>
              <Text style={styles.etiquetaCampo}>Paciente</Text>
              <TextInput
                style={styles.buscador}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar por nombre"
                placeholderTextColor="#8FB9B5"
              />
              <ScrollView style={styles.listaPacientes}>
                {pacientesFiltrados.map((p) => (
                  <Pressable
                    key={p.id}
                    style={[styles.filaPaciente, idPaciente === p.id && styles.filaPacienteActiva]}
                    onPress={() => setIdPaciente(p.id)}>
                    <Text style={styles.filaPacienteNombre}>
                      {p.nombre} {p.apellido}
                    </Text>
                    <Text style={styles.filaPacienteDetalle}>{p.cobertura}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.filaBotones}>
            <Pressable style={[styles.botonSecundario, { borderColor: color }]} onPress={onCerrar}>
              <Text style={[styles.botonSecundarioTexto, { color }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!puedeGuardar}
              style={[styles.botonPrimario, { backgroundColor: color }, !puedeGuardar && styles.botonDeshabilitado]}
              onPress={guardar}>
              <Text style={styles.botonPrimarioTexto}>Asignar turno</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etiquetaCampo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 12,
    marginBottom: 6,
  },
  chipsFila: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActivo: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chipTextoActivo: {
    color: '#FFFFFF',
  },
  buscador: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#1A1A1A',
  },
  listaPacientes: {
    maxHeight: 150,
    marginTop: 8,
  },
  filaPaciente: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  filaPacienteActiva: {
    backgroundColor: FONDO_SECRETARIA,
  },
  filaPacienteNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  pacienteFijo: {
    backgroundColor: '#F4F5F7',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  sinOpciones: {
    fontSize: 12,
    color: '#8A8A8A',
    paddingVertical: 8,
  },
  filaPacienteDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_SECRETARIA,
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonDeshabilitado: {
    opacity: 0.45,
  },
});
