import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { HOY, ID_PACIENTE_APP } from '@/datos/consultorio';
import { detalleFecha, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';

// "Hoy 10:00 h", "Mañana 10:00 h" o "Jue 15/10 · 10:00 h".
function cuando(fecha: string, hora: string) {
  const hoy = new Date();
  const manana = fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));
  if (fecha === HOY) return `hoy ${hora} h`;
  if (fecha === manana) return `mañana ${hora} h`;
  return `${detalleFecha(fecha).diaSemana.slice(0, 3)} ${formatearFecha(fecha).slice(0, 5)} · ${hora} h`;
}

// Cartel de "Confirmá tu turno": aparece cuando Secretaría le mandó al paciente un aviso por un turno que sigue pendiente.
// Si ya recibió los avisos necesarios y su historial es de riesgo alto, el cartel pasa a rojo y avisa que el turno puede
// reprogramarse (sin hablar de puntos ni de riesgo: dice el hecho, no lo etiqueta).
export function AvisoConfirmar() {
  const { turnos, misTurnos, cambiarEstadoTurno, cancelarTurno } = useTurnos();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo, avisosAntesDeActuar } = useConfiguracion();

  const paciente = consultorio.pacientes.find((p) => p.id === ID_PACIENTE_APP);
  const riesgoAlto = paciente !== undefined && evaluarRiesgo(paciente, turnos, reglasRiesgo).nivel === 'alto';

  const conAviso = misTurnos.filter(
    (turno) => turno.estado === 'pendiente' && turno.fecha >= HOY && (turno.avisos?.length ?? 0) > 0
  );

  if (conAviso.length === 0) {
    return null;
  }

  return (
    <View>
      {conAviso.map((turno) => {
        const urgente = riesgoAlto && (turno.avisos?.length ?? 0) >= avisosAntesDeActuar;
        const color = urgente ? COLOR_CANCELADO : COLOR_PACIENTE;
        return (
          <View
            key={turno.id}
            style={[styles.tarjeta, urgente ? styles.tarjetaUrgente : { borderColor: COLOR_PACIENTE }]}>
            <Text style={[styles.etiqueta, { color }]}>{urgente ? 'ÚLTIMO AVISO' : 'AVISO DEL CONSULTORIO'}</Text>
            <Text style={styles.titulo}>{urgente ? 'Tu turno puede perderse' : 'Confirmá tu turno'}</Text>
            <Text style={styles.detalle}>
              {turno.medico} · {cuando(turno.fecha, turno.hora)}
            </Text>
            <Text style={styles.texto}>
              {urgente
                ? `Ya te avisamos ${turno.avisos?.length} veces y no lo confirmaste. Si no lo confirmás, el consultorio puede reprogramarlo para dárselo a otra persona.`
                : 'El consultorio te pidió que confirmes que vas a ir. Así el horario no se pierde.'}
            </Text>

            <View style={styles.filaBotones}>
              <Pressable style={styles.botonSecundario} onPress={() => cancelarTurno(turno.id)}>
                <Text style={[styles.botonSecundarioTexto, { color }]}>{urgente ? 'Cancelar turno' : 'No puedo ir'}</Text>
              </Pressable>
              <Pressable
                style={[styles.botonPrimario, { backgroundColor: color }]}
                onPress={() => cambiarEstadoTurno(turno.id, 'confirmado')}>
                <Text style={styles.botonPrimarioTexto}>{urgente ? 'Confirmar ahora' : 'Confirmar turno'}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: FONDO_PACIENTE,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  tarjetaUrgente: {
    backgroundColor: '#FBDCDC',
    borderColor: COLOR_CANCELADO,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  detalle: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  texto: {
    fontSize: 13,
    color: '#1A1A1A',
    marginTop: 10,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
