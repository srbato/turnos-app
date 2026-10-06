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
import { usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { HOY } from '@/datos/consultorio';

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

  const colorEstado =
    medico.estado === 'activo' ? COLOR_CONFIRMADO : medico.estado === 'licencia' ? COLOR_PENDIENTE : COLOR_BAJA;
  const etiquetaEstado = medico.estado === 'activo' ? 'Activo' : medico.estado === 'licencia' ? 'Licencia' : 'Baja';

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
    editarMedico(matriculaActual, { estado });
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
                  style={[styles.segmento, medico.estado === 'activo' && styles.segmentoActivo]}
                  onPress={() => cambiarEstado('activo')}>
                  <Text style={[styles.segmentoTexto, medico.estado === 'activo' && styles.segmentoTextoActivo]}>
                    Activo
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmento, medico.estado === 'licencia' && styles.segmentoActivo]}
                  onPress={() => cambiarEstado('licencia')}>
                  <Text style={[styles.segmentoTexto, medico.estado === 'licencia' && styles.segmentoTextoActivo]}>
                    De licencia
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.ayuda}>
                {medico.estado === 'licencia'
                  ? 'En licencia su agenda aparece bloqueada y no se le asignan turnos nuevos.'
                  : 'Atiende con normalidad.'}
              </Text>
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
