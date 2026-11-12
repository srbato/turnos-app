import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useErrores } from '@/contextos/ErroresContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { ofertasVigentes } from '@/datos/adelantos';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { Idioma, usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

function textoFecha(fecha: string, hora: string, idioma: Idioma) {
  return TEXTOS_PACIENTE[idioma].aviso.otroDia(detalleFecha(fecha, idioma).diaSemana, formatearFecha(fecha).slice(0, 5), hora);
}

// Ofertas de adelanto para el paciente: se ofrece un horario antes que su turno y puede aceptar (el turno se
// mueve) o rechazar (la oferta pasa al siguiente de la lista de espera).
export function OfertasAdelanto() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { turnos, misTurnos } = useTurnos();
  const { ofertas, aceptarOferta, rechazarOferta } = useAdelantos();
  const { mostrarError } = useErrores();

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
          <Text style={styles.etiqueta}>{t.adelanto.etiqueta}</Text>
          <Text style={styles.titulo}>{t.adelanto.titulo}</Text>
          <Text style={styles.medico}>{turno?.medico}</Text>

          <View style={styles.cambio}>
            <View style={styles.cambioItem}>
              <Text style={styles.cambioEtiqueta}>{t.adelanto.tuTurno}</Text>
              <Text style={styles.cambioFechaVieja}>{turno && textoFecha(turno.fecha, turno.hora, idioma)}</Text>
            </View>
            <Text style={styles.flecha}>→</Text>
            <View style={styles.cambioItem}>
              <Text style={styles.cambioEtiqueta}>{t.adelanto.nuevoHorario}</Text>
              <Text style={styles.cambioFechaNueva}>{textoFecha(oferta.horario.fecha, oferta.horario.hora, idioma)}</Text>
            </View>
          </View>

          <View style={styles.filaBotones}>
            <Pressable style={styles.botonSecundario} onPress={async () => mostrarError(await rechazarOferta(oferta))}>
              <Text style={styles.botonSecundarioTexto}>{t.adelanto.noGracias}</Text>
            </Pressable>
            <Pressable style={styles.botonPrimario} onPress={async () => mostrarError(await aceptarOferta(oferta))}>
              <Text style={styles.botonPrimarioTexto}>{t.adelanto.siAdelantar}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  tarjeta: {
    backgroundColor: c.chipAzul,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '700',
    color: c.acento,
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 18,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginTop: 4,
  },
  medico: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 2,
  },
  cambio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  cambioItem: {
    flex: 1,
  },
  cambioEtiqueta: {
    fontSize: 11,
    color: c.textoTenue,
  },
  cambioFechaVieja: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textoTenue,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  cambioFechaNueva: {
    fontSize: 13,
    fontWeight: '700',
    color: c.acento,
    marginTop: 2,
  },
  flecha: {
    fontSize: 18,
    color: c.acento,
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
    color: c.acento,
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
