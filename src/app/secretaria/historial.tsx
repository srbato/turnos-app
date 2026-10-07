import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { COLOR_CANCELADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { EstadoTurno, HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, formatearFecha } from '@/utilidades/turnos';
import { sinRepetidos } from '@/utilidades/listas';

type Filtro = 'todos' | EstadoTurno;

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'atendido', etiqueta: 'Atendidos' },
  { id: 'ausente', etiqueta: 'No asistió' },
  { id: 'cancelado', etiqueta: 'Cancelados' },
];

// "Dra. Lucía Fernández" -> "Dra. Fernández"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Historial de turnos del consultorio: todo lo que ya pasó (atendidos, ausentes) y todo lo que se canceló, con el
// motivo cuando lo canceló el sistema o Secretaría por riesgo de inasistencia. Los turnos de hoy en adelante que siguen
// vigentes están en las agendas, no acá.
export default function HistorialTurnos() {
  const { turnos } = useTurnos();
  const { consultorio } = useConsultorio();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');

  function nombreDelPaciente(idPaciente: string) {
    const paciente = pacientes.find((p) => p.id === idPaciente);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
  }

  // Los horarios libres (turnos sin paciente) no son parte del historial.
  const delHistorial = turnos.filter(
    (turno) =>
      turno.idPaciente !== '' &&
      (turno.fecha < HOY || turno.estado === 'atendido' || turno.estado === 'ausente' || turno.estado === 'cancelado')
  );
  const texto = busqueda.trim().toLowerCase();
  const visibles = delHistorial
    .filter((turno) => filtro === 'todos' || turno.estado === filtro)
    .filter((turno) => `${nombreDelPaciente(turno.idPaciente)} ${turno.medico}`.toLowerCase().includes(texto))
    .sort((a, b) => (`${a.fecha} ${a.hora}` < `${b.fecha} ${b.hora}` ? 1 : -1)); // el más nuevo primero

  // Agrupados por día.
  const dias = sinRepetidos(visibles.map((turno) => turno.fecha));
  const cantidad = (estado: EstadoTurno) => delHistorial.filter((turno) => turno.estado === estado).length;

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/secretaria/alertas'))} hitSlop={10}>
          <Text style={styles.volver}>‹ Alertas</Text>
        </Pressable>
        <Text style={styles.titulo}>Historial de turnos</Text>
        <Text style={styles.subtitulo}>
          Los turnos que ya pasaron y los que se cancelaron, con el motivo. Tocá uno para ver la ficha del paciente.
        </Text>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLORES_ESTADO.atendido }]}>{cantidad('atendido')}</Text>
            <Text style={styles.resumenTexto}>Atendidos</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLORES_ESTADO.ausente }]}>{cantidad('ausente')}</Text>
            <Text style={styles.resumenTexto}>No asistieron</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLOR_CANCELADO }]}>{cantidad('cancelado')}</Text>
            <Text style={styles.resumenTexto}>Cancelados</Text>
          </View>
        </View>

        <TextInput
          style={styles.buscador}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por paciente o médico"
          placeholderTextColor="#8FB9B5"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
          {FILTROS.map((opcion) => (
            <Pressable
              key={opcion.id}
              style={[styles.chip, filtro === opcion.id && styles.chipActivo]}
              onPress={() => setFiltro(opcion.id)}>
              <Text style={[styles.chipTexto, filtro === opcion.id && styles.chipTextoActivo]}>{opcion.etiqueta}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibles.length === 0 && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>No hay turnos en el historial con ese filtro.</Text>
          </View>
        )}

        {dias.map((dia) => (
          <View key={dia}>
            <Text style={styles.diaTitulo}>
              {detalleFecha(dia).diaSemana} {formatearFecha(dia)}
            </Text>
            {visibles
              .filter((turno) => turno.fecha === dia)
              .map((turno) => {
                const color = COLORES_ESTADO[turno.estado];
                return (
                  <Pressable
                    key={turno.id}
                    style={styles.tarjeta}
                    onPress={() => router.push({ pathname: '/secretaria/paciente', params: { id: turno.idPaciente } })}>
                    <Text style={styles.hora}>{turno.hora}</Text>
                    <View style={[styles.barra, { backgroundColor: color }]} />
                    <View style={styles.tarjetaTextos}>
                      <Text style={styles.paciente} numberOfLines={1}>
                        {nombreDelPaciente(turno.idPaciente)}
                      </Text>
                      <Text style={styles.detalle} numberOfLines={1}>
                        {medicoCorto(turno.medico)} · {turno.especialidad}
                      </Text>
                      {turno.motivoCancelacion !== undefined && (
                        <Text style={styles.motivo}>{turno.motivoCancelacion}</Text>
                      )}
                    </View>
                    <Text style={[styles.estado, { color }]}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
                  </Pressable>
                );
              })}
          </View>
        ))}
      </ScrollView>

      <MenuSecretaria activa="alertas" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_SECRETARIA,
  },
  contenido: {
    padding: 18,
    paddingBottom: 24,
  },
  volver: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  subtitulo: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 4,
    marginBottom: 14,
  },
  resumen: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  resumenItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 20,
    fontWeight: '700',
  },
  resumenTexto: {
    fontSize: 11,
    color: '#5A5A5A',
  },
  buscador: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  chipsFila: {
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    backgroundColor: '#FFFFFF',
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
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  diaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 12,
    marginBottom: 8,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  hora: {
    width: 46,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  barra: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  tarjetaTextos: {
    flex: 1,
    marginRight: 8,
  },
  paciente: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  motivo: {
    fontSize: 11,
    color: COLOR_CANCELADO,
    fontWeight: '600',
    marginTop: 4,
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
  },
});
