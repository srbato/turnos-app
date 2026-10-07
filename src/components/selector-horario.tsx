import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { horariosDelMedico, usePersonal } from '@/contextos/PersonalContext';

type DiaDisponible = {
  fecha: string; // AAAA-MM-DD
  etiquetaDia: string;
  numero: number;
  mes: string; // abreviado (OCT)
  disponible: boolean;
};

type Franja = 'Mañana' | 'Tarde';

type Horario = {
  hora: string;
  turno: Franja;
  disponible: boolean;
};

const DIAS_SEMANA_CORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES_CORTO = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// primerDia: si se pasa (por ejemplo, el día en que vuelve un médico de licencia) y es posterior a mañana, los días
// arrancan ahí.
// Cantidad de días de la tanda corta (la que usan los demás). Sacar turno y Reprogramar muestran 4 semanas.
const CANTIDAD_CORTA = 4;
export const DIAS_OFRECIDOS = 28;

function proximosDias(cantidad: number, primerDia?: string): DiaDisponible[] {
  const dias: DiaDisponible[] = [];
  const hoy = new Date();
  let desde = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  if (primerDia) {
    const [anio, mes, dia] = primerDia.split('-').map(Number);
    const pedido = new Date(anio, mes - 1, dia);
    if (pedido > desde) desde = pedido;
  }
  for (let i = 1; i <= cantidad; i++) {
    const fecha = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i - 1);
    dias.push({
      fecha: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`,
      etiquetaDia: DIAS_SEMANA_CORTO[fecha.getDay()],
      numero: fecha.getDate(),
      mes: MESES_CORTO[fecha.getMonth()],
      // En la tanda corta de 4 días, el último queda sin cupos para mostrar el estado deshabilitado.
      disponible: cantidad > CANTIDAD_CORTA || i !== cantidad,
    });
  }
  return dias;
}

export const DIAS = proximosDias(CANTIDAD_CORTA);

// Los días que se ofrecen, a partir de primerDia (o de mañana si no se pasa).
export function diasDesde(primerDia?: string, cantidad: number = CANTIDAD_CORTA) {
  return proximosDias(cantidad, primerDia);
}

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
  medico: string; // nombre del médico: los horarios son los suyos
  fecha: string; // día seleccionado (AAAA-MM-DD)
  hora: string | null;
  ocupadas: string[]; // horas ya tomadas por otros turnos del médico ese día
  onElegirFecha: (fecha: string) => void;
  onElegirHora: (hora: string) => void;
  color?: string; // color del rol para lo seleccionado (por defecto, el del paciente)
  primerDia?: string; // primer día que se ofrece (por defecto, mañana)
  cantidadDias?: number; // cuántos días se ofrecen (por defecto 4; Sacar turno y Reprogramar usan 28)
  atiende?: (fecha: string) => boolean; // si se pasa, los días en que el médico no atiende quedan deshabilitados
};

// Selector de días + grilla de horarios mañana/tarde. Lo usan Sacar turno (paso 3) y Reprogramar.
export function SelectorHorario({
  medico,
  fecha,
  hora,
  ocupadas,
  onElegirFecha,
  onElegirHora,
  color = COLOR_PACIENTE,
  primerDia,
  cantidadDias = CANTIDAD_CORTA,
  atiende,
}: Props) {
  const { duracionTurno, direccion } = useConfiguracion();
  const { medicos } = usePersonal();
  // Los horarios del médico ese día (los mismos que ven Secretaría y el médico en sus agendas), según la duración que
  // configuró Secretaría. Cuáles están libres depende de los turnos del médico ese día.
  const HORARIOS: Horario[] = horariosDelMedico(medicos, medico, fecha, duracionTurno).map((hora) => ({
    hora,
    turno: hora < '13:00' ? 'Mañana' : 'Tarde',
    disponible: true,
  }));
  const hayManana = HORARIOS.some((horario) => horario.turno === 'Mañana');
  const hayTarde = HORARIOS.some((horario) => horario.turno === 'Tarde');
  const dias = diasDesde(primerDia, cantidadDias);
  // Con más de 4 días, la fila se desliza hacia el costado.
  const deslizable = dias.length > CANTIDAD_CORTA;
  function renderGrilla(turno: Franja) {
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
                seleccionado && { backgroundColor: color, borderColor: color },
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
      <ScrollView
        horizontal={deslizable}
        scrollEnabled={deslizable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filaDias}
        style={styles.contenedorDias}>
        {dias.map((dia) => {
          const seleccionado = dia.fecha === fecha;
          const habilitado = dia.disponible && (atiende === undefined || atiende(dia.fecha));
          return (
            <Pressable
              key={dia.fecha}
              disabled={!habilitado}
              style={[
                styles.diaCaja,
                deslizable && styles.diaCajaFija,
                seleccionado && styles.diaCajaSeleccionada,
                seleccionado && { backgroundColor: color },
                !habilitado && styles.diaCajaDeshabilitada,
              ]}
              onPress={() => onElegirFecha(dia.fecha)}>
              <Text
                style={[
                  styles.diaEtiqueta,
                  seleccionado && styles.diaTextoSeleccionado,
                  !habilitado && styles.diaTextoDeshabilitado,
                ]}>
                {dia.etiquetaDia}
              </Text>
              <Text
                style={[
                  styles.diaNumero,
                  seleccionado && styles.diaTextoSeleccionado,
                  !habilitado && styles.diaTextoDeshabilitado,
                ]}>
                {dia.numero}
              </Text>
              {deslizable && (
                <Text
                  style={[
                    styles.diaMes,
                    seleccionado && styles.diaTextoSeleccionado,
                    !habilitado && styles.diaTextoDeshabilitado,
                  ]}>
                  {dia.mes}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.tarjetaHorarios}>
        <Text style={styles.horariosTitulo}>Horarios del {formatearFechaLarga(fecha)}</Text>
        <Text style={styles.horariosSubtitulo}>Turnos de {duracionTurno} minutos · {direccion}</Text>

        {HORARIOS.length === 0 && <Text style={styles.sinHorarios}>El médico no atiende este día.</Text>}

        {hayManana && <Text style={styles.turnoLabel}>MAÑANA</Text>}
        {hayManana && renderGrilla('Mañana')}

        {hayTarde && <Text style={styles.turnoLabel}>TARDE</Text>}
        {hayTarde && renderGrilla('Tarde')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sinHorarios: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 12,
  },
  contenedorDias: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filaDias: {
    flexDirection: 'row',
    gap: 10,
  },
  // Con muchos días, cada caja tiene ancho fijo (sin estirarse) y la fila se desliza.
  diaCajaFija: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: 64,
  },
  diaMes: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
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
