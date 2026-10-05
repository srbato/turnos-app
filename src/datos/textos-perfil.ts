// Textos de la pantalla de Perfil en cada idioma.
import type { Idioma } from '@/contextos/PreferenciasContext';

type Rol = 'paciente' | 'medico' | 'secretaria' | 'administrador';

type TextosPerfil = {
  tituloPantalla: string;
  editarPerfil: string;
  editarPerfilDetalle: string;
  datosPersonales: string;
  datosPersonalesDetalle: string;
  seguridad: string;
  seguridadDetalle: string;
  preferencias: string;
  idioma: string;
  idiomaDetalle: string;
  modoOscuro: string;
  modoOscuroDetalle: string;
  recordatorios: string;
  recordatoriosDetalle: string;
  alertas: string;
  alertasDetalle: string;
  cambiarPerfil: string;
  cerrarSesion: string;
  version: string;
  tabs: {
    inicio: string;
    turnos: string;
    medicamentos: string;
    agenda: string;
    pacientes: string;
    recetas: string;
    perfil: string;
  };
  roles: Record<Rol, string>;
  chips: Record<Rol, string>;
  filaTitulos: Record<Rol, string>;
  filaSubtitulos: Record<Rol, string>;
};

export const TEXTOS_PERFIL: Record<Idioma, TextosPerfil> = {
  es: {
    tituloPantalla: 'Mi perfil',
    editarPerfil: 'Editar perfil',
    editarPerfilDetalle: 'Foto, datos, obras sociales y seguridad',
    datosPersonales: 'Datos personales',
    datosPersonalesDetalle: 'DNI, contacto y domicilio',
    seguridad: 'Seguridad',
    seguridadDetalle: 'Contraseña y huella',
    preferencias: 'Preferencias',
    idioma: 'Idioma',
    idiomaDetalle: 'Español o English',
    modoOscuro: 'Modo oscuro',
    modoOscuroDetalle: 'Cambia el aspecto de esta pantalla',
    recordatorios: 'Recordatorios de turno',
    recordatoriosDetalle: 'WhatsApp y notificaciones',
    alertas: 'Alertas de medicación',
    alertasDetalle: 'Avisos de interacciones',
    cambiarPerfil: 'Cambiar de perfil',
    cerrarSesion: 'Cerrar sesión',
    version: 'versión 2.4.1 · Consultorios Rivadavia',
    tabs: { inicio: 'Inicio', turnos: 'Turnos', medicamentos: 'Medicamentos', agenda: 'Agenda', pacientes: 'Pacientes', recetas: 'Recetas', perfil: 'Perfil' },
    roles: {
      paciente: 'Paciente',
      medico: 'Médico',
      secretaria: 'Secretaría',
      administrador: 'Administrador',
    },
    chips: {
      paciente: 'Paciente · Swiss Medical',
      medico: 'Médico · Clínica médica',
      secretaria: 'Secretaría · Consultorios Rivadavia',
      administrador: 'Administrador · Consultorios Rivadavia',
    },
    filaTitulos: {
      paciente: 'Cobertura médica',
      medico: 'Matrícula',
      secretaria: 'Turno de trabajo',
      administrador: 'Acceso',
    },
    filaSubtitulos: {
      paciente: 'Swiss Medical SMG20 · 62-4418902/01',
      medico: 'MN 118.402',
      secretaria: 'Lunes a viernes · 8:00 a 16:00',
      administrador: 'Gestión completa del consultorio',
    },
  },
  en: {
    tituloPantalla: 'My profile',
    editarPerfil: 'Edit profile',
    editarPerfilDetalle: 'Photo, details, health insurance and security',
    datosPersonales: 'Personal details',
    datosPersonalesDetalle: 'ID, contact and address',
    seguridad: 'Security',
    seguridadDetalle: 'Password and fingerprint',
    preferencias: 'Preferences',
    idioma: 'Language',
    idiomaDetalle: 'Español or English',
    modoOscuro: 'Dark mode',
    modoOscuroDetalle: 'Changes the look of this screen',
    recordatorios: 'Appointment reminders',
    recordatoriosDetalle: 'WhatsApp and notifications',
    alertas: 'Medication alerts',
    alertasDetalle: 'Interaction warnings',
    cambiarPerfil: 'Switch profile',
    cerrarSesion: 'Log out',
    version: 'version 2.4.1 · Consultorios Rivadavia',
    tabs: { inicio: 'Home', turnos: 'Appointments', medicamentos: 'Medications', agenda: 'Schedule', pacientes: 'Patients', recetas: 'Prescriptions', perfil: 'Profile' },
    roles: {
      paciente: 'Patient',
      medico: 'Doctor',
      secretaria: 'Secretary',
      administrador: 'Administrator',
    },
    chips: {
      paciente: 'Patient · Swiss Medical',
      medico: 'Doctor · General medicine',
      secretaria: 'Secretary · Consultorios Rivadavia',
      administrador: 'Administrator · Consultorios Rivadavia',
    },
    filaTitulos: {
      paciente: 'Health insurance',
      medico: 'License number',
      secretaria: 'Work shift',
      administrador: 'Access',
    },
    filaSubtitulos: {
      paciente: 'Swiss Medical SMG20 · 62-4418902/01',
      medico: 'MN 118.402',
      secretaria: 'Monday to Friday · 8:00 to 16:00',
      administrador: 'Full clinic management',
    },
  },
};
