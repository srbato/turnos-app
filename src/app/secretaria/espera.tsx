import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetalleOfertaSecretaria } from '@/components/detalle-oferta-secretaria';
import { HorariosDisponiblesModal } from '@/components/horarios-disponibles-modal';
import { MenuSecretaria } from '@/components/menu-secretaria';
import {
  COLOR_CANCELADO,
  COLOR_CONFIRMADO,
  COLOR_PENDIENTE,
  COLOR_SECRETARIA,
  FONDO_SECRETARIA,
} from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { EstadoOferta, useAdelantos, Oferta } from '@/contextos/AdelantosContext';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useErrores } from '@/contextos/ErroresContext';
import { useTurnos, Turno } from '@/contextos/TurnosContext';
import {
  DIAS_MINIMOS_ADELANTO,
  diasDesdeHoy,
  listaDeEspera,
  ofertasVigentes,
} from '@/datos/adelantos';
import { evaluarRiesgo, nombreNivelRiesgo, textoPuntaje } from '@/datos/ausentismo';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';
import { sinRepetidos } from '@/utilidades/listas';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { Idioma, usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

const COLORES_RESPUESTA: Record<EstadoOferta, string> = {
  enviada: COLOR_PENDIENTE,
  aceptada: COLOR_CONFIRMADO,
  rechazada: COLOR_CANCELADO,
  'sin-respuesta': '#8A8A8A',
  retirada: '#8A8A8A',
};

// "Dr. Ricardo Paz" -> "Dr. Paz"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

function textoCorto(fecha: string, hora: string, idioma: Idioma) {
  return TEXTOS_PACIENTE[idioma].aviso.otroDia(detalleFecha(fecha, idioma).diaSemana.slice(0, 3), formatearFecha(fecha).slice(0, 5), hora);
}

// Lista de espera = adelantos. Los pacientes sacan un turno y pueden anotarse para adelantarlo. Secretaría elige a
// quién proponerle un horario libre del médico (desde 3 días en adelante): o toca a un paciente y elige el horario,
// o mira los horarios libres y toca a quién se lo propone. Cada paciente recibe una oferta a la vez y cada horario
// se ofrece a un solo paciente.
export default function EsperaSecretaria() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { turnos } = useTurnos();
  const { ofertas, noContesta } = useAdelantos();
  const { mostrarError } = useErrores();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo } = useConfiguracion();

  function nombreDelPaciente(idPaciente: string) {
    const paciente = consultorio.pacientes.find((p) => p.id === idPaciente);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : t.comun.paciente;
  }
  // Historial del paciente según sus faltas, asistencias y confirmaciones: ayuda a elegir a quién darle un horario.
  function textoHistorial(idPaciente: string) {
    const paciente = consultorio.pacientes.find((p) => p.id === idPaciente);
    if (!paciente) return '';
    const riesgo = evaluarRiesgo(paciente, turnos, reglasRiesgo);
    const nivel = nombreNivelRiesgo(riesgo.nivel, idioma);
    return t.espera.historial(nivel, textoPuntaje(riesgo.puntaje, idioma));
  }
  // Médico cuya agenda se está mirando para ofrecer un horario (null = cerrado).
  const [medicoAbierto, setMedicoAbierto] = useState<string | null>(null);
  // Paciente de la lista al que se le quiere proponer un horario (null = ninguno).
  const [turnoDestino, setTurnoDestino] = useState<Turno | null>(null);
  // Oferta cuyo detalle se está mirando, para modificarla ('' = cerrado).
  const [idOferta, setIdOferta] = useState('');

  const vigentes = ofertasVigentes(ofertas, turnos).sort((a, b) =>
    `${a.horario.fecha} ${a.horario.hora}` < `${b.horario.fecha} ${b.horario.hora}` ? -1 : 1
  );
  const enLista = listaDeEspera(turnos);
  const medicosEnLista = sinRepetidos(enLista.map((turno) => turno.medico));
  const respuestas = ofertas.filter((oferta) => oferta.estado !== 'enviada');

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>{t.espera.titulo}</Text>
        <Text style={styles.subtitulo}>{t.espera.subtitulo(DIAS_MINIMOS_ADELANTO)}</Text>

        <Text style={styles.seccion}>{t.espera.ofertasEnCurso(vigentes.length)}</Text>
        {vigentes.length === 0 && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>{t.espera.sinOfertas}</Text>
          </View>
        )}
        {vigentes.map((oferta) => {
          const turno = turnos.find((t) => t.id === oferta.idTurno);
          if (!turno) return null;
          return (
            <Pressable key={oferta.id} style={styles.panelOferta} onPress={() => setIdOferta(oferta.id)}>
              <View style={styles.encabezadoOferta}>
                <Text style={styles.etiquetaLiberado}>{t.espera.horarioOfrecido}</Text>
                <View style={styles.chip}>
                  <Text style={styles.chipTexto}>{t.espera.enDias(diasDesdeHoy(oferta.horario.fecha))}</Text>
                </View>
              </View>
              <Text style={styles.liberadoTitulo}>
                {textoCorto(oferta.horario.fecha, oferta.horario.hora, idioma)} · {medicoCorto(oferta.horario.medico)}
              </Text>

              <View style={styles.ofrecido}>
                <View style={styles.ofrecidoTextos}>
                  <Text style={styles.ofrecidoEtiqueta}>{t.espera.seLeOfrecio}</Text>
                  <Text style={styles.candidatoNombre}>{nombreDelPaciente(turno.idPaciente)}</Text>
                  <Text style={styles.detalle}>
                    {t.espera.esperaDesde(formatearFecha(turno.adelantoDesde ?? '').slice(0, 5), textoCorto(turno.fecha, turno.hora, idioma))}
                  </Text>
                  <Text style={styles.esperando}>{t.espera.esperandoSuRespuesta}</Text>
                </View>
                <Pressable onPress={async () => mostrarError(await noContesta(oferta))}>
                  <Text style={styles.noContesta}>{t.espera.noContesta}</Text>
                </Pressable>
              </View>
              <Text style={styles.modificar}>{t.espera.tocarParaModificar}</Text>
            </Pressable>
          );
        })}

        <Text style={styles.seccion}>{t.espera.enEspera(enLista.length)}</Text>
        {enLista.length === 0 && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>{t.espera.nadieEnLista}</Text>
          </View>
        )}
        {medicosEnLista.map((medico) => {
          const delMedico = enLista.filter((turno) => turno.medico === medico);
          return (
            <View key={medico} style={styles.panel}>
              <View style={styles.encabezadoOferta}>
                <Text style={styles.panelTitulo}>{medico}</Text>
                <View style={styles.chip}>
                  <Text style={styles.chipTexto}>{t.espera.enEsperaChip(delMedico.length)}</Text>
                </View>
              </View>
              <Pressable style={styles.botonHorarios} onPress={() => setMedicoAbierto(medico)}>
                <Text style={styles.botonHorariosTexto}>{t.espera.verHorarios}</Text>
              </Pressable>
              {delMedico.map((turno, indice) => {
                const oferta = vigentes.find((o) => o.idTurno === turno.id);
                return (
                  <Pressable
                    key={turno.id}
                    style={[styles.candidato, oferta && styles.candidatoConOferta]}
                    onPress={() => (oferta ? setIdOferta(oferta.id) : setTurnoDestino(turno))}>
                    <View style={styles.posicion}>
                      <Text style={styles.posicionTexto}>{indice + 1}</Text>
                    </View>
                    <View style={styles.candidatoTextos}>
                      <Text style={styles.candidatoNombre}>{nombreDelPaciente(turno.idPaciente)}</Text>
                      <Text style={styles.detalle}>
                        {t.espera.desde(formatearFecha(turno.adelantoDesde ?? '').slice(0, 5), textoCorto(turno.fecha, turno.hora, idioma))}
                      </Text>
                      <Text style={styles.detalle}>{textoHistorial(turno.idPaciente)}</Text>
                      {oferta && (
                        <Text style={styles.tagOferta}>
                          {t.espera.ofertaPendiente(textoCorto(oferta.horario.fecha, oferta.horario.hora, idioma))}
                        </Text>
                      )}
                    </View>
                    {/* Sin oferta pendiente: se le puede proponer un horario; con oferta, se abre para modificarla. */}
                    <Text style={styles.accionFila}>{oferta ? t.espera.ver : t.espera.proponer}</Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {respuestas.length > 0 && (
          <>
            <Text style={styles.seccion}>{t.espera.respuestasTitulo}</Text>
            <View style={styles.panel}>
              {[...respuestas].reverse().map((respuesta, indice) => {
                const turno = turnos.find((t) => t.id === respuesta.idTurno);
                return (
                  <View key={respuesta.id} style={[styles.filaSimple, indice > 0 && styles.filaBorde]}>
                    <Text style={styles.filaTitulo}>
                      {turno ? nombreDelPaciente(turno.idPaciente) : t.comun.paciente} ·{' '}
                      {textoCorto(respuesta.horario.fecha, respuesta.horario.hora, idioma)}
                    </Text>
                    <Text style={[styles.estadoRespuesta, { color: COLORES_RESPUESTA[respuesta.estado] }]}>
                      {t.espera.respuestas[respuesta.estado]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <MenuSecretaria activa="espera" />

      <DetalleOfertaSecretaria idOferta={idOferta} onCerrar={() => setIdOferta('')} />

      <HorariosDisponiblesModal
        medico={turnoDestino ? turnoDestino.medico : medicoAbierto}
        turnoDestino={turnoDestino}
        onCerrar={() => {
          setMedicoAbierto(null);
          setTurnoDestino(null);
        }}
      />
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
    padding: 18,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontFamily: FUENTE_TITULOS,
    color: c.acento,
  },
  subtitulo: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 4,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textoTenue,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  panel: {
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  panelOferta: {
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLOR_PENDIENTE,
    padding: 14,
    marginBottom: 10,
  },
  encabezadoOferta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  etiquetaLiberado: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textoAmbar,
    letterSpacing: 0.5,
  },
  chip: {
    backgroundColor: c.chipAzul,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: c.acento,
  },
  liberadoTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: c.texto,
  },
  ofrecido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.ambar,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  ofrecidoTextos: {
    flex: 1,
  },
  ofrecidoEtiqueta: {
    fontSize: 11,
    color: c.textoAmbar,
    fontWeight: '700',
  },
  esperando: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoAmbar,
    marginTop: 4,
  },
  noContesta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginLeft: 8,
  },
  modificar: {
    fontSize: 12,
    fontWeight: '600',
    color: c.acento,
    marginTop: 10,
  },
  panelTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: c.texto,
  },
  accionFila: {
    fontSize: 12,
    fontWeight: '700',
    color: c.acento,
    marginLeft: 8,
  },
  botonHorarios: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonHorariosTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: c.acento,
  },
  candidato: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: c.bordeSuave,
  },
  candidatoConOferta: {
    borderColor: COLOR_PENDIENTE,
    backgroundColor: c.ambarSuave,
  },
  posicion: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: c.tarjeta,
    borderWidth: 1,
    borderColor: c.bordeAcento,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  posicionTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: c.acento,
  },
  candidatoTextos: {
    flex: 1,
  },
  candidatoNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 1,
  },
  tagOferta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoAmbar,
    marginTop: 3,
  },
  filaSimple: {
    paddingVertical: 8,
  },
  filaBorde: {
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
  },
  filaTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: c.texto,
  },
  estadoRespuesta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
