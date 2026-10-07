import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetalleOfertaSecretaria } from '@/components/detalle-oferta-secretaria';
import { DetalleTurnoSecretaria } from '@/components/detalle-turno-secretaria';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { apellidoDelMedico, NuevoTurnoSecretaria } from '@/components/nuevo-turno-secretaria';
import { COLOR_CANCELADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { enLicencia, horariosDelMedico, usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { ofertaDelHorario } from '@/datos/adelantos';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, fechaComoTexto } from '@/utilidades/turnos';
import { sinRepetidos } from '@/utilidades/listas';

const COLOR_AUSENTE = '#B03A3A';
const MAXIMO_MEDICOS = 4;
const DIAS_VISIBLES = 28; // 4 semanas hacia adelante

// Los próximos días a partir de hoy.
function diasDeLaSemana() {
  const hoy = new Date();
  const dias: string[] = [];
  for (let i = 0; i < DIAS_VISIBLES; i++) {
    dias.push(fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i)));
  }
  return dias;
}

// "Cardiología" -> "Cardiol"
function especialidadCorta(especialidad: string) {
  return especialidad.split(' ')[0].slice(0, 7);
}

// Grilla horario × médico: sirve para comparar agendas (por ejemplo, de la misma especialidad) y acomodar pacientes.
export default function CompararHorarios() {
  const { turnos } = useTurnos();
  const { ofertas } = useAdelantos();
  // Los médicos dados de baja ya no tienen agenda.
  const medicos = usePersonal().medicos.filter((medico) => medico.estado !== 'baja');
  const { consultorio } = useConsultorio();
  const { reglasRiesgo, duracionTurno } = useConfiguracion();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);

  const [diaElegido, setDiaElegido] = useState(HOY);
  // Columnas: por defecto, los 3 médicos activos con más turnos hoy.
  const [medicosElegidos, setMedicosElegidos] = useState<string[]>(() =>
    medicos
      .filter((medico) => !enLicencia(medico, HOY))
      .map((medico) => ({
        nombre: medico.nombre,
        cantidad: turnos.filter((t) => t.medico === medico.nombre && t.fecha === HOY && t.estado !== 'cancelado').length,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3)
      .map((medico) => medico.nombre)
  );
  const [eligiendoMedicos, setEligiendoMedicos] = useState(false);
  const [idTurnoSeleccionado, setIdTurnoSeleccionado] = useState('');
  const [idOfertaSeleccionada, setIdOfertaSeleccionada] = useState('');
  // Alta de turno tocando un horario libre: null = cerrado.
  const [nuevo, setNuevo] = useState<{ medico: string; hora: string } | null>(null);

  function turnoEn(medico: string, hora: string) {
    return turnos.find(
      (turno) => turno.medico === medico && turno.fecha === diaElegido && turno.hora === hora && turno.estado !== 'cancelado'
    );
  }

  function alternarMedico(nombre: string) {
    if (medicosElegidos.includes(nombre)) {
      if (medicosElegidos.length > 1) setMedicosElegidos(medicosElegidos.filter((m) => m !== nombre));
    } else if (medicosElegidos.length < MAXIMO_MEDICOS) {
      setMedicosElegidos([...medicosElegidos, nombre]);
    }
  }

  const columnas = medicos.filter((medico) => medicosElegidos.includes(medico.nombre));

  // Los horarios de cada médico elegido ese día, según sus franjas.
  function horariosDe(medico: string) {
    return horariosDelMedico(medicos, medico, diaElegido, duracionTurno);
  }

  // Filas: los horarios de todos los médicos elegidos más cualquier otro horario con turnos ese día.
  const horasDeLosMedicos: string[] = [];
  columnas.forEach((medico) => {
    horariosDe(medico.nombre).forEach((hora) => horasDeLosMedicos.push(hora));
  });
  const horasConTurno = turnos
    .filter((t) => t.fecha === diaElegido && t.estado !== 'cancelado' && medicosElegidos.includes(t.medico))
    .map((t) => t.hora);
  const filas = sinRepetidos([...horasDeLosMedicos, ...horasConTurno]).sort();

  function nombreAbreviado(idPaciente: string) {
    const paciente = pacientes.find((p) => p.id === idPaciente);
    return paciente ? `${paciente.nombre[0]}. ${paciente.apellido}` : 'Paciente';
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Pressable onPress={() => router.replace(RUTA_AGENDA_SECRETARIA)} hitSlop={10}>
          <Text style={styles.volver}>‹ Turnos del día</Text>
        </Pressable>
        <View style={styles.encabezadoFila}>
          <Text style={styles.titulo}>Comparar horarios</Text>
          <Pressable style={styles.chip} onPress={() => setEligiendoMedicos(true)}>
            <Text style={styles.chipTexto}>{medicosElegidos.length} médicos ▾</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semanaFila}>
          {diasDeLaSemana().map((dia) => {
            const seleccionado = dia === diaElegido;
            const cantidad = turnos.filter((t) => t.fecha === dia && t.estado !== 'cancelado').length;
            return (
              <Pressable
                key={dia}
                style={[styles.diaCaja, seleccionado && styles.diaCajaSeleccionada]}
                onPress={() => setDiaElegido(dia)}>
                <Text style={[styles.diaEtiqueta, seleccionado && styles.diaTextoSeleccionado]}>
                  {dia === HOY ? 'HOY' : detalleFecha(dia).diaSemana.slice(0, 3).toUpperCase()}
                </Text>
                <Text style={[styles.diaNumero, seleccionado && styles.diaTextoSeleccionado]}>{detalleFecha(dia).dia}</Text>
                <Text style={[styles.diaMes, seleccionado && styles.diaTextoSeleccionado]}>{detalleFecha(dia).mes}</Text>
                <Text style={[styles.diaCantidad, seleccionado && styles.diaTextoSeleccionado]}>{cantidad} t.</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.cabeceraColumnas}>
        <View style={styles.columnaHora} />
        {columnas.map((medico) => (
          <View key={medico.nombre} style={styles.columnaMedico}>
            <Text style={styles.medicoNombre} numberOfLines={1}>
              {apellidoDelMedico(medico.nombre)}
            </Text>
            <Text style={styles.medicoEspecialidad} numberOfLines={1}>
              {especialidadCorta(medico.especialidad)}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.grilla} contentContainerStyle={styles.grillaContenido}>
        {filas.map((hora) => (
          <View key={hora} style={styles.fila}>
            <View style={styles.columnaHora}>
              <Text style={styles.horaTexto}>{hora}</Text>
            </View>
            {columnas.map((medico) => {
              if (enLicencia(medico, diaElegido)) {
                return (
                  <View key={medico.nombre} style={[styles.celda, styles.celdaBloqueo]}>
                    <Text style={styles.celdaBloqueoTexto}>Licencia</Text>
                  </View>
                );
              }
              const turno = turnoEn(medico.nombre, hora);
              if (!turno) {
                // Horario ofrecido a la lista de espera: queda reservado hasta que el paciente responda.
                const oferta = ofertaDelHorario(ofertas, turnos, medico.nombre, diaElegido, hora);
                if (oferta) {
                  const idPaciente = turnos.find((t) => t.id === oferta.idTurno)?.idPaciente ?? '';
                  return (
                    <Pressable
                      key={medico.nombre}
                      style={[styles.celda, styles.celdaOfrecida]}
                      onPress={() => setIdOfertaSeleccionada(oferta.id)}>
                      <Text style={styles.celdaOfrecidaTitulo}>Ofrecido</Text>
                      <Text style={styles.celdaOfrecidaTexto} numberOfLines={1}>
                        a {nombreAbreviado(idPaciente)}
                      </Text>
                    </Pressable>
                  );
                }
                // Fuera de los horarios del médico no se puede asignar (si ya había un turno, se muestra igual).
                if (!horariosDe(medico.nombre).includes(hora)) {
                  return (
                    <View key={medico.nombre} style={[styles.celda, styles.celdaBloqueo]}>
                      <Text style={styles.celdaBloqueoTexto}>No atiende</Text>
                    </View>
                  );
                }
                return (
                  <Pressable
                    key={medico.nombre}
                    style={[styles.celda, styles.celdaLibre]}
                    onPress={() => setNuevo({ medico: medico.nombre, hora })}>
                    <Text style={styles.celdaLibreTexto}>Libre</Text>
                  </Pressable>
                );
              }
              const paciente = pacientes.find((p) => p.id === turno.idPaciente);
              const riesgo = paciente ? evaluarRiesgo(paciente, turnos, reglasRiesgo) : undefined;
              const riesgoAlto = riesgo?.nivel === 'alto' && (turno.estado === 'pendiente' || turno.estado === 'confirmado');
              let color = COLORES_ESTADO[turno.estado];
              if (riesgoAlto) {
                color = COLOR_CANCELADO;
              } else if (turno.estado === 'ausente') {
                color = COLOR_AUSENTE;
              }
              return (
                <Pressable
                  key={medico.nombre}
                  style={[styles.celda, { borderLeftColor: color }]}
                  onPress={() => setIdTurnoSeleccionado(turno.id)}>
                  <Text style={styles.celdaPaciente} numberOfLines={1}>
                    {nombreAbreviado(turno.idPaciente)}
                  </Text>
                  <Text style={[styles.celdaEstado, { color }]} numberOfLines={1}>
                    {riesgoAlto ? 'Riesgo alto' : ETIQUETAS_ESTADO[turno.estado]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <MenuSecretaria activa="agendas" />

      <DetalleOfertaSecretaria idOferta={idOfertaSeleccionada} onCerrar={() => setIdOfertaSeleccionada('')} />
      <DetalleTurnoSecretaria idTurno={idTurnoSeleccionado} onCerrar={() => setIdTurnoSeleccionado('')} />

      {nuevo && (
        <NuevoTurnoSecretaria
          fecha={diaElegido}
          medicoInicial={nuevo.medico}
          horaInicial={nuevo.hora}
          onCerrar={() => setNuevo(null)}
        />
      )}

      <Modal visible={eligiendoMedicos} animationType="fade" transparent onRequestClose={() => setEligiendoMedicos(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>Médicos en la grilla</Text>
            <Text style={styles.ayuda}>Elegí hasta {MAXIMO_MEDICOS}. Probá con médicos de la misma especialidad.</Text>
            {medicos.map((medico) => {
              const marcado = medicosElegidos.includes(medico.nombre);
              return (
                <Pressable key={medico.nombre} style={styles.filaMedico} onPress={() => alternarMedico(medico.nombre)}>
                  <View style={styles.filaMedicoTextos}>
                    <Text style={styles.filaMedicoNombre}>{medico.nombre}</Text>
                    <Text style={styles.filaMedicoDetalle}>
                      {medico.especialidad}
                      {medico.estado === 'licencia' ? ' · licencia' : ''}
                    </Text>
                  </View>
                  <View style={[styles.checkbox, marcado && styles.checkboxMarcado]}>
                    {marcado && <Text style={styles.checkboxTilde}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
            <Pressable style={styles.botonPrimario} onPress={() => setEligiendoMedicos(false)}>
              <Text style={styles.botonPrimarioTexto}>Listo</Text>
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
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_SECRETARIA,
  },
  encabezado: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },
  volver: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_SECRETARIA,
  },
  encabezadoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  semanaFila: {
    gap: 8,
    paddingVertical: 8,
  },
  diaCaja: {
    width: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  diaCajaSeleccionada: {
    backgroundColor: COLOR_SECRETARIA,
  },
  diaEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  diaNumero: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  diaMes: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  diaCantidad: {
    fontSize: 10,
    color: '#5A5A5A',
  },
  diaTextoSeleccionado: {
    color: '#FFFFFF',
  },
  cabeceraColumnas: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  columnaHora: {
    width: 40,
    justifyContent: 'center',
  },
  columnaMedico: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  medicoNombre: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  medicoEspecialidad: {
    fontSize: 10,
    color: '#5A5A5A',
  },
  grilla: {
    flex: 1,
  },
  grillaContenido: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  fila: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  horaTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  celda: {
    flex: 1,
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#B9DAD6',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  celdaLibre: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#9CCBC6',
    borderLeftWidth: 1,
    alignItems: 'center',
  },
  celdaLibreTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_SECRETARIA,
  },
  celdaOfrecida: {
    backgroundColor: '#FDF4DE',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0A123',
    borderLeftWidth: 1,
    alignItems: 'center',
  },
  celdaOfrecidaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A66F00',
  },
  celdaOfrecidaTexto: {
    fontSize: 11,
    color: '#A66F00',
    marginTop: 1,
  },
  celdaBloqueo: {
    backgroundColor: '#DDE9E7',
    borderLeftWidth: 1,
    alignItems: 'center',
  },
  celdaBloqueoTexto: {
    fontSize: 11,
    color: '#6E8C88',
  },
  celdaPaciente: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  celdaEstado: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ayuda: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 8,
  },
  filaMedico: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  filaMedicoTextos: {
    flex: 1,
  },
  filaMedicoNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filaMedicoDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLOR_SECRETARIA,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: COLOR_SECRETARIA,
  },
  checkboxTilde: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
