import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { DIRECCION_SEDE } from '@/datos/catalogo';

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

export const DIAS = proximosDias(4);

export function formatearFechaLarga(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaLocal = new Date(anio, mes - 1, dia);
  return `${DIAS_SEMANA[fechaLocal.getDay()]} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
}

export function formatearFechaCorta(fecha: string) {
  const [, mes, dia] = fecha.split('-');
  return `${dia}/${mes}`;
}

type Props = {
  fecha: string; // día seleccionado (AAAA-MM-DD)
  hora: string | null;
  ocupadas: string[]; // horas ya tomadas por otros turnos del médico ese día
  onElegirFecha: (fecha: string) => void;
  onElegirHora: (hora: string) => void;
};

// Selector de días + grilla de horarios mañana/tarde. Lo usan Sacar turno (paso 3) y Reprogramar.
export function SelectorHorario({ fecha, hora, ocupadas, onElegirFecha, onElegirHora }: Props) {
  function renderGrilla(turno: Horario['turno']) {
    return (
      <View style={styles.grillaHorarios}>
        {HORARIOS.filter((horario) => horario.turno === turno).map((horario) => {
          const seleccionado = horario.hora === hora;
          const disponible = horario.disponible && !ocupadas.includes(horario.hora);
          return (
            <Pressable
              key={horario.hora}
              disabled={!disponible}
              style={[
                styles.horarioBoton,
                seleccionado && styles.horarioBotonSeleccionado,
                !disponible && styles.horarioBotonDeshabilitado,
              ]}
              onPress={() => onElegirHora(horario.hora)}>
              <Text
                style={[
                  styles.horarioTexto,
                  seleccionado && styles.horarioTextoSeleccionado,
                  !disponible && styles.horarioTextoDeshabilitado,
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
    <View>
      <View style={styles.filaDias}>
        {DIAS.map((dia) => {
          const seleccionado = dia.fecha === fecha;
          return (
            <Pressable
              key={dia.fecha}
              disabled={!dia.disponible}
              style={[
                styles.diaCaja,
                seleccionado && styles.diaCajaSeleccionada,
                !dia.disponible && styles.diaCajaDeshabilitada,
              ]}
              onPress={() => onElegirFecha(dia.fecha)}>
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
        <Text style={styles.horariosTitulo}>Horarios del {formatearFechaLarga(fecha)}</Text>
        <Text style={styles.horariosSubtitulo}>Turnos de 20 minutos · {DIRECCION_SEDE}</Text>

        <Text style={styles.turnoLabel}>MAÑANA</Text>
        {renderGrilla('Mañana')}

        <Text style={styles.turnoLabel}>TARDE</Text>
        {renderGrilla('Tarde')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
