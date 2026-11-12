import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EditorHorarios } from '@/components/editor-horarios';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import {
  COLOR_CANCELADO,
  COLOR_CONFIRMADO,
  COLOR_PENDIENTE,
  COLOR_SECRETARIA,
  FONDO_SECRETARIA,
} from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { CambiosMedico, enLicencia, estadoEfectivo, usePersonal } from '@/contextos/PersonalContext';
import { FranjaHoraria } from '@/datos/atencion';
import { useTurnos } from '@/contextos/TurnosContext';
import { fechaDentroDe, HOY } from '@/datos/consultorio';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

const COLOR_BAJA = '#8A8A8A';

// "Dr. Ricardo Paz" -> "Dr. Paz"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Ficha de un médico para Secretaría: datos editables, estado (activo / licencia) y baja.
export default function FichaMedico() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medicos, editarMedico } = usePersonal();
  const { turnos } = useTurnos();
  const medico = medicos.find((m) => m.id === id);

  const [especialidad, setEspecialidad] = useState(medico?.especialidad ?? '');
  const [matricula, setMatricula] = useState(medico?.matricula ?? '');
  const [sala, setSala] = useState(medico?.sala ?? '');
  const [mensaje, setMensaje] = useState<{ texto: string; esError: boolean } | null>(null);
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);
  // Eligiendo la fecha de vuelta de una licencia.
  const [eligiendoLicencia, setEligiendoLicencia] = useState(false);
  const [fechaVuelta, setFechaVuelta] = useState('');

  if (!medico) {
    return (
      <View style={styles.pantalla}>
        <Pressable style={styles.contenido} onPress={() => router.navigate('/secretaria/personal')}>
          <Text style={styles.volver}>{t.comun.personal}</Text>
          <Text style={styles.detalle}>{t.comun.noEncontradoMedico}</Text>
        </Pressable>
        <MenuSecretaria activa="personal" />
      </View>
    );
  }

  const proximos = turnos.filter(
    (turno) =>
      turno.medico === medico.nombre &&
      turno.fecha >= HOY &&
      (turno.estado === 'pendiente' || turno.estado === 'confirmado')
  ).length;
  const textoProximos = t.ficha.proximos(proximos);

  // Una licencia que ya terminó cuenta como activo.
  const efectivo = estadoEfectivo(medico);
  const deLicencia = efectivo === 'licencia';
  let colorEstado = COLOR_BAJA;
  let etiquetaEstado = t.ficha.etiquetaEstado.baja;
  if (efectivo === 'activo') {
    colorEstado = COLOR_CONFIRMADO;
    etiquetaEstado = t.ficha.etiquetaEstado.activo;
  } else if (efectivo === 'licencia') {
    colorEstado = COLOR_PENDIENTE;
    etiquetaEstado = t.ficha.etiquetaEstado.licencia;
    if (medico.licenciaHasta) {
      etiquetaEstado = etiquetaEstado + t.ficha.etiquetaLicencia(formatearFecha(medico.licenciaHasta).slice(0, 5));
    }
  }
  // Los próximos 60 días, para elegir cuándo vuelve.
  const diasParaVolver: string[] = [];
  for (let i = 1; i <= 60; i++) {
    diasParaVolver.push(fechaDentroDe(i));
  }

  // Cada cambio se manda a la API. Si no lo acepta (por ejemplo, la matrícula ya la tiene otro médico), se muestra el
  // motivo. Si el médico deja de atender días en que tenía turnos, la API los cancela sola.
  async function guardarCambios(cambios: CambiosMedico, textoListo: string) {
    if (!medico) return false;
    const error = await editarMedico(medico.id, cambios);
    if (error !== '') {
      setMensaje({ texto: error, esError: true });
      return false;
    }
    setMensaje(textoListo === '' ? null : { texto: textoListo, esError: false });
    return true;
  }

  function guardar() {
    if (especialidad.trim() === '' || matricula.trim() === '' || sala.trim() === '') {
      setMensaje({ texto: t.ficha.completar, esError: true });
      return;
    }
    guardarCambios(
      { especialidad: especialidad.trim(), matricula: matricula.trim(), sala: sala.trim() },
      t.ficha.guardado
    );
  }

  // Los horarios se guardan apenas se agrega o se quita uno.
  function cambiarHorarios(franjas: FranjaHoraria[]) {
    guardarCambios({ franjas: franjas }, '');
  }

  function cambiarEstado(estado: 'activo' | 'licencia') {
    // Al volver a activo, la API borra la fecha de vuelta de la licencia.
    guardarCambios({ estado: estado }, '');
    setEligiendoLicencia(false);
  }

  async function confirmarLicencia() {
    if (fechaVuelta === '') return;
    const listo = await guardarCambios({ estado: 'licencia', licenciaHasta: fechaVuelta }, '');
    if (listo) {
      setEligiendoLicencia(false);
      setFechaVuelta('');
    }
  }

  function darDeBaja() {
    guardarCambios({ estado: 'baja' }, '');
    setConfirmandoBaja(false);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.navigate('/secretaria/personal')} hitSlop={10}>
          <Text style={styles.volver}>{t.comun.personal}</Text>
        </Pressable>

        <View style={styles.encabezado}>
          <View style={[styles.avatar, medico.estado === 'baja' && { backgroundColor: COLOR_BAJA }]}>
            <Text style={styles.avatarTexto}>{medico.iniciales}</Text>
          </View>
          <View style={styles.encabezadoTextos}>
            <Text style={styles.nombre}>{medico.nombre}</Text>
            <Text style={styles.detalle}>{medico.especialidad}</Text>
            <View style={[styles.chipEstado, { backgroundColor: colorEstado }]}>
              <Text style={styles.chipEstadoTexto}>{etiquetaEstado}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccion}>{t.ficha.estado}</Text>
        <View style={styles.tarjeta}>
          {medico.estado === 'baja' ? (
            <>
              <Text style={styles.detalleOscuro}>{t.ficha.estadoBaja}</Text>
              <Pressable style={styles.botonPrimario} onPress={() => cambiarEstado('activo')}>
                <Text style={styles.botonPrimarioTexto}>{t.ficha.reactivar}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.segmentos}>
                <Pressable
                  style={[styles.segmento, !deLicencia && !eligiendoLicencia && styles.segmentoActivo]}
                  onPress={() => cambiarEstado('activo')}>
                  <Text
                    style={[styles.segmentoTexto, !deLicencia && !eligiendoLicencia && styles.segmentoTextoActivo]}>
                    {t.ficha.activo}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmento, (deLicencia || eligiendoLicencia) && styles.segmentoActivo]}
                  onPress={() => !deLicencia && setEligiendoLicencia(true)}>
                  <Text
                    style={[styles.segmentoTexto, (deLicencia || eligiendoLicencia) && styles.segmentoTextoActivo]}>
                    {t.ficha.deLicencia}
                  </Text>
                </Pressable>
              </View>

              {deLicencia && !eligiendoLicencia && (
                <>
                  <Text style={styles.vuelta}>
                    {medico.licenciaHasta
                      ? t.ficha.vuelve(`${detalleFecha(medico.licenciaHasta, idioma).diaSemana} ${formatearFecha(medico.licenciaHasta)}`)
                      : t.ficha.sinFechaVuelta}
                  </Text>
                  <Text style={styles.ayuda}>{t.ficha.agendaBloqueada}</Text>
                  <Pressable style={styles.botonSecundario} onPress={() => setEligiendoLicencia(true)}>
                    <Text style={styles.botonSecundarioTexto}>{t.ficha.cambiarFecha}</Text>
                  </Pressable>
                </>
              )}

              {eligiendoLicencia && (
                <>
                  <Text style={styles.vuelta}>{t.ficha.cuandoVuelve}</Text>
                  <Text style={styles.ayuda}>{t.ficha.elegiPrimerDia}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasFila}>
                    {diasParaVolver.map((dia) => (
                      <Pressable
                        key={dia}
                        style={[styles.diaCaja, dia === fechaVuelta && styles.diaCajaActiva]}
                        onPress={() => setFechaVuelta(dia)}>
                        <Text style={[styles.diaEtiqueta, dia === fechaVuelta && styles.diaTextoActivo]}>
                          {detalleFecha(dia, idioma).diaSemana.slice(0, 3).toUpperCase()}
                        </Text>
                        <Text style={[styles.diaNumero, dia === fechaVuelta && styles.diaTextoActivo]}>
                          {detalleFecha(dia, idioma).dia}
                        </Text>
                        <Text style={[styles.diaMes, dia === fechaVuelta && styles.diaTextoActivo]}>
                          {detalleFecha(dia, idioma).mes}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <View style={styles.filaBotonesLicencia}>
                    <Pressable
                      style={styles.botonSecundarioMitad}
                      onPress={() => {
                        setEligiendoLicencia(false);
                        setFechaVuelta('');
                      }}>
                      <Text style={styles.botonSecundarioTexto}>{t.comun.cancelar}</Text>
                    </Pressable>
                    <Pressable
                      disabled={fechaVuelta === ''}
                      style={[styles.botonConfirmarLicencia, fechaVuelta === '' && styles.botonDeshabilitado]}
                      onPress={confirmarLicencia}>
                      <Text style={styles.botonPrimarioTexto}>{t.ficha.confirmarLicencia}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {!deLicencia && !eligiendoLicencia && <Text style={styles.ayuda}>{t.ficha.atiendeNormal}</Text>}
              <Text style={styles.ayuda}>{textoProximos}</Text>
            </>
          )}

          {/* Calendario personal del médico: sus días de atención, licencias y turnos mes a mes. */}
          <Pressable
            style={styles.botonCalendario}
            onPress={() =>
              router.push(`/secretaria/calendario-medico?matricula=${encodeURIComponent(medico.matricula)}`)
            }>
            <Text style={styles.botonSecundarioTexto}>{t.ficha.verCalendario(medicoCorto(medico.nombre))}</Text>
          </Pressable>
        </View>

        <Text style={styles.seccion}>{t.ficha.horariosTitulo}</Text>
        <View style={styles.tarjeta}>
          <EditorHorarios franjas={medico.franjas} onCambiar={cambiarHorarios} />
          <Text style={styles.ayuda}>{t.ficha.horariosNota}</Text>
        </View>

        <Text style={styles.seccion}>{t.ficha.datos}</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>{t.ficha.nombre}</Text>
          <View style={[styles.campo, styles.campoBloqueado]}>
            <Text style={styles.campoBloqueadoTexto}>{medico.nombre}</Text>
          </View>
          <Text style={styles.nota}>{t.ficha.nombreNota}</Text>

          <Text style={styles.etiqueta}>{t.ficha.especialidad}</Text>
          <TextInput style={styles.campo} value={especialidad} onChangeText={setEspecialidad} maxLength={40} />

          <Text style={styles.etiqueta}>{t.ficha.matricula}</Text>
          <TextInput style={styles.campo} value={matricula} onChangeText={setMatricula} maxLength={20} />

          <Text style={styles.etiqueta}>{t.ficha.sala}</Text>
          <TextInput style={styles.campo} value={sala} onChangeText={setSala} maxLength={30} />


          {mensaje && (
            <Text style={[styles.mensaje, { color: mensaje.esError ? COLOR_CANCELADO : COLOR_CONFIRMADO }]}>
              {mensaje.texto}
            </Text>
          )}
          <Pressable style={styles.botonPrimario} onPress={guardar}>
            <Text style={styles.botonPrimarioTexto}>{t.comun.guardarCambios}</Text>
          </Pressable>
        </View>

        {medico.estado !== 'baja' && (
          <Pressable style={styles.botonBaja} onPress={() => setConfirmandoBaja(true)}>
            <Text style={styles.botonBajaTexto}>{t.ficha.darDeBaja}</Text>
          </Pressable>
        )}
      </ScrollView>

      <MenuSecretaria activa="personal" />

      <Modal visible={confirmandoBaja} animationType="fade" transparent onRequestClose={() => setConfirmandoBaja(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>{t.ficha.bajaTitulo(medico.nombre)}</Text>
            <Text style={styles.detalleOscuro}>{t.ficha.bajaTexto}</Text>
            {proximos > 0 && (
              <Text style={[styles.detalleOscuro, styles.aviso]}>
                {t.ficha.bajaCancela(textoProximos)}
              </Text>
            )}
            <View style={styles.filaBotones}>
              <Pressable style={styles.botonSecundarioMitad} onPress={() => setConfirmandoBaja(false)}>
                <Text style={styles.botonSecundarioTexto}>{t.comun.volver}</Text>
              </Pressable>
              <Pressable style={styles.botonConfirmarBaja} onPress={darDeBaja}>
                <Text style={styles.botonPrimarioTexto}>{t.ficha.siBaja}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </PantallaConTeclado>
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
  volver: {
    fontSize: 14,
    fontWeight: '600',
    color: c.acento,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLOR_SECRETARIA,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  encabezadoTextos: {
    flex: 1,
    alignItems: 'flex-start',
  },
  nombre: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
  },
  detalle: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 2,
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textoTenue,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    padding: 14,
  },
  segmentos: {
    flexDirection: 'row',
    backgroundColor: c.chipAzul,
    borderRadius: 12,
    padding: 3,
  },
  segmento: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentoActivo: {
    backgroundColor: COLOR_SECRETARIA,
  },
  segmentoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textoSecundario,
  },
  segmentoTextoActivo: {
    color: '#FFFFFF',
  },
  vuelta: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
    marginTop: 12,
  },
  diasFila: {
    gap: 8,
    paddingVertical: 10,
  },
  diaCaja: {
    width: 56,
    borderWidth: 1,
    borderColor: c.bordeAcento,
    borderRadius: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  diaCajaActiva: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  diaEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textoTenue,
  },
  diaNumero: {
    fontSize: 17,
    fontWeight: '700',
    color: c.texto,
  },
  diaMes: {
    fontSize: 10,
    fontWeight: '700',
    color: c.textoTenue,
  },
  diaTextoActivo: {
    color: '#FFFFFF',
  },
  filaBotonesLicencia: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botonConfirmarLicencia: {
    flex: 1,
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#8FC4BF',
  },
  ayuda: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 10,
  },
  detalleOscuro: {
    fontSize: 14,
    color: c.texto,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginTop: 12,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: c.bordeAcento,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
  },
  campoBloqueado: {
    backgroundColor: c.relleno,
  },
  campoBloqueadoTexto: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  nota: {
    fontSize: 11,
    color: c.textoTenue,
    marginTop: 4,
  },
  mensaje: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  botonPrimario: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonBaja: {
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  botonBajaTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: c.tarjeta,
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: c.texto,
    marginBottom: 10,
  },
  aviso: {
    marginTop: 10,
    color: '#8A5A00',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  botonCalendario: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  botonSecundarioMitad: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: c.acento,
    fontSize: 14,
    fontWeight: '700',
  },
  botonConfirmarBaja: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
