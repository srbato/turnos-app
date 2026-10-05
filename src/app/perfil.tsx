import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPaciente } from '@/components/avatar-paciente';
import { BarraPerfil } from '@/components/barra-perfil';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { TEMA_CLARO, TEMA_OSCURO, type Tema } from '@/constantes/tema';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreferencias, type Idioma } from '@/contextos/PreferenciasContext';
import { nombreCobertura } from '@/datos/catalogo';
import { TEXTOS_PERFIL } from '@/datos/textos-perfil';

const ROLES = ['paciente', 'medico', 'secretaria', 'administrador'] as const;
type Rol = (typeof ROLES)[number];

function normalizarRol(valor: string | string[] | undefined): Rol {
  const candidato = Array.isArray(valor) ? valor[0] : valor;
  return (ROLES as readonly string[]).includes(candidato ?? '') ? (candidato as Rol) : 'paciente';
}

type InfoPerfil = {
  nombre: string;
  iniciales: string;
  email: string;
};

const PERFILES: Record<Rol, InfoPerfil> = {
  paciente: {
    nombre: 'Valentín',
    iniciales: 'VM',
    email: 'valentin@test.com',
  },
  medico: {
    nombre: 'Dra. Lucía Fernández',
    iniciales: 'LF',
    email: 'lucia.fernandez@consultoriosrivadavia.com',
  },
  secretaria: {
    nombre: 'Norma Aguilar',
    iniciales: 'NA',
    email: 'norma.aguilar@consultoriosrivadavia.com',
  },
  administrador: {
    nombre: 'Gustavo Aráoz',
    iniciales: 'GA',
    email: 'gustavo.araoz@consultoriosrivadavia.com',
  },
};

const IDIOMAS: { id: Idioma; etiqueta: string }[] = [
  { id: 'es', etiqueta: 'Español' },
  { id: 'en', etiqueta: 'English' },
];

const COLOR_PERFIL = '#C9A24C';

export default function Perfil() {
  const { rol: rolParam } = useLocalSearchParams();
  const rol = normalizarRol(rolParam);
  const perfilPaciente = usePerfilPaciente();
  // El paciente edita su perfil: sus datos vienen del contexto. Los demás roles usan datos fijos.
  const info = rol === 'paciente' ? { ...PERFILES.paciente, ...perfilPaciente } : PERFILES[rol];

  // Las preferencias vienen del contexto: se guardan en el dispositivo y se aplican acá.
  const { idioma, modoOscuro, recordatorios, cambiarIdioma, alternarModoOscuro, alternarRecordatorios } =
    usePreferencias();
  const tema = modoOscuro ? TEMA_OSCURO : TEMA_CLARO;
  const textos = TEXTOS_PERFIL[idioma];

  // El paciente muestra las obras sociales que eligió en Editar perfil.
  const obrasSociales = perfilPaciente.coberturaIds.map(nombreCobertura);
  const chip =
    rol === 'paciente'
      ? `${textos.roles.paciente}${obrasSociales.length > 0 ? ' · ' + obrasSociales[0] : ''}`
      : textos.chips[rol];
  const filaSubtitulo =
    rol === 'paciente' ? obrasSociales.join(' · ') || '—' : textos.filaSubtitulos[rol];

  const [alertasMedicacion, setAlertasMedicacion] = useState(true);

  // Solo el paciente tiene editor de perfil por ahora; para los demás roles estas filas no hacen nada.
  const irAlEditor =
    rol === 'paciente' ? () => router.push('/paciente/editar-perfil' as Href) : undefined;

  return (
    <View style={[styles.pantalla, { backgroundColor: tema.fondo }]}>
      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoInterno}>
        <View style={styles.encabezado}>
          <Text style={[styles.tituloPantalla, { color: tema.texto }]}>{textos.tituloPantalla}</Text>
        </View>

        <View style={styles.filaPerfil}>
          {rol === 'paciente' ? (
            <View style={styles.avatarPaciente}>
              <AvatarPaciente tamano={64} colorTexto={COLOR_PERFIL} colorBorde={COLOR_PERFIL} />
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{info.iniciales}</Text>
            </View>
          )}
          <View style={styles.datosPerfil}>
            <Text style={[styles.nombre, { color: tema.texto }]}>{info.nombre}</Text>
            <Text style={[styles.email, { color: tema.textoSecundario }]}>{info.email}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipTexto}>{chip}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          {/* El editor es solo del paciente por ahora. */}
          {rol === 'paciente' && (
            <>
              <Fila
                tema={tema}
                titulo={textos.editarPerfil}
                subtitulo={textos.editarPerfilDetalle}
                conFlecha
                onPress={irAlEditor}
              />
              <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
            </>
          )}
          <Fila
            tema={tema}
            titulo={textos.datosPersonales}
            subtitulo={textos.datosPersonalesDetalle}
            conFlecha
            onPress={irAlEditor}
          />
          <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
          <Fila
            tema={tema}
            titulo={textos.filaTitulos[rol]}
            subtitulo={filaSubtitulo}
            conFlecha
            onPress={irAlEditor}
          />
          <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
          <Fila
            tema={tema}
            titulo={textos.seguridad}
            subtitulo={textos.seguridadDetalle}
            conFlecha
            onPress={irAlEditor}
          />
        </View>

        <Text style={[styles.seccionTitulo, { color: tema.textoSecundario }]}>
          {textos.preferencias}
        </Text>
        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          <View style={styles.filaToggle}>
            <View style={styles.filaTextos}>
              <Text style={[styles.filaTitulo, { color: tema.texto }]}>{textos.idioma}</Text>
              <Text style={[styles.filaSubtitulo, { color: tema.textoSecundario }]}>
                {textos.idiomaDetalle}
              </Text>
            </View>
            <View style={styles.selectorIdioma}>
              {IDIOMAS.map((opcion) => {
                const seleccionado = opcion.id === idioma;
                return (
                  <Pressable
                    key={opcion.id}
                    style={[
                      styles.opcionIdioma,
                      { borderColor: COLOR_PERFIL },
                      seleccionado && styles.opcionIdiomaActiva,
                    ]}
                    onPress={() => cambiarIdioma(opcion.id)}>
                    <Text
                      style={[
                        styles.opcionIdiomaTexto,
                        seleccionado && styles.opcionIdiomaTextoActivo,
                      ]}>
                      {opcion.etiqueta}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
          <FilaToggle
            tema={tema}
            titulo={textos.modoOscuro}
            subtitulo={textos.modoOscuroDetalle}
            activo={modoOscuro}
            onCambiar={alternarModoOscuro}
          />
          <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
          <FilaToggle
            tema={tema}
            titulo={textos.recordatorios}
            subtitulo={textos.recordatoriosDetalle}
            activo={recordatorios}
            onCambiar={alternarRecordatorios}
          />
          {/* Las alertas de medicación (interacciones) son para el médico: el paciente no las ve. */}
          {rol !== 'paciente' && (
            <>
              <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
              <FilaToggle
                tema={tema}
                titulo={textos.alertas}
                subtitulo={textos.alertasDetalle}
                activo={alertasMedicacion}
                onCambiar={() => setAlertasMedicacion(!alertasMedicacion)}
              />
            </>
          )}
        </View>

        {/* El rol se lee de la cuenta: el paciente no elige ni cambia de perfil. */}
        {rol !== 'paciente' && (
          <Pressable
            style={[styles.filaCambiarPerfil, { backgroundColor: tema.tarjeta }]}
            onPress={() => router.push('/')}>
            <Text style={[styles.filaTitulo, { color: tema.texto }]}>{textos.cambiarPerfil}</Text>
            <Text style={styles.cambiarPerfilValor}>{textos.roles[rol]} ▾</Text>
          </Pressable>
        )}

        <Pressable style={styles.botonCerrarSesion} onPress={() => router.push('/')}>
          <Text style={styles.botonCerrarSesionTexto}>{textos.cerrarSesion}</Text>
        </Pressable>

        <Text style={[styles.version, { color: tema.textoTenue }]}>{textos.version}</Text>
      </ScrollView>

      <BarraPerfil rol={rol} pantalla="perfil" tema={tema} />
    </View>
  );
}

type PropsFila = {
  tema: Tema;
  titulo: string;
  subtitulo: string;
  conFlecha?: boolean;
  onPress?: () => void;
};

function Fila({ tema, titulo, subtitulo, conFlecha, onPress }: PropsFila) {
  return (
    <Pressable style={styles.fila} onPress={onPress}>
      <View style={styles.filaTextos}>
        <Text style={[styles.filaTitulo, { color: tema.texto }]}>{titulo}</Text>
        <Text style={[styles.filaSubtitulo, { color: tema.textoSecundario }]}>{subtitulo}</Text>
      </View>
      {conFlecha && <Text style={[styles.flecha, { color: tema.textoTenue }]}>›</Text>}
    </Pressable>
  );
}

type PropsFilaToggle = {
  tema: Tema;
  titulo: string;
  subtitulo: string;
  activo: boolean;
  onCambiar: () => void;
};

function FilaToggle({ tema, titulo, subtitulo, activo, onCambiar }: PropsFilaToggle) {
  return (
    <View style={styles.filaToggle}>
      <View style={styles.filaTextos}>
        <Text style={[styles.filaTitulo, { color: tema.texto }]}>{titulo}</Text>
        <Text style={[styles.filaSubtitulo, { color: tema.textoSecundario }]}>{subtitulo}</Text>
      </View>
      <Toggle tema={tema} activo={activo} onCambiar={onCambiar} />
    </View>
  );
}

function Toggle({ tema, activo, onCambiar }: { tema: Tema; activo: boolean; onCambiar: () => void }) {
  return (
    <Pressable
      style={[
        styles.toggleTrack,
        { backgroundColor: tema.switchApagado },
        activo && styles.toggleTrackActivo,
      ]}
      onPress={onCambiar}>
      <View style={[styles.toggleThumb, activo && styles.toggleThumbActivo]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
  },
  contenido: {
    flex: 1,
  },
  contenidoInterno: {
    padding: 20,
    paddingBottom: 32,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tituloPantalla: {
    fontSize: 22,
    fontWeight: '700',
  },
  filaPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLOR_PERFIL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarPaciente: {
    marginRight: 16,
  },
  avatarTexto: {
    color: COLOR_PERFIL,
    fontSize: 20,
    fontWeight: '700',
  },
  datosPerfil: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
  },
  chipTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_PERFIL,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  grupo: {
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  filaToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  filaTextos: {
    flex: 1,
    marginRight: 10,
  },
  filaTitulo: {
    fontSize: 14,
    fontWeight: '700',
  },
  filaSubtitulo: {
    fontSize: 12,
    marginTop: 2,
  },
  flecha: {
    fontSize: 18,
  },
  divisor: {
    height: 1,
  },
  selectorIdioma: {
    flexDirection: 'row',
    gap: 6,
  },
  opcionIdioma: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  opcionIdiomaActiva: {
    backgroundColor: COLOR_PERFIL,
  },
  opcionIdiomaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_PERFIL,
  },
  opcionIdiomaTextoActivo: {
    color: '#1A1815',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActivo: {
    backgroundColor: COLOR_PERFIL,
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActivo: {
    backgroundColor: '#1A1815',
  },
  filaCambiarPerfil: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  cambiarPerfilValor: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PERFIL,
  },
  botonCerrarSesion: {
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonCerrarSesionTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_PERFIL,
  },
  version: {
    fontSize: 11,
    textAlign: 'center',
  },
});
