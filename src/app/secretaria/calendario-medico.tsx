import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetalleTurnoSecretaria } from '@/components/detalle-turno-secretaria';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { NuevoTurnoSecretaria } from '@/components/nuevo-turno-secretaria';
import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { enLicencia, usePersonal } from '@/contextos/PersonalContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { atiendeEseDia } from '@/datos/atencion';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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
  const celdas: (string | null)[] = Array.from({ length: vacias }, () => null);
  for (let dia = 1; dia <= cantidadDias; dia++) {
    celdas.push(fechaComoTexto(new Date(anio, mes, dia)));
  }
  return celdas;
}

// Calendario personal de un médico: un mes por vez, con los días que atiende, los de licencia y cuántos turnos tiene
// cada día. Al tocar un día se ven sus turnos y se le puede dar uno nuevo.
export default function CalendarioMedico() {
  const { matricula } = useLocalSearchParams<{ matricula: string }>();
  const { medicos } = usePersonal();
  const { turnos } = useTurnos();
  const { consultorio } = useConsultorio();
  const { horarios } = useConfiguracion();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);
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
            <Text style={styles.volver}>‹ Personal</Text>
          </Pressable>
          <Text style={styles.detalle}>No se encontró al médico.</Text>
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
    return medico!.estado !== 'baja' && !enLicencia(medico, fecha) && atiendeEseDia(medico!.dias, fecha);
  }

  const turnosDelDia = turnosDelMedico.filter((t) => t.fecha === diaElegido).sort((a, b) => (a.hora < b.hora ? -1 : 1));
  const horasLibres = horarios.filter((h) => !turnosDelDia.some((t) => t.hora === h)).length;
  const deLicenciaEseDia = medico.estado === 'licencia' && enLicencia(medico, diaElegido);
  const atiendeEseDiaElegido = atiende(diaElegido);

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={volver} hitSlop={10}>
          <Text style={styles.volver}>‹ {medicoCorto(medico.nombre)}</Text>
        </Pressable>
        <Text style={styles.titulo}>Calendario de {medicoCorto(medico.nombre)}</Text>
        <Text style={styles.subtitulo}>
          {medico.especialidad} · atiende {medico.dias}
        </Text>

        <View style={styles.mesFila}>
          <Pressable style={styles.mesFlecha} onPress={() => cambiarMes(-1)} hitSlop={8}>
            <Text style={styles.mesFlechaTexto}>‹</Text>
          </Pressable>
          <Text style={styles.mesTitulo}>
            {MESES[mes]} {anio}
          </Text>
          <Pressable style={styles.mesFlecha} onPress={() => cambiarMes(1)} hitSlop={8}>
            <Text style={styles.mesFlechaTexto}>›</Text>
          </Pressable>
        </View>

        <View style={styles.calendario}>
          <View style={styles.semanaFila}>
            {DIAS_SEMANA.map((nombre) => (
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
                    {detalleFecha(fecha).dia}
                  </Text>
                  <Text style={[styles.celdaCantidad, seleccionado && styles.celdaTextoElegido]}>
                    {cantidad > 0 ? `${cantidad} t.` : ' '}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Text style={styles.leyenda}>Gris: no atiende ese día · Ámbar: de licencia · t. = turnos</Text>

        <View style={styles.diaCabecera}>
          <View style={styles.diaCabeceraTextos}>
            <Text style={styles.diaTitulo}>
              {detalleFecha(diaElegido).diaSemana} {formatearFecha(diaElegido).slice(0, 5)}
            </Text>
            <Text style={styles.detalle}>
              {deLicenciaEseDia
                ? 'De licencia este día.'
                : !atiendeEseDiaElegido
                  ? 'No atiende este día.'
                  : `${turnosDelDia.length} turno${turnosDelDia.length === 1 ? '' : 's'} · ${horasLibres} horarios libres`}
            </Text>
          </View>
          {atiendeEseDiaElegido && diaElegido >= HOY && (
            <Pressable style={styles.botonNuevo} onPress={() => setNuevoAbierto(true)}>
              <Text style={styles.botonNuevoTexto}>+ Turno</Text>
            </Pressable>
          )}
        </View>

        {turnosDelDia.length === 0 && atiendeEseDiaElegido && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>No tiene turnos este día.</Text>
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
                  {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}
                </Text>
                <Text style={styles.detalle} numberOfLines={1}>
                  {paciente?.cobertura}
                </Text>
              </View>
              <Text style={[styles.estado, { color }]}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
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
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  subtitulo: {
    fontSize: 13,
    color: '#5A5A5A',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mesFlechaTexto: {
    fontSize: 22,
    color: COLOR_SECRETARIA,
    fontWeight: '700',
  },
  mesTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calendario: {
    backgroundColor: '#FFFFFF',
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
    color: '#8A8A8A',
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
    backgroundColor: '#FBEFD2',
  },
  celdaSinAtencion: {
    backgroundColor: '#F1F1F1',
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
    color: '#1A1A1A',
  },
  celdaNumeroApagado: {
    color: '#B5B5B5',
  },
  celdaCantidad: {
    fontSize: 10,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  celdaTextoElegido: {
    color: '#FFFFFF',
  },
  leyenda: {
    fontSize: 11,
    color: '#8A8A8A',
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
    color: '#1A1A1A',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
  },
  tarjetaTurno: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  hora: {
    width: 46,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
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
    color: '#1A1A1A',
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
  },
});
