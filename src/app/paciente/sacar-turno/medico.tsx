import { Redirect, router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ResumenEspecialidad } from '@/components/resumen-turno';
import { COLOR_MEDICO, FONDO_PACIENTE } from '@/constantes/colores';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { aceptaTurnos, fechaDeVuelta, usePersonal } from '@/contextos/PersonalContext';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { formatearFecha } from '@/utilidades/turnos';
import { coberturaQueAtiende, medicosDelCatalogo, medicosParaPaciente, Medico } from '@/datos/catalogo';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

export default function ElegirMedico() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { especialidad, elegirMedico } = useSacarTurno();
  const { coberturaIds } = usePerfilPaciente();
  const { coberturas } = useConsultorio();
  const { medicos: personal } = usePersonal();

  // Si se entra a esta URL directo (sin haber elegido especialidad), se vuelve al paso 1.
  if (!especialidad) {
    return <Redirect href="/paciente/sacar-turno" />;
  }

  // Solo los médicos que aceptan alguna cobertura del paciente y que atienden ahora (no de licencia ni de baja).
  const medicos = medicosParaPaciente(medicosDelCatalogo(personal), especialidad.id, coberturaIds).filter((medico) =>
    aceptaTurnos(personal, medico.nombre)
  );

  function elegir(medico: Medico) {
    elegirMedico(medico);
    router.push('/paciente/sacar-turno/horario');
  }

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      data={medicos}
      keyExtractor={(medico) => medico.id}
      ListHeaderComponent={
        <View>
          <ResumenEspecialidad
            especialidad={especialidad}
            onCambiar={() => router.dismissTo('/paciente/sacar-turno')}
          />
          <Text style={styles.titulo}>{t.sacarTurno.elegirProfesional}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>
            {coberturaIds.length === 0
              ? t.sacarTurno.sinObraSocial
              : t.sacarTurno.sinProfesionales(especialidad.nombre)}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.tarjeta} onPress={() => elegir(item)}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{item.iniciales}</Text>
          </View>
          <View style={styles.textos}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.cobertura}>{t.sacarTurno.atiende(coberturaQueAtiende(item, coberturaIds, coberturas))}</Text>
            {fechaDeVuelta(personal, item.nombre) && (
              <Text style={styles.licencia}>
                {t.sacarTurno.deLicencia(formatearFecha(fechaDeVuelta(personal, item.nombre) ?? '').slice(0, 5))}
              </Text>
            )}
          </View>
          <Text style={styles.flecha}>›</Text>
        </Pressable>
      )}
    />
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  licencia: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A66F00',
    marginTop: 2,
  },
  pantalla: {
    flex: 1,
    backgroundColor: c.fondo,
  },
  contenido: {
    padding: 20,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '600',
    color: c.textoSecundario,
    marginBottom: 12,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_MEDICO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  cobertura: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 2,
  },
  flecha: {
    fontSize: 22,
    color: '#B7C6E8',
  },
  vacio: {
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    padding: 20,
  },
  vacioTexto: {
    fontSize: 14,
    color: c.textoSecundario,
    textAlign: 'center',
  },
});
