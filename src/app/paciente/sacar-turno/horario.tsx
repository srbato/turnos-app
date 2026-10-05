import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ResumenEspecialidad, ResumenMedico } from '@/components/resumen-turno';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { SEDE } from '@/datos/catalogo';

type DiaDisponible = {
  fecha: string; // AAAA-MM-DD
  etiquetaDia: string;
  numero: number;
  disponible: boolean;
};

type Horario = {
  hora: string;
  turno: 'Mañana' | 'Tarde';
  disponible: boolean;
};

const HORARIOS: Horario[] = [
  { hora: '08:40', turno: 'Mañana', disponible: true },
  { hora: '09:00', turno: 'Mañana', disponible: false },
  { hora: '09:20', turno: 'Mañana', disponible: true },
  { hora: '10:00', turno: 'Mañana', disponible: true },
  { hora: '10:20', turno: 'Mañana', disponible: true },
  { hora: '10:40', turno: 'Mañana', disponible: false },
  { hora: '11:20', turno: 'Mañana', disponible: true },
  { hora: '11:40', turno: 'Mañana', disponible: true },
  { hora: '15:00', turno: 'Tarde', disponible: true },
  { hora: '15:40', turno: 'Tarde', disponible: true },
  { hora: '16:20', turno: 'Tarde', disponible: false },
  { hora: '17:00', turno: 'Tarde', disponible: true },
];

const DIAS_SEMANA_CORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function proximosDias(cantidad: number): DiaDisponible[] {
  const dias: DiaDisponible[] = [];
  const hoy = new Date();
  for (let i = 1; i <= cantidad; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    dias.push({
      fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`,
      etiquetaDia: DIAS_SEMANA_CORTO[fecha.getDay()],
      numero: fecha.getDate(),
      disponible: i !== cantidad, // el último día de la tanda queda sin cupos, para mostrar el estado deshabilitado
    });
  }
  return dias;
}

function formatearFechaLarga(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaLocal = new Date(anio, mes - 1, dia);
  return `${DIAS_SEMANA[fechaLocal.getDay()]} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
}

function formatearFechaCorta(fecha: string) {
  const [, mes, dia] = fecha.split('-');
  return `${dia}/${mes}`;
}

const DIAS = proximosDias(4);

export default function ElegirHorario() {
  const { especialidad, medico, fecha, hora, elegirFecha, elegirHora } = useSacarTurno();
  const { agregarTurno } = useTurnos();
  const [confirmado, setConfirmado] = useState(false);

  // Si se entra a esta URL directo, se vuelve al primer paso que falte.
  if (!especialidad) {
    return <Redirect href="/paciente/sacar-turno" />;
  }
  if (!medico) {
    return <Redirect href="/paciente/sacar-turno/medico" />;
  }

  // Mientras no elija otro día, se muestra el primero.
  const fechaSeleccionada = fecha ?? DIAS[0].fecha;

  function confirmar() {
    if (!especialidad || !medico || !hora) return;
    agregarTurno({
      id: String(Date.now()),
      medico: medico.nombre,
      especialidad: especialidad.nombre,
      consultorio: medico.consultorio,
      fecha: fechaSeleccionada,
      hora,
      sede: SEDE,
      estado: 'pendiente',
      instrucciones: [],
    });
    setConfirmado(true);
  }

  function volverAlInicio() {
    // dismissTo saca el flujo del historial: el botón atrás no vuelve a un turno ya confirmado.
    router.dismissTo('/paciente');
  }

  function renderGrilla(turno: Horario['turno']) {
    return (
      <View style={styles.grillaHorarios}>
        {HORARIOS.filter((horario) => horario.turno === turno).map((horario) => {
          const seleccionado = horario.hora === hora;
          return (
            <Pressable
              key={horario.hora}
              disabled={!horario.disponible}
              style={[
                styles.horarioBoton,
                seleccionado && styles.horarioBotonSeleccionado,
                !horario.disponible && styles.horarioBotonDeshabilitado,
              ]}
              onPress={() => elegirHora(horario.hora)}>
              <Text
                style={[
                  styles.horarioTexto,
                  seleccionado && styles.horarioTextoSeleccionado,
                  !horario.disponible && styles.horarioTextoDeshabilitado,
                ]}>
                {horario.hora}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <ResumenEspecialidad
          especialidad={especialidad}
          onCambiar={() => router.dismissTo('/paciente/sacar-turno')}
        />
        <ResumenMedico
          medico={medico}
          onCambiar={() => router.dismissTo('/paciente/sacar-turno/medico')}
        />

        <View style={styles.filaDias}>
          {DIAS.map((dia) => {
            const seleccionado = dia.fecha === fechaSeleccionada;
            return (
              <Pressable
                key={dia.fecha}
                disabled={!dia.disponible}
                style={[
                  styles.diaCaja,
                  seleccionado && styles.diaCajaSeleccionada,
                  !dia.disponible && styles.diaCajaDeshabilitada,
                ]}
                onPress={() => elegirFecha(dia.fecha)}>
                <Text
                  style={[
                    styles.diaEtiqueta,
                    seleccionado && styles.diaTextoSeleccionado,
                    !dia.disponible && styles.diaTextoDeshabilitado,
                  ]}>
                  {dia.etiquetaDia}
                </Text>
                <Text
                  style={[
                    styles.diaNumero,
                    seleccionado && styles.diaTextoSeleccionado,
                    !dia.disponible && styles.diaTextoDeshabilitado,
                  ]}>
                  {dia.numero}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tarjetaHorarios}>
          <Text style={styles.horariosTitulo}>
            Horarios del {formatearFechaLarga(fechaSeleccionada)}
          </Text>
          <Text style={styles.horariosSubtitulo}>Turnos de 20 minutos · Av. Rivadavia 4820</Text>

          <Text style={styles.turnoLabel}>MAÑANA</Text>
          {renderGrilla('Mañana')}

          <Text style={styles.turnoLabel}>TARDE</Text>
          {renderGrilla('Tarde')}
        </View>
      </ScrollView>

      <Pressable
        disabled={!hora}
        style={[styles.botonConfirmar, !hora && styles.botonConfirmarDeshabilitado]}
        onPress={confirmar}>
        <Text style={styles.botonConfirmarTexto}>
          {hora
            ? `Confirmar ${formatearFechaCorta(fechaSeleccionada)} · ${hora} h`
            : 'Seleccioná un horario'}
        </Text>
      </Pressable>

      <Modal visible={confirmado} animationType="slide" transparent onRequestClose={volverAlInicio}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>¡Turno solicitado!</Text>
            <Text style={styles.modalMedico}>{medico.nombre}</Text>
            <Text style={styles.modalDato}>
              {especialidad.nombre} · {medico.consultorio}
            </Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada)} · {hora} h
            </Text>
            <Text style={styles.modalDato}>{SEDE}</Text>
            <Pressable style={styles.botonModal} onPress={volverAlInicio}>
              <Text style={styles.botonConfirmarTexto}>Volver al inicio</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  filaDias: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  diaCaja: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  diaCajaSeleccionada: {
    backgroundColor: COLOR_PACIENTE,
  },
  diaCajaDeshabilitada: {
    backgroundColor: '#F0F0F0',
  },
  diaEtiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  diaNumero: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  diaTextoSeleccionado: {
    color: '#FFFFFF',
  },
  diaTextoDeshabilitado: {
    color: '#C2C2C2',
  },
  tarjetaHorarios: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  horariosTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  horariosSubtitulo: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
    marginBottom: 14,
  },
  turnoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  grillaHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  horarioBoton: {
    width: '22%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  horarioBotonSeleccionado: {
    backgroundColor: COLOR_PACIENTE,
    borderColor: COLOR_PACIENTE,
  },
  horarioBotonDeshabilitado: {
    backgroundColor: '#F5F5F5',
    borderColor: '#F0F0F0',
  },
  horarioTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  horarioTextoSeleccionado: {
    color: '#FFFFFF',
  },
  horarioTextoDeshabilitado: {
    color: '#C2C2C2',
  },
  botonConfirmar: {
    backgroundColor: COLOR_PACIENTE,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonConfirmarDeshabilitado: {
    backgroundColor: '#A9BEE8',
  },
  botonConfirmarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'flex-end',
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PACIENTE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalMedico: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalDato: {
    fontSize: 15,
    color: '#3A3A3A',
    marginBottom: 4,
  },
  botonModal: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
});
