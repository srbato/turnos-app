import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetalleOfertaSecretaria } from '@/components/detalle-oferta-secretaria';
import { DetalleTurnoSecretaria } from '@/components/detalle-turno-secretaria';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { apellidoDelMedico, NuevoTurnoSecretaria } from '@/components/nuevo-turno-secretaria';
import { COLOR_CANCELADO, COLOR_PENDIENTE, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { ofertasVigentes } from '@/datos/adelantos';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';

const COLOR_AUSENTE = '#B03A3A';
const DIAS_VISIBLES = 28; // 4 semanas hacia adelante

// Los próximos días a partir de hoy.
function diasDeLaSemana() {
  const hoy = new Date();
  return Array.from({ length: DIAS_VISIBLES }, (_, i) =>
    fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i))
  );
}

// Inicio de Secretaría: los turnos del día en orden de horario, con su médico y su estado.
export default function TurnosDelDia() {
  const { turnos } = useTurnos();
  const { medicos } = usePersonal();
  const { ofertas } = useAdelantos();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo } = useConfiguracion();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);

  const [diaElegido, setDiaElegido] = useState(HOY);
  const [medicoFiltro, setMedicoFiltro] = useState(''); // '' = todos
  const [idTurnoSeleccionado, setIdTurnoSeleccionado] = useState('');
  const [idOfertaSeleccionada, setIdOfertaSeleccionada] = useState('');
  const [nuevoAbierto, setNuevoAbierto] = useState(false);

  const turnosDelDia = turnos
    .filter((turno) => turno.fecha === diaElegido && turno.estado !== 'cancelado')
    .sort((a, b) => (a.hora < b.hora ? -1 : 1));
  const visibles = turnosDelDia.filter((turno) => medicoFiltro === '' || turno.medico === medicoFiltro);
  // Horarios ofrecidos a la lista de espera ese día: están reservados hasta que el paciente responda.
  const ofrecidos = ofertasVigentes(ofertas, turnos).filter(
    (oferta) => oferta.horario.fecha === diaElegido && (medicoFiltro === '' || oferta.horario.medico === medicoFiltro)
  );
  // Todo junto, en orden de horario.
  const items = [
    ...visibles.map((turno) => ({ tipo: 'turno' as const, hora: turno.hora, turno })),
    ...ofrecidos.map((oferta) => ({ tipo: 'oferta' as const, hora: oferta.horario.hora, oferta })),
  ].sort((a, b) => (a.hora < b.hora ? -1 : 1));

  const sinConfirmar = turnosDelDia.filter((turno) => turno.estado === 'pendiente').length;
  const medicosDelDia = medicos.filter(
    (medico) =>
      turnosDelDia.some((turno) => turno.medico === medico.nombre) ||
      ofertasVigentes(ofertas, turnos).some(
        (oferta) => oferta.horario.fecha === diaElegido && oferta.horario.medico === medico.nombre
      )
  );

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezadoFila}>
          <View>
            <Text style={styles.fecha}>
              {detalleFecha(diaElegido).diaSemana} {formatearFecha(diaElegido).slice(0, 5)}
            </Text>
            <Text style={styles.titulo}>{diaElegido === HOY ? 'Turnos de hoy' : 'Turnos del día'}</Text>
          </View>
          <Pressable style={styles.botonMas} onPress={() => setNuevoAbierto(true)}>
            <Text style={styles.botonMasTexto}>+</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semanaFila}>
          {diasDeLaSemana().map((dia) => {
            const seleccionado = dia === diaElegido;
            const cantidad = turnos.filter((t) => t.fecha === dia && t.estado !== 'cancelado').length;
            return (
              <Pressable
                key={dia}
                style={[styles.diaCaja, seleccionado && styles.diaCajaSeleccionada]}
                onPress={() => setDiaElegido(dia)}>
                <Text style={[styles.diaEtiqueta, seleccionado && styles.diaTextoSeleccionado]}>
                  {dia === HOY ? 'HOY' : detalleFecha(dia).diaSemana.slice(0, 3).toUpperCase()}
                </Text>
                <Text style={[styles.diaNumero, seleccionado && styles.diaTextoSeleccionado]}>{detalleFecha(dia).dia}</Text>
                <Text style={[styles.diaMes, seleccionado && styles.diaTextoSeleccionado]}>{detalleFecha(dia).mes}</Text>
                <Text style={[styles.diaCantidad, seleccionado && styles.diaTextoSeleccionado]}>{cantidad} t.</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumero}>{turnosDelDia.length}</Text>
            <Text style={styles.resumenTexto}>Turnos</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLOR_PENDIENTE }]}>{sinConfirmar}</Text>
            <Text style={styles.resumenTexto}>Sin confirmar</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenNumero}>{medicosDelDia.length}</Text>
            <Text style={styles.resumenTexto}>Médicos</Text>
          </View>
        </View>

        <View style={styles.botonesFila}>
          <Pressable style={styles.botonComparar} onPress={() => router.push('/secretaria/comparar')}>
            <Text style={styles.botonCompararTexto}>▦  Comparar horarios</Text>
          </Pressable>
          <Pressable style={styles.botonComparar} onPress={() => router.push('/secretaria/pacientes')}>
            <Text style={styles.botonCompararTexto}>◍  Pacientes</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
          <Pressable style={[styles.chip, medicoFiltro === '' && styles.chipActivo]} onPress={() => setMedicoFiltro('')}>
            <Text style={[styles.chipTexto, medicoFiltro === '' && styles.chipTextoActivo]}>Todos</Text>
          </Pressable>
          {medicos.filter((medico) => medico.estado !== 'baja').map((medico) => (
            <Pressable
              key={medico.nombre}
              style={[styles.chip, medicoFiltro === medico.nombre && styles.chipActivo]}
              onPress={() => setMedicoFiltro(medico.nombre)}>
              <Text style={[styles.chipTexto, medicoFiltro === medico.nombre && styles.chipTextoActivo]}>
                {apellidoDelMedico(medico.nombre)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {items.length === 0 && (
          <View style={styles.vacio}>
            <Text style={styles.vacioTexto}>No hay turnos para este día.</Text>
          </View>
        )}

        {items.map((item) => {
          if (item.tipo === 'oferta') {
            const { oferta } = item;
            const turnoOfrecido = turnos.find((t) => t.id === oferta.idTurno);
            const pacienteOfrecido = pacientes.find((p) => p.id === turnoOfrecido?.idPaciente);
            return (
              <Pressable
                key={oferta.id}
                style={[styles.tarjeta, styles.tarjetaOfrecida]}
                onPress={() => setIdOfertaSeleccionada(oferta.id)}>
                <Text style={styles.hora}>{oferta.horario.hora}</Text>
                <View style={[styles.barra, { backgroundColor: COLOR_PENDIENTE }]} />
                <View style={styles.tarjetaTextos}>
                  <Text style={styles.paciente} numberOfLines={1}>
                    {pacienteOfrecido ? `${pacienteOfrecido.nombre} ${pacienteOfrecido.apellido}` : 'Paciente'}
                  </Text>
                  <Text style={styles.detalle} numberOfLines={1}>
                    Horario ofrecido · {oferta.horario.medico}
                  </Text>
                  <Text style={styles.detalle} numberOfLines={1}>
                    {oferta.horario.especialidad} · {oferta.horario.sala}
                  </Text>
                </View>
                <View style={styles.tarjetaEstado}>
                  <Text style={[styles.estado, { color: '#A66F00' }]}>Ofrecido</Text>
                  <Text style={styles.riesgo}>Esperando respuesta</Text>
                </View>
              </Pressable>
            );
          }
          const { turno } = item;
          const paciente = pacientes.find((p) => p.id === turno.idPaciente);
          const riesgo = paciente ? evaluarRiesgo(paciente, turnos, reglasRiesgo) : undefined;
          const riesgoAlto = riesgo?.nivel === 'alto' && (turno.estado === 'pendiente' || turno.estado === 'confirmado');
          const color = turno.estado === 'ausente' ? COLOR_AUSENTE : COLORES_ESTADO[turno.estado];
          return (
            <Pressable key={turno.id} style={styles.tarjeta} onPress={() => setIdTurnoSeleccionado(turno.id)}>
              <Text style={styles.hora}>{turno.hora}</Text>
              <View style={[styles.barra, { backgroundColor: color }]} />
              <View style={styles.tarjetaTextos}>
                <Text style={styles.paciente} numberOfLines={1}>
                  {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}
                </Text>
                <Text style={styles.detalle} numberOfLines={1}>
                  {turno.medico}
                </Text>
                <Text style={styles.detalle} numberOfLines={1}>
                  {turno.especialidad} · {turno.sala}
                </Text>
              </View>
              <View style={styles.tarjetaEstado}>
                <Text style={[styles.estado, { color }]}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
                {riesgoAlto && <Text style={styles.riesgo}>Riesgo alto</Text>}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <MenuSecretaria activa="agendas" />

      <DetalleOfertaSecretaria idOferta={idOfertaSeleccionada} onCerrar={() => setIdOfertaSeleccionada('')} />
      <DetalleTurnoSecretaria idTurno={idTurnoSeleccionado} onCerrar={() => setIdTurnoSeleccionado('')} />

      {nuevoAbierto && (
        <NuevoTurnoSecretaria
          fecha={diaElegido}
          medicoInicial={medicoFiltro}
          horaInicial=""
          onCerrar={() => setNuevoAbierto(false)}
        />
      )}
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
  encabezadoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fecha: {
    fontSize: 13,
    color: '#5A5A5A',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
    marginTop: 2,
  },
  botonMas: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLOR_SECRETARIA,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonMasTexto: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '600',
  },
  semanaFila: {
    gap: 8,
    paddingBottom: 12,
  },
  diaCaja: {
    width: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  diaCajaSeleccionada: {
    backgroundColor: COLOR_SECRETARIA,
  },
  diaEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  diaNumero: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  diaMes: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  diaCantidad: {
    fontSize: 10,
    color: '#5A5A5A',
  },
  diaTextoSeleccionado: {
    color: '#FFFFFF',
  },
  resumen: {
    flexDirection: 'row',
    gap: 10,
  },
  resumenItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 22,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  resumenTexto: {
    fontSize: 11,
    color: '#5A5A5A',
    marginTop: 1,
  },
  botonesFila: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  botonComparar: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCompararTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  chipsFila: {
    gap: 8,
    paddingBottom: 12,
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
  vacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  tarjetaOfrecida: {
    backgroundColor: '#FDF4DE',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLOR_PENDIENTE,
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
    width: 44,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  barra: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 10,
  },
  tarjetaTextos: {
    flex: 1,
  },
  paciente: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  tarjetaEstado: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
  },
  riesgo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_CANCELADO,
    marginTop: 2,
  },
});
