import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { NuevoTurnoSecretaria } from '@/components/nuevo-turno-secretaria';
import { TablaPacientes } from '@/components/tabla-pacientes';
import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';

// Tabla de todos los pacientes del consultorio. Tocar una fila abre el alta de turno con ese paciente ya elegido.
export default function PacientesSecretaria() {
  const { consultorio } = useConsultorio();
  const { nombre: nombreConsultorio } = useConfiguracion();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);
  const [idPacienteElegido, setIdPacienteElegido] = useState('');

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        {/* Se llega desde el botón Pacientes de Agendas: la flecha vuelve ahí, aunque se haya entrado por URL. */}
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace(RUTA_AGENDA_SECRETARIA))} hitSlop={10}>
          <Text style={styles.volver}>‹ Turnos del día</Text>
        </Pressable>
        <Text style={styles.subtitulo}>{nombreConsultorio}</Text>
        <Text style={styles.titulo}>Pacientes</Text>
      </View>

      <TablaPacientes
        pacientes={pacientes}
        color={COLOR_SECRETARIA}
        onElegir={(paciente) => setIdPacienteElegido(paciente.id)}
        onVerFicha={(paciente) => router.push({ pathname: '/secretaria/paciente', params: { id: paciente.id } })}
      />

      <MenuSecretaria />

      {idPacienteElegido !== '' && (
        <NuevoTurnoSecretaria
          fecha={HOY}
          medicoInicial=""
          horaInicial=""
          idPacienteInicial={idPacienteElegido}
          onCerrar={() => setIdPacienteElegido('')}
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
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLOR_SECRETARIA,
  },
  volver: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 13,
    color: '#CFEDEA',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
});
