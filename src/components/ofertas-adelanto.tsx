import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { ofertasVigentes } from '@/datos/adelantos';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

function textoFecha(fecha: string, hora: string) {
  return `${detalleFecha(fecha).diaSemana} ${formatearFecha(fecha).slice(0, 5)} · ${hora} h`;
}

// Ofertas de adelanto para el paciente: se ofrece un horario antes que su turno y puede aceptar (el turno se
// mueve) o rechazar (la oferta pasa al siguiente de la lista de espera).
export function OfertasAdelanto() {
  const { turnos, misTurnos } = useTurnos();
  const { ofertas, aceptarOferta, rechazarOferta } = useAdelantos();

  // Las ofertas esperando respuesta para turnos de este paciente (como mucho una por turno).
  const mias = ofertasVigentes(ofertas, turnos)
    .map((oferta) => ({ oferta, turno: misTurnos.find((t) => t.id === oferta.idTurno) }))
    .filter((item) => item.turno !== undefined);

  if (mias.length === 0) {
    return null;
  }

  return (
    <View>
      {mias.map(({ oferta, turno }) => (
        <View key={oferta.id} style={styles.tarjeta}>
          <Text style={styles.etiqueta}>SE LIBERÓ UN HORARIO ANTES</Text>
          <Text style={styles.titulo}>¿Querés adelantar tu turno?</Text>
          <Text style={styles.medico}>{turno?.medico}</Text>

          <View style={styles.cambio}>
            <View style={styles.cambioItem}>
              <Text style={styles.cambioEtiqueta}>Tu turno</Text>
              <Text style={styles.cambioFechaVieja}>{turno && textoFecha(turno.fecha, turno.hora)}</Text>
            </View>
            <Text style={styles.flecha}>→</Text>
            <View style={styles.cambioItem}>
              <Text style={styles.cambioEtiqueta}>Nuevo horario</Text>
              <Text style={styles.cambioFechaNueva}>{textoFecha(oferta.horario.fecha, oferta.horario.hora)}</Text>
            </View>
          </View>

          <View style={styles.filaBotones}>
            <Pressable style={styles.botonSecundario} onPress={() => rechazarOferta(oferta)}>
              <Text style={styles.botonSecundarioTexto}>No, gracias</Text>
            </Pressable>
            <Pressable style={styles.botonPrimario} onPress={() => aceptarOferta(oferta)}>
              <Text style={styles.botonPrimarioTexto}>Sí, adelantar</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: FONDO_PACIENTE,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 18,
    fontFamily: FUENTE_TITULOS,
    color: '#1A1A1A',
    marginTop: 4,
  },
  medico: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  cambio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  cambioItem: {
    flex: 1,
  },
  cambioEtiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  cambioFechaVieja: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  cambioFechaNueva: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PACIENTE,
    marginTop: 2,
  },
  flecha: {
    fontSize: 18,
    color: COLOR_PACIENTE,
    marginHorizontal: 8,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
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
    color: COLOR_PACIENTE,
    fontSize: 14,
    fontWeight: '700',
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
});
