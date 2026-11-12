import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useErrores } from '@/contextos/ErroresContext';
import { useSesion } from '@/contextos/SesionContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { HOY } from '@/datos/consultorio';
import { detalleFecha, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { Idioma, usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// "Hoy 10:00 h", "Mañana 10:00 h" o "Jue 15/10 · 10:00 h".
function cuando(fecha: string, hora: string, idioma: Idioma) {
  const textos = TEXTOS_PACIENTE[idioma].aviso;
  const hoy = new Date();
  const manana = fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));
  if (fecha === HOY) return textos.hoy(hora);
  if (fecha === manana) return textos.manana(hora);
  return textos.otroDia(detalleFecha(fecha, idioma).diaSemana.slice(0, 3), formatearFecha(fecha).slice(0, 5), hora);
}

// Cartel de "Confirmá tu turno": aparece cuando Secretaría le mandó al paciente un aviso por un turno que sigue pendiente.
// Si ya recibió los avisos necesarios y su historial es de riesgo alto, el cartel pasa a rojo y avisa que el turno puede
// reprogramarse (sin hablar de puntos ni de riesgo: dice el hecho, no lo etiqueta).
export function AvisoConfirmar() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { turnos, misTurnos, cambiarEstadoTurno, cancelarTurno } = useTurnos();
  const { mostrarError } = useErrores();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo, avisosAntesDeActuar } = useConfiguracion();
  const { idPaciente } = useSesion();

  const paciente = consultorio.pacientes.find((p) => p.id === idPaciente);
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
            <Text style={[styles.etiqueta, { color }]}>{urgente ? t.aviso.ultimoAviso : t.aviso.avisoConsultorio}</Text>
            <Text style={styles.titulo}>{urgente ? t.aviso.puedePerderse : t.aviso.confirmaTurno}</Text>
            <Text style={styles.detalle}>
              {turno.medico} · {cuando(turno.fecha, turno.hora, idioma)}
            </Text>
            <Text style={styles.texto}>
              {urgente
                ? t.aviso.textoUrgente(turno.avisos?.length ?? 0)
                : t.aviso.textoNormal}
            </Text>

            <View style={styles.filaBotones}>
              <Pressable style={styles.botonSecundario} onPress={async () => mostrarError(await cancelarTurno(turno.id))}>
                <Text style={[styles.botonSecundarioTexto, { color }]}>{urgente ? t.comun.cancelarTurno : t.aviso.noPuedoIr}</Text>
              </Pressable>
              <Pressable
                style={[styles.botonPrimario, { backgroundColor: color }]}
                onPress={async () => mostrarError(await cambiarEstadoTurno(turno.id, 'confirmado'))}>
                <Text style={styles.botonPrimarioTexto}>{urgente ? t.aviso.confirmarAhora : t.aviso.confirmarTurno}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  tarjeta: {
    backgroundColor: c.chipAzul,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  tarjetaUrgente: {
    backgroundColor: c.chipRojo,
    borderColor: COLOR_CANCELADO,
  },
  etiqueta: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 18,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginTop: 4,
  },
  detalle: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 2,
  },
  texto: {
    fontSize: 13,
    color: c.texto,
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
    backgroundColor: c.tarjeta,
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
