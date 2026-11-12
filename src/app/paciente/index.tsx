import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPaciente } from '@/components/avatar-paciente';
import { AvisoConfirmar } from '@/components/aviso-confirmar';
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
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { useEstudios } from '@/contextos/EstudiosContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { listaDeEspera, puestoEnLista } from '@/datos/adelantos';
import { Estudio } from '@/datos/estudios';
import { useTurnos, Turno } from '@/contextos/TurnosContext';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, fechaHoraComoDate } from '@/utilidades/turnos';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para chips y fondos suaves

function saludoSegunHora(saludo: { dia: string; tarde: string; noche: string }) {
  const hora = new Date().getHours();
  if (hora < 12) return saludo.dia;
  if (hora < 20) return saludo.tarde;
  return saludo.noche;
}

export default function HubPaciente() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { turnos, misTurnos } = useTurnos();
  const { nombre } = usePerfilPaciente();
  const { estudios } = useEstudios();
  const estudiosPendientes = estudios.filter((estudio) => estudio.estado === 'pendiente');
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

  // Texto de la tarjeta de preconsulta.
  let textoPreconsulta = t.home.preconsultaNecesitas;
  if (proximoTurno) {
    if (buscarPorTurno(proximoTurno.id)) {
      textoPreconsulta = t.home.preconsultaEnviada;
    } else {
      textoPreconsulta = t.home.preconsultaOpcional;
    }
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.saludo}>{saludoSegunHora(t.home.saludo)},</Text>
            <Text style={styles.nombre}>{nombre.split(' ')[0]}</Text>
          </View>
          <Pressable onPress={() => router.navigate('/perfil?rol=paciente')}>
            <AvatarPaciente tamano={48} colorFondo={COLOR_PACIENTE} colorTexto="#FFFFFF" />
          </Pressable>
        </View>

        {/* Propuestas de Secretaría para adelantar un turno (si hay alguna). */}
        <AvisoConfirmar />
        <OfertasAdelanto />

        {!proximoTurno ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>{t.home.sinTurnos}</Text>
            <Pressable
              style={styles.botonNuevoTurno}
              onPress={() => router.push('/paciente/sacar-turno')}>
              <Text style={styles.botonPrimarioTexto}>{t.home.sacarNuevo}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tarjetaProximo}>
            <View style={styles.proximoEncabezado}>
              <Text style={styles.proximoEtiqueta}>{t.home.proximo}</Text>
              <View
                style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[proximoTurno.estado] }]}>
                <Text style={styles.chipEstadoTexto}>{t.estados[proximoTurno.estado]}</Text>
              </View>
            </View>

            <View style={styles.proximoCuerpo}>
              <View style={styles.fechaCaja}>
                <Text style={styles.fechaDia}>{detalleFecha(proximoTurno.fecha, idioma).dia}</Text>
                <Text style={styles.fechaMes}>{detalleFecha(proximoTurno.fecha, idioma).mes}</Text>
              </View>
              <View style={styles.proximoDatos}>
                <Text style={styles.proximoMedico}>{proximoTurno.medico}</Text>
                <Text style={styles.proximoEspecialidad}>
                  {proximoTurno.especialidad} · {proximoTurno.sala}
                </Text>
                <Text style={styles.proximoHora}>
                  {t.home.hora(detalleFecha(proximoTurno.fecha, idioma).diaSemana, proximoTurno.hora)}
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
                <Text style={styles.botonPrimarioTexto}>{t.home.verDetalle}</Text>
              </Pressable>
              <Pressable
                style={styles.botonSecundario}
                onPress={() => router.push({ pathname: '/paciente/reprogramar/[id]', params: { id: proximoTurno.id } })}>
                <Text style={styles.botonSecundarioTexto}>{t.comun.reprogramar}</Text>
              </Pressable>
            </View>
            <Pressable style={styles.botonCancelar} onPress={() => setTurnoACancelar(proximoTurno)}>
              <Text style={styles.botonCancelarTexto}>{t.comun.cancelarTurno}</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.botonMisTurnos} onPress={() => router.push('/paciente/mis-turnos')}>
          <Text style={styles.botonMisTurnosTexto}>{t.home.misTurnos}</Text>
        </Pressable>

        {estudiosPendientes.length > 0 && (
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaEncabezado}>
              <Text style={styles.tarjetaTitulo}>{t.home.misEstudios}</Text>
              <Pressable onPress={() => router.push('/paciente/estudios')}>
                <Text style={styles.verTodos}>{t.home.verTodos}</Text>
              </Pressable>
            </View>
            {estudiosPendientes.map((estudio, indice) => (
              <Pressable
                key={estudio.id}
                onPress={() => setEstudioSeleccionado(estudio)}
                style={[
                  styles.filaEstudio,
                  indice < estudiosPendientes.length - 1 && styles.filaEstudioConBorde,
                ]}>
                <View style={styles.tipoEstudio}>
                  <Text style={styles.tipoEstudioTexto}>{estudio.tipo}</Text>
                </View>
                <View style={styles.estudioDatos}>
                  <Text style={styles.estudioTitulo}>{estudio.titulo}</Text>
                  <Text style={styles.estudioDetalle}>{estudio.detalle}</Text>
                </View>
                <View style={styles.chipPendiente}>
                  <Text style={styles.chipPendienteTexto}>{t.home.pendiente}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {esperas.map(({ turno, posicion, total }) => (
          <View key={turno.id} style={styles.tarjetaEspera}>
            <View style={styles.esperaNumero}>
              <Text style={styles.esperaNumeroTexto}>{t.home.puesto(posicion)}</Text>
            </View>
            <View style={styles.esperaDatos}>
              <Text style={styles.esperaTitulo}>{t.home.esperaTitulo(posicion, total)}</Text>
              <Text style={styles.esperaSubtitulo}>{t.home.esperaSubtitulo(turno.medico)}</Text>
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
            <Text style={styles.accesoPreconsultaTitulo}>{t.home.preconsulta}</Text>
            <Text style={styles.accesoPreconsultaSubtitulo}>{textoPreconsulta}</Text>
          </Pressable>
          <Pressable
            style={styles.accesoMedicacion}
            onPress={() => router.push('/paciente/medicamentos')}>
            <Text style={styles.accesoMedicacionTitulo}>{t.home.misMedicamentos}</Text>
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

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
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
    color: c.textoSecundario,
  },
  nombre: {
    fontSize: 24,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
  },
  tarjetaProximo: {
    backgroundColor: c.tarjeta,
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
    color: c.textoSecundario,
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
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fechaDia: {
    fontSize: 18,
    fontWeight: '700',
    color: c.acento,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: c.acento,
  },
  proximoDatos: {
    flex: 1,
    justifyContent: 'center',
  },
  proximoMedico: {
    fontSize: 17,
    fontWeight: '700',
    color: c.texto,
  },
  proximoEspecialidad: {
    fontSize: 14,
    color: c.textoSecundario,
    marginTop: 2,
  },
  proximoHora: {
    fontSize: 14,
    fontWeight: '600',
    color: c.acento,
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
    color: c.acento,
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
    backgroundColor: c.tarjeta,
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
    color: c.texto,
  },
  verTodos: {
    fontSize: 13,
    fontWeight: '600',
    color: c.acento,
  },
  filaEstudio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  filaEstudioConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: c.bordeSuave,
  },
  tipoEstudio: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoEstudioTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: c.acento,
  },
  estudioDatos: {
    flex: 1,
  },
  estudioTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: c.texto,
  },
  estudioDetalle: {
    fontSize: 12,
    color: c.textoSecundario,
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
    backgroundColor: c.tarjeta,
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
    color: c.texto,
  },
  esperaSubtitulo: {
    fontSize: 12,
    color: c.textoSecundario,
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
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 16,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
  accesoMedicacionTitulo: {
    color: c.texto,
    fontSize: 15,
    fontWeight: '700',
  },
  estadoVacio: {
    backgroundColor: c.tarjeta,
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
    color: c.textoSecundario,
    textAlign: 'center',
  },
  botonMisTurnos: {
    backgroundColor: c.tarjeta,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonMisTurnosTexto: {
    color: c.acento,
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
