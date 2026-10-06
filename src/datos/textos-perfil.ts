// Textos de la pantalla de Perfil en cada idioma.
import type { Idioma } from '@/contextos/PreferenciasContext';

type Rol = 'paciente' | 'medico' | 'secretaria';

type TextosPerfil = {
  tituloPantalla: string;
  editarPerfil: string;
  editarPerfilDetalle: string;
  editarPerfilDetalleStaff: string;
  datosPersonales: string;
  datosPersonalesDetalle: string; // del paciente (incluye alergias)
  datosPersonalesDetalleStaff: string; // del personal del consultorio
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
    espera: string;
    alertas: string;
    personal: string;
    ajustes: string;
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
    editarPerfilDetalleStaff: 'Foto, datos y seguridad',
    datosPersonales: 'Datos personales',
    datosPersonalesDetalle: 'DNI, contacto, domicilio y alergias',
    datosPersonalesDetalleStaff: 'DNI, contacto y domicilio',
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
    cerrarSesion: 'Cerrar sesión',
    version: 'versión 2.4.1 · Consultorios Rivadavia',
    tabs: { inicio: 'Inicio', turnos: 'Turnos', medicamentos: 'Medicamentos', agenda: 'Agendas', pacientes: 'Pacientes', recetas: 'Recetas', perfil: 'Perfil', espera: 'Espera', alertas: 'Alertas', personal: 'Personal', ajustes: 'Ajustes' },
    roles: {
      paciente: 'Paciente',
      medico: 'Médico',
      secretaria: 'Secretaría',
    },
    chips: {
      paciente: 'Paciente · Swiss Medical',
      medico: 'Médico · Clínica médica',
      secretaria: 'Secretaría · Consultorios Rivadavia',
    },
    filaTitulos: {
      paciente: 'Cobertura médica',
      medico: 'Matrícula',
      secretaria: 'Turno de trabajo',
    },
    filaSubtitulos: {
      paciente: 'Swiss Medical SMG20 · 62-4418902/01',
      medico: 'MN 118.402',
      secretaria: 'Lunes a viernes · 8:00 a 16:00',
    },
  },
  en: {
    tituloPantalla: 'My profile',
    editarPerfil: 'Edit profile',
    editarPerfilDetalle: 'Photo, details, health insurance and security',
    editarPerfilDetalleStaff: 'Photo, details and security',
    datosPersonales: 'Personal details',
    datosPersonalesDetalle: 'ID, contact, address and allergies',
    datosPersonalesDetalleStaff: 'ID, contact and address',
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
    cerrarSesion: 'Log out',
    version: 'version 2.4.1 · Consultorios Rivadavia',
    tabs: { inicio: 'Home', turnos: 'Appointments', medicamentos: 'Medications', agenda: 'Schedules', pacientes: 'Patients', recetas: 'Prescriptions', perfil: 'Profile', espera: 'Waitlist', alertas: 'Alerts', personal: 'Staff', ajustes: 'Settings' },
    roles: {
      paciente: 'Patient',
      medico: 'Doctor',
      secretaria: 'Secretary',
    },
    chips: {
      paciente: 'Patient · Swiss Medical',
      medico: 'Doctor · General medicine',
      secretaria: 'Secretary · Consultorios Rivadavia',
    },
    filaTitulos: {
      paciente: 'Health insurance',
      medico: 'License number',
      secretaria: 'Work shift',
    },
    filaSubtitulos: {
      paciente: 'Swiss Medical SMG20 · 62-4418902/01',
      medico: 'MN 118.402',
      secretaria: 'Monday to Friday · 8:00 to 16:00',
    },
  },
};
