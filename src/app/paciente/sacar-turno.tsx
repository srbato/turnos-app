import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

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

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';

const DIAS = proximosDias(4);

export default function SacarTurno() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(DIAS[1].fecha);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>('10:00');

  function elegirDia(fecha: string) {
    setFechaSeleccionada(fecha);
    setHoraSeleccionada(null);
  }

  const horariosManana = HORARIOS.filter((h) => h.turno === 'Mañana');
  const horariosTarde = HORARIOS.filter((h) => h.turno === 'Tarde');

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable style={styles.volver} onPress={() => router.back()}>
          <Text style={styles.volverTexto}>‹ Sacar turno</Text>
        </Pressable>

        <View style={styles.pasos}>
          <View style={styles.pasoCompleto}>
            <Text style={styles.pasoCompletoCheck}>✓</Text>
            <Text style={styles.pasoCompletoTexto}>Especialidad</Text>
          </View>
          <Text style={styles.pasoGuion}>—</Text>
          <View style={styles.pasoCompleto}>
            <Text style={styles.pasoCompletoCheck}>✓</Text>
            <Text style={styles.pasoCompletoTexto}>Médico</Text>
          </View>
          <Text style={styles.pasoGuion}>—</Text>
          <View style={styles.pasoActivo}>
            <Text style={styles.pasoActivoTexto}>3 Horario</Text>
          </View>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.tarjetaIcono}>
            <Text style={styles.tarjetaIconoTexto}>CAR</Text>
          </View>
          <View style={styles.tarjetaTextos}>
            <Text style={styles.tarjetaEtiqueta}>Especialidad</Text>
            <Text style={styles.tarjetaValor}>Cardiología</Text>
          </View>
          <Text style={styles.cambiar}>Cambiar</Text>
        </View>

        <View style={styles.tarjetaSeleccionada}>
          <View style={styles.avatarMedico}>
            <Text style={styles.avatarMedicoTexto}>RP</Text>
          </View>
          <View style={styles.tarjetaTextos}>
            <Text style={styles.tarjetaEtiqueta}>Profesional</Text>
            <Text style={styles.tarjetaValor}>Dr. Ricardo Paz</Text>
            <Text style={styles.tarjetaSubvalor}>Atiende Swiss Medical SMG20</Text>
          </View>
          <Text style={styles.cambiar}>Cambiar</Text>
        </View>

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
                onPress={() => elegirDia(dia.fecha)}>
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
          <View style={styles.grillaHorarios}>
            {horariosManana.map((horario) => {
              const seleccionado = horario.hora === horaSeleccionada;
              return (
                <Pressable
                  key={horario.hora}
                  disabled={!horario.disponible}
                  style={[
                    styles.horarioBoton,
                    seleccionado && styles.horarioBotonSeleccionado,
                    !horario.disponible && styles.horarioBotonDeshabilitado,
                  ]}
                  onPress={() => setHoraSeleccionada(horario.hora)}>
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

          <Text style={styles.turnoLabel}>TARDE</Text>
          <View style={styles.grillaHorarios}>
            {horariosTarde.map((horario) => {
              const seleccionado = horario.hora === horaSeleccionada;
              return (
                <Pressable
                  key={horario.hora}
                  disabled={!horario.disponible}
                  style={[
                    styles.horarioBoton,
                    seleccionado && styles.horarioBotonSeleccionado,
                    !horario.disponible && styles.horarioBotonDeshabilitado,
                  ]}
                  onPress={() => setHoraSeleccionada(horario.hora)}>
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
        </View>
      </ScrollView>

      <Pressable
        disabled={!horaSeleccionada}
        style={[styles.botonConfirmar, !horaSeleccionada && styles.botonConfirmarDeshabilitado]}
        onPress={() => router.push('/paciente')}>
        <Text style={styles.botonConfirmarTexto}>
          {horaSeleccionada
            ? `Confirmar ${formatearFechaCorta(fechaSeleccionada)} · ${horaSeleccionada} h`
            : 'Seleccioná un horario'}
        </Text>
      </Pressable>
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
  volver: {
    marginBottom: 16,
  },
  volverTexto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pasos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pasoCompleto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pasoCompletoCheck: {
    color: '#FFFFFF',
    backgroundColor: COLOR_PACIENTE,
    width: 16,
    height: 16,
    borderRadius: 8,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    marginRight: 6,
    overflow: 'hidden',
  },
  pasoCompletoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  pasoGuion: {
    color: '#B7C6E8',
    marginHorizontal: 4,
  },
  pasoActivo: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pasoActivoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  tarjetaSeleccionada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLOR_PACIENTE,
    padding: 14,
    marginBottom: 20,
  },
  tarjetaIcono: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tarjetaIconoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  avatarMedico: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B4B8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarMedicoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tarjetaTextos: {
    flex: 1,
  },
  tarjetaEtiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  tarjetaValor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 1,
  },
  tarjetaSubvalor: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  cambiar: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
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
});
