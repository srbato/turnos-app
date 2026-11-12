import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetalleTurnoSecretaria } from '@/components/detalle-turno-secretaria';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { NuevoTurnoSecretaria } from '@/components/nuevo-turno-secretaria';
import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { enLicencia, horariosDelMedico, usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { atiendeEseDia, textoDeDias } from '@/datos/atencion';
import { HOY } from '@/datos/consultorio';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';


// "Dr. Ricardo Paz" -> "Dr. Paz"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Las fechas del mes ('AAAA-MM-DD') con casilleros vacíos (null) al principio para que el 1 caiga en su día de la
// semana. La semana empieza en lunes.
function celdasDelMes(anio: number, mes: number) {
  const vacias = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const cantidadDias = new Date(anio, mes + 1, 0).getDate();
  const celdas: (string | null)[] = [];
  for (let i = 0; i < vacias; i++) {
    celdas.push(null);
  }
  for (let dia = 1; dia <= cantidadDias; dia++) {
    celdas.push(fechaComoTexto(new Date(anio, mes, dia)));
  }
  return celdas;
}

// Calendario personal de un médico: un mes por vez, con los días que atiende, los de licencia y cuántos turnos tiene
// cada día. Al tocar un día se ven sus turnos y se le puede dar uno nuevo.
export default function CalendarioMedico() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { matricula } = useLocalSearchParams<{ matricula: string }>();
  const { medicos } = usePersonal();
  const { turnos } = useTurnos();
  const { consultorio } = useConsultorio();
  const { duracionTurno } = useConfiguracion();
  const pacientes = consultorio.pacientes;
  const medico = medicos.find((m) => m.matricula === matricula);

  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [diaElegido, setDiaElegido] = useState(HOY);
  const [idTurnoSeleccionado, setIdTurnoSeleccionado] = useState('');
  const [nuevoAbierto, setNuevoAbierto] = useState(false);

  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/secretaria/personal');
    }
  }

  if (!medico) {
    return (
      <View style={styles.pantalla}>
        <ScrollView contentContainerStyle={styles.contenido}>
          <Pressable onPress={volver}>
            <Text style={styles.volver}>{t.comun.personal}</Text>
          </Pressable>
          <Text style={styles.detalle}>{t.comun.noEncontradoMedico}</Text>
        </ScrollView>
        <MenuSecretaria activa="personal" />
      </View>
    );
  }

  const turnosDelMedico = turnos.filter((t) => t.medico === medico.nombre && t.estado !== 'cancelado');
  const celdas = celdasDelMes(anio, mes);

  function cambiarMes(delta: number) {
    const nuevo = new Date(anio, mes + delta, 1);
    setAnio(nuevo.getFullYear());
    setMes(nuevo.getMonth());
  }

  // Un día se atiende si el médico no está de baja ni de licencia y ese día de la semana es de atención.
  function atiende(fecha: string) {
    return medico!.estado !== 'baja' && !enLicencia(medico, fecha) && atiendeEseDia(medico!.franjas, fecha);
  }

  const turnosDelDia = turnosDelMedico.filter((t) => t.fecha === diaElegido).sort((a, b) => (a.hora < b.hora ? -1 : 1));
  const horasLibres = horariosDelMedico(medicos, medico.nombre, diaElegido, duracionTurno).filter(
    (h) => !turnosDelDia.some((t) => t.hora === h)
  ).length;
  const deLicenciaEseDia = medico.estado === 'licencia' && enLicencia(medico, diaElegido);
  const atiendeEseDiaElegido = atiende(diaElegido);

  // Resumen del día elegido, debajo de la fecha.
  let textoDelDia = t.calendario.resumenDia(turnosDelDia.length, horasLibres);
  if (deLicenciaEseDia) {
    textoDelDia = t.calendario.deLicencia;
  } else if (!atiendeEseDiaElegido) {
    textoDelDia = t.calendario.noAtiende;
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={volver} hitSlop={10}>
          <Text style={styles.volver}>‹ {medicoCorto(medico.nombre)}</Text>
        </Pressable>
        <Text style={styles.titulo}>{t.calendario.titulo(medicoCorto(medico.nombre))}</Text>
        <Text style={styles.subtitulo}>
          {medico.especialidad} · {t.calendario.atiende(textoDeDias(medico.franjas, idioma))}
        </Text>

        <View style={styles.mesFila}>
          <Pressable style={styles.mesFlecha} onPress={() => cambiarMes(-1)} hitSlop={8}>
            <Text style={styles.mesFlechaTexto}>‹</Text>
          </Pressable>
          <Text style={styles.mesTitulo}>
            {t.nombresCalendario.meses[mes]} {anio}
          </Text>
          <Pressable style={styles.mesFlecha} onPress={() => cambiarMes(1)} hitSlop={8}>
            <Text style={styles.mesFlechaTexto}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calendario}>
          <View style={styles.semanaFila}>
            {t.nombresCalendario.semana.map((nombre) => (
              <Text key={nombre} style={styles.semanaDia}>
                {nombre}
              </Text>
            ))}
          </View>
          <View style={styles.grilla}>
            {celdas.map((fecha, indice) => {
              if (fecha === null) {
                return <View key={`vacia-${indice}`} style={styles.celda} />;
              }
              const cantidad = turnosDelMedico.filter((t) => t.fecha === fecha).length;
              const seleccionado = fecha === diaElegido;
              const licencia = medico.estado === 'licencia' && enLicencia(medico, fecha);
              const sinAtencion = !atiende(fecha) && !licencia;
              return (
                <Pressable
                  key={fecha}
                  style={[
                    styles.celda,
                    licencia && styles.celdaLicencia,
                    sinAtencion && styles.celdaSinAtencion,
                    fecha === HOY && styles.celdaHoy,
                    seleccionado && styles.celdaElegida,
                  ]}
                  onPress={() => setDiaElegido(fecha)}>
                  <Text
                    style={[
                      styles.celdaNumero,
                      sinAtencion && styles.celdaNumeroApagado,
                      seleccionado && styles.celdaTextoElegido,
                    ]}>
                    {detalleFecha(fecha, idioma).dia}
                  </Text>
                  <Text style={[styles.celdaCantidad, seleccionado && styles.celdaTextoElegido]}>
                    {cantidad > 0 ? t.calendario.cantidad(cantidad) : ' '}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Text style={styles.leyenda}>{t.calendario.leyenda}</Text>

        <View style={styles.diaCabecera}>
          <View style={styles.diaCabeceraTextos}>
            <Text style={styles.diaTitulo}>
              {detalleFecha(diaElegido, idioma).diaSemana} {formatearFecha(diaElegido).slice(0, 5)}
            </Text>
            <Text style={styles.detalle}>{textoDelDia}</Text>
          </View>
          {atiendeEseDiaElegido && diaElegido >= HOY && (
            <Pressable style={styles.botonNuevo} onPress={() => setNuevoAbierto(true)}>
              <Text style={styles.botonNuevoTexto}>{t.calendario.nuevo}</Text>
            </Pressable>
          )}
        </View>

        {turnosDelDia.length === 0 && atiendeEseDiaElegido && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>{t.calendario.sinTurnos}</Text>
          </View>
        )}
        {turnosDelDia.map((turno) => {
          const paciente = pacientes.find((p) => p.id === turno.idPaciente);
          const color = COLORES_ESTADO[turno.estado];
          return (
            <Pressable key={turno.id} style={styles.tarjetaTurno} onPress={() => setIdTurnoSeleccionado(turno.id)}>
              <Text style={styles.hora}>{turno.hora}</Text>
              <View style={[styles.barra, { backgroundColor: color }]} />
              <View style={styles.tarjetaTextos}>
                <Text style={styles.paciente} numberOfLines={1}>
                  {paciente ? `${paciente.nombre} ${paciente.apellido}` : t.comun.paciente}
                </Text>
                <Text style={styles.detalle} numberOfLines={1}>
                  {paciente?.cobertura}
                </Text>
              </View>
              <Text style={[styles.estado, { color }]}>{TEXTOS_PACIENTE[idioma].estados[turno.estado]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <MenuSecretaria activa="personal" />

      <DetalleTurnoSecretaria idTurno={idTurnoSeleccionado} onCerrar={() => setIdTurnoSeleccionado('')} />

      {nuevoAbierto && (
        <NuevoTurnoSecretaria
          fecha={diaElegido}
          medicoInicial={medico.nombre}
          horaInicial=""
          onCerrar={() => setNuevoAbierto(false)}
        />
      )}
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
  },
  contenido: {
    padding: 18,
    paddingBottom: 24,
  },
  volver: {
    fontSize: 15,
    fontWeight: '700',
    color: c.acento,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontFamily: FUENTE_TITULOS,
    color: c.acento,
  },
  subtitulo: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 2,
  },
  mesFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  mesFlecha: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: c.tarjeta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesFlechaTexto: {
    fontSize: 22,
    color: c.acento,
    fontWeight: '700',
  },
  mesTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: c.texto,
  },
  calendario: {
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    padding: 8,
  },
  semanaFila: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  semanaDia: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: c.textoTenue,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Cada casillero ocupa 1/7 del ancho (14.28%).
  celda: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  celdaLicencia: {
    backgroundColor: c.ambar,
  },
  celdaSinAtencion: {
    backgroundColor: c.relleno,
  },
  celdaHoy: {
    borderColor: COLOR_SECRETARIA,
  },
  celdaElegida: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  celdaNumero: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  celdaNumeroApagado: {
    color: '#B5B5B5',
  },
  celdaCantidad: {
    fontSize: 10,
    fontWeight: '700',
    color: c.acento,
  },
  celdaTextoElegido: {
    color: '#FFFFFF',
  },
  leyenda: {
    fontSize: 11,
    color: c.textoTenue,
    marginTop: 8,
  },
  diaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  diaCabeceraTextos: {
    flex: 1,
  },
  diaTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: c.texto,
  },
  botonNuevo: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botonNuevoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  panel: {
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
  },
  tarjetaTurno: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  hora: {
    width: 46,
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  barra: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  tarjetaTextos: {
    flex: 1,
  },
  paciente: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
  },
});
