import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import {
  COLOR_CANCELADO,
  COLOR_CONFIRMADO,
  COLOR_PENDIENTE,
  COLOR_SECRETARIA,
  FONDO_SECRETARIA,
} from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { enLicencia, estadoEfectivo, usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { fechaDentroDe, HOY } from '@/datos/consultorio';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

const COLOR_BAJA = '#8A8A8A';

// Ficha de un médico para Secretaría: datos editables, estado (activo / licencia) y baja.
export default function FichaMedico() {
  const { matricula: parametro } = useLocalSearchParams<{ matricula: string }>();
  const { medicos, editarMedico } = usePersonal();
  const { turnos } = useTurnos();

  // La matrícula puede cambiarse acá: se guarda la actual para seguir encontrándolo.
  const [matriculaActual, setMatriculaActual] = useState(parametro ?? '');
  const medico = medicos.find((m) => m.matricula === matriculaActual);

  const [especialidad, setEspecialidad] = useState(medico?.especialidad ?? '');
  const [matricula, setMatricula] = useState(medico?.matricula ?? '');
  const [consultorio, setConsultorio] = useState(medico?.consultorio ?? '');
  const [dias, setDias] = useState(medico?.dias ?? '');
  const [mensaje, setMensaje] = useState<{ texto: string; esError: boolean } | null>(null);
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);
  // Eligiendo la fecha de vuelta de una licencia.
  const [eligiendoLicencia, setEligiendoLicencia] = useState(false);
  const [fechaVuelta, setFechaVuelta] = useState('');

  if (!medico) {
    return (
      <View style={styles.pantalla}>
        <Pressable style={styles.contenido} onPress={() => router.navigate('/secretaria/personal')}>
          <Text style={styles.volver}>‹ Personal</Text>
          <Text style={styles.detalle}>No se encontró al médico.</Text>
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
  const textoProximos =
    proximos === 0 ? 'No tiene turnos próximos.' : `Tiene ${proximos} turno${proximos === 1 ? '' : 's'} próximo${proximos === 1 ? '' : 's'}.`;

  // Una licencia que ya terminó cuenta como activo.
  const efectivo = estadoEfectivo(medico);
  const deLicencia = efectivo === 'licencia';
  const colorEstado = efectivo === 'activo' ? COLOR_CONFIRMADO : efectivo === 'licencia' ? COLOR_PENDIENTE : COLOR_BAJA;
  const etiquetaEstado =
    efectivo === 'activo'
      ? 'Activo'
      : efectivo === 'licencia'
        ? `Licencia${medico.licenciaHasta ? ' · vuelve el ' + formatearFecha(medico.licenciaHasta).slice(0, 5) : ''}`
        : 'Baja';
  // Los próximos 60 días, para elegir cuándo vuelve.
  const diasParaVolver = Array.from({ length: 60 }, (_, i) => fechaDentroDe(i + 1));

  function guardar() {
    if (especialidad.trim() === '' || matricula.trim() === '' || consultorio.trim() === '' || dias.trim() === '') {
      setMensaje({ texto: 'Completá todos los campos.', esError: true });
      return;
    }
    if (medicos.some((m) => m.matricula === matricula.trim() && m.matricula !== matriculaActual)) {
      setMensaje({ texto: 'Ya hay un médico con esa matrícula.', esError: true });
      return;
    }
    editarMedico(matriculaActual, {
      especialidad: especialidad.trim(),
      matricula: matricula.trim(),
      consultorio: consultorio.trim(),
      dias: dias.trim(),
    });
    setMatriculaActual(matricula.trim());
    setMensaje({ texto: 'Cambios guardados ✓', esError: false });
  }

  function cambiarEstado(estado: 'activo' | 'licencia') {
    // Al volver a activo se borra la fecha de vuelta de la licencia.
    editarMedico(matriculaActual, { estado, licenciaHasta: undefined });
    setEligiendoLicencia(false);
    setMensaje(null);
  }

  function confirmarLicencia() {
    if (fechaVuelta === '') return;
    editarMedico(matriculaActual, { estado: 'licencia', licenciaHasta: fechaVuelta });
    setEligiendoLicencia(false);
    setFechaVuelta('');
    setMensaje(null);
  }

  function darDeBaja() {
    editarMedico(matriculaActual, { estado: 'baja' });
    setConfirmandoBaja(false);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.navigate('/secretaria/personal')} hitSlop={10}>
          <Text style={styles.volver}>‹ Personal</Text>
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

        <Text style={styles.seccion}>ESTADO</Text>
        <View style={styles.tarjeta}>
          {medico.estado === 'baja' ? (
            <>
              <Text style={styles.detalleOscuro}>
                Este médico está dado de baja: no aparece en las agendas ni se le pueden asignar turnos.
              </Text>
              <Pressable style={styles.botonPrimario} onPress={() => cambiarEstado('activo')}>
                <Text style={styles.botonPrimarioTexto}>Reactivar médico</Text>
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
                    Activo
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmento, (deLicencia || eligiendoLicencia) && styles.segmentoActivo]}
                  onPress={() => !deLicencia && setEligiendoLicencia(true)}>
                  <Text
                    style={[styles.segmentoTexto, (deLicencia || eligiendoLicencia) && styles.segmentoTextoActivo]}>
                    De licencia
                  </Text>
                </Pressable>
              </View>

              {deLicencia && !eligiendoLicencia && (
                <>
                  <Text style={styles.vuelta}>
                    {medico.licenciaHasta
                      ? `Vuelve a atender el ${detalleFecha(medico.licenciaHasta).diaSemana} ${formatearFecha(medico.licenciaHasta)}.`
                      : 'Licencia sin fecha de vuelta.'}
                  </Text>
                  <Text style={styles.ayuda}>
                    Su agenda aparece bloqueada hasta ese día. Los pacientes pueden sacar turno con él desde que vuelve.
                  </Text>
                  <Pressable style={styles.botonSecundario} onPress={() => setEligiendoLicencia(true)}>
                    <Text style={styles.botonSecundarioTexto}>Cambiar fecha de vuelta</Text>
                  </Pressable>
                </>
              )}

              {eligiendoLicencia && (
                <>
                  <Text style={styles.vuelta}>¿Cuándo vuelve a atender?</Text>
                  <Text style={styles.ayuda}>
                    Elegí el primer día en que ya atiende. Hasta entonces está de licencia.
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasFila}>
                    {diasParaVolver.map((dia) => (
                      <Pressable
                        key={dia}
                        style={[styles.diaCaja, dia === fechaVuelta && styles.diaCajaActiva]}
                        onPress={() => setFechaVuelta(dia)}>
                        <Text style={[styles.diaEtiqueta, dia === fechaVuelta && styles.diaTextoActivo]}>
                          {detalleFecha(dia).diaSemana.slice(0, 3).toUpperCase()}
                        </Text>
                        <Text style={[styles.diaNumero, dia === fechaVuelta && styles.diaTextoActivo]}>
                          {detalleFecha(dia).dia}
                        </Text>
                        <Text style={[styles.diaMes, dia === fechaVuelta && styles.diaTextoActivo]}>
                          {detalleFecha(dia).mes}
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
                      <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      disabled={fechaVuelta === ''}
                      style={[styles.botonConfirmarLicencia, fechaVuelta === '' && styles.botonDeshabilitado]}
                      onPress={confirmarLicencia}>
                      <Text style={styles.botonPrimarioTexto}>Confirmar licencia</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {!deLicencia && !eligiendoLicencia && <Text style={styles.ayuda}>Atiende con normalidad.</Text>}
              <Text style={styles.ayuda}>{textoProximos}</Text>
            </>
          )}
        </View>

        <Text style={styles.seccion}>DATOS DEL MÉDICO</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Nombre y apellido</Text>
          <View style={[styles.campo, styles.campoBloqueado]}>
            <Text style={styles.campoBloqueadoTexto}>{medico.nombre}</Text>
          </View>
          <Text style={styles.nota}>No se puede cambiar: figura en los turnos ya cargados.</Text>

          <Text style={styles.etiqueta}>Especialidad</Text>
          <TextInput style={styles.campo} value={especialidad} onChangeText={setEspecialidad} maxLength={40} />

          <Text style={styles.etiqueta}>Matrícula</Text>
          <TextInput style={styles.campo} value={matricula} onChangeText={setMatricula} maxLength={20} />

          <Text style={styles.etiqueta}>Consultorio</Text>
          <TextInput style={styles.campo} value={consultorio} onChangeText={setConsultorio} maxLength={30} />

          <Text style={styles.etiqueta}>Días y horarios</Text>
          <TextInput
            style={styles.campo}
            value={dias}
            onChangeText={setDias}
            placeholder="lun y mié · 9 a 13"
            placeholderTextColor="#8FB9B5"
            maxLength={40}
          />

          {mensaje && (
            <Text style={[styles.mensaje, { color: mensaje.esError ? COLOR_CANCELADO : COLOR_CONFIRMADO }]}>
              {mensaje.texto}
            </Text>
          )}
          <Pressable style={styles.botonPrimario} onPress={guardar}>
            <Text style={styles.botonPrimarioTexto}>Guardar cambios</Text>
          </Pressable>
        </View>

        {medico.estado !== 'baja' && (
          <Pressable style={styles.botonBaja} onPress={() => setConfirmandoBaja(true)}>
            <Text style={styles.botonBajaTexto}>Dar de baja al médico</Text>
          </Pressable>
        )}
      </ScrollView>

      <MenuSecretaria activa="personal" />

      <Modal visible={confirmandoBaja} animationType="fade" transparent onRequestClose={() => setConfirmandoBaja(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>¿Dar de baja a {medico.nombre}?</Text>
            <Text style={styles.detalleOscuro}>
              Deja de aparecer en las agendas y no se le podrán asignar turnos. Su historial se conserva y se puede
              reactivar cuando quieras.
            </Text>
            {proximos > 0 && (
              <Text style={[styles.detalleOscuro, styles.aviso]}>
                {textoProximos} No se cancelan solos: reprogramalos o cancelalos desde la agenda.
              </Text>
            )}
            <View style={styles.filaBotones}>
              <Pressable style={styles.botonSecundarioMitad} onPress={() => setConfirmandoBaja(false)}>
                <Text style={styles.botonSecundarioTexto}>Volver</Text>
              </Pressable>
              <Pressable style={styles.botonConfirmarBaja} onPress={darDeBaja}>
                <Text style={styles.botonPrimarioTexto}>Sí, dar de baja</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </PantallaConTeclado>
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
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_SECRETARIA,
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
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 13,
    color: '#5A5A5A',
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
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  segmentos: {
    flexDirection: 'row',
    backgroundColor: '#D5ECE9',
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
    color: '#5A5A5A',
  },
  segmentoTextoActivo: {
    color: '#FFFFFF',
  },
  vuelta: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  diasFila: {
    gap: 8,
    paddingVertical: 10,
  },
  diaCaja: {
    width: 56,
    borderWidth: 1,
    borderColor: '#B9DAD6',
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
    color: '#5A5A5A',
    marginTop: 10,
  },
  detalleOscuro: {
    fontSize: 14,
    color: '#3A3A3A',
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 12,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  campoBloqueado: {
    backgroundColor: '#F2F5F5',
  },
  campoBloqueadoTexto: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  nota: {
    fontSize: 11,
    color: '#8A8A8A',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
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
  botonSecundarioMitad: {
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
  botonConfirmarBaja: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
