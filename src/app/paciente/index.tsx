import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPaciente } from '@/components/avatar-paciente';
import { MenuPaciente } from '@/components/menu-paciente';
import { OfertasAdelanto } from '@/components/ofertas-adelanto';
import { DetalleEstudioModal } from '@/components/modal-estudio';
import { CancelarTurnoModal, DetalleTurnoModal } from '@/components/modales-turno';
import {
  COLOR_CANCELADO,
  COLOR_PACIENTE,
  COLOR_PENDIENTE,
  FONDO_PACIENTE,
} from '@/constantes/colores';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { listaDeEspera, puestoEnLista } from '@/datos/adelantos';
import { ESTUDIOS, type Estudio } from '@/datos/estudios';
import { useTurnos, type Turno } from '@/contextos/TurnosContext';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, fechaHoraComoDate } from '@/utilidades/turnos';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';

const ESTUDIOS_PENDIENTES = ESTUDIOS.filter((estudio) => estudio.estado === 'pendiente');

const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para chips y fondos suaves

function saludoSegunHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buen día';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HubPaciente() {
  const { turnos, misTurnos } = useTurnos();
  const { nombre } = usePerfilPaciente();
  // Sus turnos anotados en la lista de espera para adelantarlos, con su puesto (1 = el que hace más tiempo espera).
  const esperas = listaDeEspera(misTurnos).map((turno) => ({ turno, ...puestoEnLista(turno, turnos) }));
  const { buscarPorTurno } = usePreconsultas();
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);
  // Turno pendiente de confirmar su cancelación; lo comparten el botón del home y el del detalle.
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);
  const [estudioSeleccionado, setEstudioSeleccionado] = useState<Estudio | null>(null);

  // Se calcula en cada render: no hace falta useEffect para esto.
  const ahora = new Date();
  const proximoTurno = [...misTurnos]
    .filter((turno) => turno.estado !== 'cancelado' && turno.estado !== 'atendido' && turno.estado !== 'ausente' && fechaHoraComoDate(turno.fecha, turno.hora) >= ahora)
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    )[0];

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.saludo}>{saludoSegunHora()},</Text>
            <Text style={styles.nombre}>{nombre.split(' ')[0]}</Text>
          </View>
          <Pressable onPress={() => router.navigate('/perfil?rol=paciente')}>
            <AvatarPaciente tamano={48} colorFondo={COLOR_PACIENTE} colorTexto="#FFFFFF" />
          </Pressable>
        </View>

        {/* Propuestas de Secretaría para adelantar un turno (si hay alguna). */}
        <OfertasAdelanto />

        {!proximoTurno ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>
              Todavía no tenés turnos. Cuando saques uno, lo vas a ver acá.
            </Text>
            <Pressable
              style={styles.botonNuevoTurno}
              onPress={() => router.push('/paciente/sacar-turno')}>
              <Text style={styles.botonPrimarioTexto}>Sacar un nuevo turno</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tarjetaProximo}>
            <View style={styles.proximoEncabezado}>
              <Text style={styles.proximoEtiqueta}>Próximo turno</Text>
              <View
                style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[proximoTurno.estado] }]}>
                <Text style={styles.chipEstadoTexto}>{ETIQUETAS_ESTADO[proximoTurno.estado]}</Text>
              </View>
            </View>

            <View style={styles.proximoCuerpo}>
              <View style={styles.fechaCaja}>
                <Text style={styles.fechaDia}>{detalleFecha(proximoTurno.fecha).dia}</Text>
                <Text style={styles.fechaMes}>{detalleFecha(proximoTurno.fecha).mes}</Text>
              </View>
              <View style={styles.proximoDatos}>
                <Text style={styles.proximoMedico}>{proximoTurno.medico}</Text>
                <Text style={styles.proximoEspecialidad}>
                  {proximoTurno.especialidad} · {proximoTurno.consultorio}
                </Text>
                <Text style={styles.proximoHora}>
                  {detalleFecha(proximoTurno.fecha).diaSemana} {proximoTurno.hora} h
                </Text>
              </View>
            </View>

            {proximoTurno.instrucciones.length > 0 && (
              <View style={styles.avisoCaja}>
                {proximoTurno.instrucciones.map((instruccion) => (
                  <Text key={instruccion} style={styles.avisoTexto}>
                    • {instruccion}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.proximoBotones}>
              <Pressable
                style={styles.botonPrimario}
                onPress={() => setTurnoSeleccionado(proximoTurno)}>
                <Text style={styles.botonPrimarioTexto}>Ver detalle</Text>
              </Pressable>
              <Pressable
                style={styles.botonSecundario}
                onPress={() => router.push({ pathname: '/paciente/reprogramar/[id]', params: { id: proximoTurno.id } })}>
                <Text style={styles.botonSecundarioTexto}>Reprogramar</Text>
              </Pressable>
            </View>
            <Pressable style={styles.botonCancelar} onPress={() => setTurnoACancelar(proximoTurno)}>
              <Text style={styles.botonCancelarTexto}>Cancelar turno</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.botonMisTurnos} onPress={() => router.push('/paciente/mis-turnos' as Href)}>
          <Text style={styles.botonMisTurnosTexto}>Mis turnos</Text>
        </Pressable>

        {ESTUDIOS_PENDIENTES.length > 0 && (
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaEncabezado}>
              <Text style={styles.tarjetaTitulo}>Mis estudios</Text>
              <Pressable onPress={() => router.push('/paciente/estudios' as Href)}>
                <Text style={styles.verTodos}>Ver todos</Text>
              </Pressable>
            </View>
            {ESTUDIOS_PENDIENTES.map((estudio, indice) => (
              <Pressable
                key={estudio.id}
                onPress={() => setEstudioSeleccionado(estudio)}
                style={[
                  styles.filaEstudio,
                  indice < ESTUDIOS_PENDIENTES.length - 1 && styles.filaEstudioConBorde,
                ]}>
                <View style={styles.tipoEstudio}>
                  <Text style={styles.tipoEstudioTexto}>{estudio.tipo}</Text>
                </View>
                <View style={styles.estudioDatos}>
                  <Text style={styles.estudioTitulo}>{estudio.titulo}</Text>
                  <Text style={styles.estudioDetalle}>{estudio.detalle}</Text>
                </View>
                <View style={styles.chipPendiente}>
                  <Text style={styles.chipPendienteTexto}>Pendiente</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {esperas.map(({ turno, posicion, total }) => (
          <View key={turno.id} style={styles.tarjetaEspera}>
            <View style={styles.esperaNumero}>
              <Text style={styles.esperaNumeroTexto}>{posicion}°</Text>
            </View>
            <View style={styles.esperaDatos}>
              <Text style={styles.esperaTitulo}>
                Lista de espera: {posicion}° de {total}
              </Text>
              <Text style={styles.esperaSubtitulo}>
                {turno.medico} · te ofrecemos un horario antes si se libera
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.accesos}>
          <Pressable
            style={[styles.accesoPreconsulta, !proximoTurno && styles.accesoDeshabilitado]}
            disabled={!proximoTurno}
            onPress={() =>
              proximoTurno &&
              router.push({ pathname: '/paciente/preconsulta', params: { turnoId: proximoTurno.id } })
            }>
            <Text style={styles.accesoPreconsultaTitulo}>Preconsulta</Text>
            <Text style={styles.accesoPreconsultaSubtitulo}>
              {!proximoTurno
                ? 'Necesitás un turno próximo'
                : buscarPorTurno(proximoTurno.id)
                  ? 'Enviada al médico ✓'
                  : 'Opcional · contale a tu médico'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.accesoMedicacion}
            onPress={() => router.push('/paciente/medicamentos')}>
            <Text style={styles.accesoMedicacionTitulo}>Mis medicamentos</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DetalleTurnoModal
        turno={turnoSeleccionado}
        onCerrar={() => setTurnoSeleccionado(null)}
        onCancelar={setTurnoACancelar}
      />
      <CancelarTurnoModal turno={turnoACancelar} onCerrar={() => setTurnoACancelar(null)} />
      <DetalleEstudioModal
        estudio={estudioSeleccionado}
        onCerrar={() => setEstudioSeleccionado(null)}
      />

      <MenuPaciente activa="inicio" />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saludo: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  nombre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tarjetaProximo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  proximoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  proximoEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proximoCuerpo: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  fechaCaja: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fechaDia: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  proximoDatos: {
    flex: 1,
    justifyContent: 'center',
  },
  proximoMedico: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  proximoEspecialidad: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 2,
  },
  proximoHora: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
    marginTop: 4,
  },
  avisoCaja: {
    backgroundColor: FONDO_PENDIENTE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  avisoTexto: {
    fontSize: 13,
    color: '#7A5A12',
    lineHeight: 19,
  },
  proximoBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_PACIENTE,
    fontSize: 14,
    fontWeight: '700',
  },
  chipEstado: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  tarjetaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tarjetaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  verTodos: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  filaEstudio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  filaEstudioConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  tipoEstudio: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoEstudioTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  estudioDatos: {
    flex: 1,
  },
  estudioTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  estudioDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipPendiente: {
    backgroundColor: COLOR_PENDIENTE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipPendienteTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tarjetaEspera: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  esperaNumero: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FONDO_PENDIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  esperaNumeroTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_PENDIENTE,
  },
  esperaDatos: {
    flex: 1,
  },
  esperaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  esperaSubtitulo: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  accesos: {
    flexDirection: 'row',
    gap: 12,
  },
  accesoDeshabilitado: {
    opacity: 0.55,
  },
  accesoPreconsulta: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 14,
    padding: 16,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
  accesoPreconsultaTitulo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  accesoPreconsultaSubtitulo: {
    color: '#D7E6FE',
    fontSize: 12,
    marginTop: 2,
  },
  accesoMedicacion: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
  accesoMedicacionTitulo: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '700',
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonNuevoTurno: {
    alignSelf: 'stretch',
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  botonMisTurnos: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonMisTurnosTexto: {
    color: COLOR_PACIENTE,
    fontSize: 15,
    fontWeight: '700',
  },
  botonCancelar: {
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonCancelarTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: '700',
  },
});
