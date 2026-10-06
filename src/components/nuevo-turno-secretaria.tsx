import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { horasReservadas } from '@/datos/adelantos';
import { HORAS_BASE } from '@/datos/atencion';
import { HOY, MEDICOS, NOMBRE_CONSULTORIO, PACIENTES } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

// Los horarios de la grilla viven en datos/atencion.ts; se re-exportan para quien ya los importaba de acá.
export { HORAS_BASE };

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
};

// Alta de un turno por Secretaría. Se monta cuando hace falta (los valores iniciales se toman al montar).
export function NuevoTurnoSecretaria({ fecha, medicoInicial, horaInicial, onCerrar }: Props) {
  const { turnos, agregarTurno } = useTurnos();
  const { ofertas } = useAdelantos();
  const { medicos } = usePersonal();
  const pacientes = pacientesConPerfil(usePerfilPaciente());

  const [medico, setMedico] = useState(medicoInicial);
  const [hora, setHora] = useState(horaInicial);
  const [idPaciente, setIdPaciente] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const medicosActivos = medicos.filter((m) => m.estado === 'activo');
  // Un horario ofrecido a la lista de espera queda reservado hasta que el paciente responda.
  const reservadas = horasReservadas(ofertas, turnos, medico, fecha);
  const horasLibres = HORAS_BASE.filter(
    (h) => !reservadas.includes(h) && !turnos.some((t) => t.medico === medico && t.fecha === fecha && t.hora === h && t.estado !== 'cancelado')
  );
  // Si se llegó tocando un horario fuera de la grilla base, se agrega para poder elegirlo.
  const horasOfrecidas = horaInicial !== '' && !horasLibres.includes(horaInicial) && medico === medicoInicial
    ? [...horasLibres, horaInicial].sort()
    : horasLibres;

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.trim().toLowerCase())
  );
  const puedeGuardar = medico !== '' && hora !== '' && idPaciente !== '';

  function guardar() {
    const datosMedico = MEDICOS.find((m) => m.nombre === medico);
    const datosPaciente = PACIENTES.find((p) => p.id === idPaciente);
    if (!datosMedico || !datosPaciente || hora === '') return;
    agregarTurno({
      id: String(Date.now()),
      idPaciente: datosPaciente.id,
      medico: datosMedico.nombre,
      especialidad: datosMedico.especialidad,
      consultorio: datosMedico.consultorio,
      fecha,
      hora,
      sede: NOMBRE_CONSULTORIO,
      cobertura: `${datosPaciente.cobertura} ${datosPaciente.plan}`.trim(),
      estado: 'confirmado', // lo carga Secretaría, queda confirmado
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

          <Text style={styles.etiquetaCampo}>Médico</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
            {medicosActivos.map((m) => (
              <Pressable
                key={m.nombre}
                style={[styles.chip, medico === m.nombre && styles.chipActivo]}
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
                <Pressable key={h} style={[styles.chip, hora === h && styles.chipActivo]} onPress={() => setHora(h)}>
                  <Text style={[styles.chipTexto, hora === h && styles.chipTextoActivo]}>{h}</Text>
                </Pressable>
              ))}
          </ScrollView>

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

          <View style={styles.filaBotones}>
            <Pressable style={styles.botonSecundario} onPress={onCerrar}>
              <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!puedeGuardar}
              style={[styles.botonPrimario, !puedeGuardar && styles.botonDeshabilitado]}
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
    backgroundColor: '#8FC4BF',
  },
});
