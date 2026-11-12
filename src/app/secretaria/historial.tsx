import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { COLOR_CANCELADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { EstadoTurno, HOY } from '@/datos/consultorio';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, formatearFecha } from '@/utilidades/turnos';
import { sinRepetidos } from '@/utilidades/listas';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

type Filtro = 'todos' | EstadoTurno;

// "Dra. Lucía Fernández" -> "Dra. Fernández"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Historial de turnos del consultorio: todo lo que ya pasó (atendidos, ausentes) y todo lo que se canceló, con el
// motivo cuando lo canceló el sistema o Secretaría por riesgo de inasistencia. Los turnos de hoy en adelante que siguen
// vigentes están en las agendas, no acá.
export default function HistorialTurnos() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const FILTROS: { id: Filtro; etiqueta: string }[] = [
    { id: 'todos', etiqueta: t.historial.filtros.todos },
    { id: 'atendido', etiqueta: t.historial.filtros.atendido },
    { id: 'ausente', etiqueta: t.historial.filtros.ausente },
    { id: 'cancelado', etiqueta: t.historial.filtros.cancelado },
  ];
  const { turnos } = useTurnos();
  const { consultorio } = useConsultorio();
  const pacientes = consultorio.pacientes;
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');

  function nombreDelPaciente(idPaciente: string) {
    const paciente = pacientes.find((p) => p.id === idPaciente);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : t.comun.paciente;
  }

  // Los horarios libres (turnos sin paciente) no son parte del historial.
  const delHistorial = turnos.filter(
    (turno) =>
      turno.idPaciente !== '' &&
      (turno.fecha < HOY || turno.estado === 'atendido' || turno.estado === 'ausente' || turno.estado === 'cancelado')
  );
  const texto = busqueda.trim().toLowerCase();
  const visibles = delHistorial
    .filter((turno) => filtro === 'todos' || turno.estado === filtro)
    .filter((turno) => `${nombreDelPaciente(turno.idPaciente)} ${turno.medico}`.toLowerCase().includes(texto))
    .sort((a, b) => (`${a.fecha} ${a.hora}` < `${b.fecha} ${b.hora}` ? 1 : -1)); // el más nuevo primero

  // Agrupados por día.
  const dias = sinRepetidos(visibles.map((turno) => turno.fecha));
  const cantidad = (estado: EstadoTurno) => delHistorial.filter((turno) => turno.estado === estado).length;

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/secretaria/alertas'))} hitSlop={10}>
          <Text style={styles.volver}>{t.historial.volver}</Text>
        </Pressable>
        <Text style={styles.titulo}>{t.historial.titulo}</Text>
        <Text style={styles.subtitulo}>{t.historial.subtitulo}</Text>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLORES_ESTADO.atendido }]}>{cantidad('atendido')}</Text>
            <Text style={styles.resumenTexto}>{t.historial.atendidos}</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLORES_ESTADO.ausente }]}>{cantidad('ausente')}</Text>
            <Text style={styles.resumenTexto}>{t.historial.noAsistieron}</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenNumero, { color: COLOR_CANCELADO }]}>{cantidad('cancelado')}</Text>
            <Text style={styles.resumenTexto}>{t.historial.cancelados}</Text>
          </View>
        </View>

        <TextInput
          style={styles.buscador}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder={t.historial.buscar}
          placeholderTextColor="#8FB9B5"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsFila}>
          {FILTROS.map((opcion) => (
            <Pressable
              key={opcion.id}
              style={[styles.chip, filtro === opcion.id && styles.chipActivo]}
              onPress={() => setFiltro(opcion.id)}>
              <Text style={[styles.chipTexto, filtro === opcion.id && styles.chipTextoActivo]}>{opcion.etiqueta}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibles.length === 0 && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>{t.historial.vacio}</Text>
          </View>
        )}

        {dias.map((dia) => (
          <View key={dia}>
            <Text style={styles.diaTitulo}>
              {detalleFecha(dia, idioma).diaSemana} {formatearFecha(dia)}
            </Text>
            {visibles
              .filter((turno) => turno.fecha === dia)
              .map((turno) => {
                const color = COLORES_ESTADO[turno.estado];
                return (
                  <Pressable
                    key={turno.id}
                    style={styles.tarjeta}
                    onPress={() => router.push({ pathname: '/secretaria/paciente', params: { id: turno.idPaciente } })}>
                    <Text style={styles.hora}>{turno.hora}</Text>
                    <View style={[styles.barra, { backgroundColor: color }]} />
                    <View style={styles.tarjetaTextos}>
                      <Text style={styles.paciente} numberOfLines={1}>
                        {nombreDelPaciente(turno.idPaciente)}
                      </Text>
                      <Text style={styles.detalle} numberOfLines={1}>
                        {medicoCorto(turno.medico)} · {turno.especialidad}
                      </Text>
                      {turno.motivoCancelacion !== undefined && (
                        <Text style={styles.motivo}>{turno.motivoCancelacion}</Text>
                      )}
                    </View>
                    <Text style={[styles.estado, { color }]}>{TEXTOS_PACIENTE[idioma].estados[turno.estado]}</Text>
                  </Pressable>
                );
              })}
          </View>
        ))}
      </ScrollView>

      <MenuSecretaria activa="alertas" />
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
    fontSize: 24,
    fontFamily: FUENTE_TITULOS,
    color: c.acento,
  },
  subtitulo: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 4,
    marginBottom: 14,
  },
  resumen: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  resumenItem: {
    flex: 1,
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 20,
    fontWeight: '700',
  },
  resumenTexto: {
    fontSize: 11,
    color: c.textoSecundario,
  },
  buscador: {
    backgroundColor: c.tarjeta,
    borderWidth: 1,
    borderColor: c.bordeAcento,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
  },
  chipsFila: {
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: c.bordeAcento,
    backgroundColor: c.tarjeta,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActivo: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: c.texto,
  },
  chipTextoActivo: {
    color: '#FFFFFF',
  },
  panel: {
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
  },
  diaTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginTop: 12,
    marginBottom: 8,
  },
  tarjeta: {
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
    marginRight: 8,
  },
  paciente: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 1,
  },
  motivo: {
    fontSize: 11,
    color: COLOR_CANCELADO,
    fontWeight: '600',
    marginTop: 4,
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
  },
});
