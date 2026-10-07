import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AvatarPaciente, DatosAvatar } from '@/components/avatar-paciente';
import { BarraPerfil } from '@/components/barra-perfil';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { TEMA_CLARO, TEMA_OSCURO, Tema } from '@/constantes/tema';
import { usePerfilMedico } from '@/contextos/PerfilMedicoContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePerfilSecretaria } from '@/contextos/PerfilSecretariaContext';
import { useSesion } from '@/contextos/SesionContext';
import { usePreferencias, Idioma } from '@/contextos/PreferenciasContext';
import { nombreCobertura } from '@/datos/catalogo';
import { TEXTOS_PERFIL } from '@/datos/textos-perfil';

type Rol = 'paciente' | 'medico' | 'secretaria';

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
};

const IDIOMAS: { id: Idioma; etiqueta: string }[] = [
  { id: 'es', etiqueta: 'Español' },
  { id: 'en', etiqueta: 'English' },
];

const COLOR_PERFIL = '#C9A24C';

export default function Perfil() {
  const { rol: rolParam } = useLocalSearchParams();

  // Si el rol de la URL no es uno conocido, se muestra el perfil del paciente.
  let rol: Rol = 'paciente';
  if (rolParam === 'medico') {
    rol = 'medico';
  } else if (rolParam === 'secretaria') {
    rol = 'secretaria';
  }
  const perfilPaciente = usePerfilPaciente();
  const perfilSecretaria = usePerfilSecretaria();
  const perfilMedico = usePerfilMedico();
  const { medicoLogueado } = useSesion();
  // El paciente edita su perfil: sus datos vienen del contexto. Los demás roles usan datos fijos.
  // El médico muestra los datos del médico que inició sesión.
  let info: InfoPerfil = PERFILES[rol];
  if (rol === 'paciente') {
    info = { ...PERFILES.paciente, ...perfilPaciente };
  } else if (rol === 'secretaria') {
    info = { ...PERFILES.secretaria, ...perfilSecretaria };
  } else if (rol === 'medico') {
    info = {
      nombre: medicoLogueado.nombre,
      iniciales: medicoLogueado.iniciales,
      email: medicoLogueado.email,
    };
  }

  // Las preferencias vienen del contexto: se guardan en el dispositivo y se aplican acá.
  const { idioma, modoOscuro, recordatorios, cambiarIdioma, alternarModoOscuro, alternarRecordatorios } =
    usePreferencias();
  const tema = modoOscuro ? TEMA_OSCURO : TEMA_CLARO;
  const textos = TEXTOS_PERFIL[idioma];

  // El paciente muestra las obras sociales que eligió en Editar perfil.
  // Cada obra social va con su N° de afiliado, si lo cargó.
  const obrasSociales = perfilPaciente.coberturaIds.map((id) => {
    const numero = perfilPaciente.numerosAfiliado[id];
    return numero ? `${nombreCobertura(id)} · ${numero}` : nombreCobertura(id);
  });
  // Chip (debajo del nombre) y subtítulo de la fila de datos, según el rol.
  let chip = textos.chips[rol];
  let filaSubtitulo = textos.filaSubtitulos[rol];
  if (rol === 'paciente') {
    chip = textos.roles.paciente;
    if (obrasSociales.length > 0) {
      chip = chip + ' · ' + nombreCobertura(perfilPaciente.coberturaIds[0]);
    }
    filaSubtitulo = obrasSociales.join('\n') || '—';
  } else if (rol === 'medico') {
    chip = `${textos.roles.medico} · ${medicoLogueado.especialidad}`;
    filaSubtitulo = medicoLogueado.matricula;
  } else if (rol === 'secretaria') {
    filaSubtitulo = perfilSecretaria.turnoTrabajo || '—';
  }

  const [alertasMedicacion, setAlertasMedicacion] = useState(true);

  // Al cerrar sesión se vacía la pila de pantallas y se vuelve al inicio: así deslizar hacia atrás
  // no devuelve a una pantalla de la sesión que ya se cerró.
  // Si no quedaron pantallas atrás (por ejemplo, se llegó con replace), no hay nada que cerrar.
  function cerrarSesion() {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/');
  }

  // Los tres roles tienen su editor de perfil.
  function irAlEditor() {
    if (rol === 'paciente') {
      router.push('/paciente/editar-perfil');
    } else if (rol === 'secretaria') {
      router.push('/secretaria/editar-perfil');
    } else {
      router.push('/medico/editar-perfil');
    }
  }

  // Datos de la foto/iniciales: el paciente usa los suyos (por eso queda undefined).
  let datosAvatar: DatosAvatar | undefined = undefined;
  if (rol === 'secretaria') {
    datosAvatar = perfilSecretaria;
  } else if (rol === 'medico') {
    datosAvatar = { nombre: info.nombre, fotoUri: perfilMedico.fotoUri, iniciales: info.iniciales };
  }

  return (
    <View style={[styles.pantalla, { backgroundColor: tema.fondo }]}>
      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoInterno}>
        <View style={styles.encabezado}>
          {/* Secretaría llega desde Ajustes: la flecha de arriba a la izquierda vuelve ahí. */}
          {rol === 'secretaria' ? (
            <Pressable onPress={() => router.replace('/secretaria/ajustes')} hitSlop={10}>
              <Text style={[styles.tituloPantalla, { color: tema.texto }]}>‹ {textos.tituloPantalla}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.tituloPantalla, { color: tema.texto }]}>{textos.tituloPantalla}</Text>
          )}
        </View>

        <View style={styles.filaPerfil}>
          <View style={styles.avatarPaciente}>
            <AvatarPaciente
              tamano={64}
              colorTexto={COLOR_PERFIL}
              colorBorde={COLOR_PERFIL}
              datos={datosAvatar}
            />
          </View>
          <View style={styles.datosPerfil}>
            <Text style={[styles.nombre, { color: tema.texto }]}>{info.nombre}</Text>
            <Text style={[styles.email, { color: tema.textoSecundario }]}>{info.email}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipTexto}>{chip}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          <Fila
            tema={tema}
            titulo={textos.editarPerfil}
            subtitulo={rol === 'paciente' ? textos.editarPerfilDetalle : textos.editarPerfilDetalleStaff}
            conFlecha
            onPress={irAlEditor}
          />
          <View style={[styles.divisor, { backgroundColor: tema.borde }]} />
          <Fila
            tema={tema}
            titulo={textos.datosPersonales}
            subtitulo={rol === 'paciente' ? textos.datosPersonalesDetalle : textos.datosPersonalesDetalleStaff}
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
          {/* Las alertas de medicación (interacciones) son solo para el médico. */}
          {rol === 'medico' && (
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

        {/* El rol se lee de la cuenta: nadie elige ni cambia de perfil desde acá. */}
        <Pressable style={styles.botonCerrarSesion} onPress={cerrarSesion}>
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
    fontFamily: FUENTE_TITULOS,
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
