// Textos de la pantalla Editar perfil en cada idioma.
import type { Idioma } from '@/contextos/PreferenciasContext';

type TextosEditar = {
  titulo: string;
  foto: string;
  cambiarFoto: string;
  tomarFoto: string;
  elegirDeGaleria: string;
  errorCamara: string;
  errorGaleria: string;
  quitarFoto: string;
  datos: string;
  nombre: string;
  email: string;
  telefono: string;
  domicilio: string;
  alergias: string;
  alergiasEjemplo: string;
  numeroAfiliado: string;
  dni: string;
  dniNota: string;
  obrasSociales: string;
  obrasSocialesNota: string;
  guardar: string;
  errorNombre: string;
  errorEmail: string;
  errorCobertura: string;
  seguridad: string;
  cambiarContrasena: string;
  cambiarContrasenaDetalle: string;
  contrasenaActual: string;
  contrasenaNueva: string;
  contrasenaRepetir: string;
  cancelar: string;
  confirmar: string;
  errorActual: string;
  errorLargo: string;
  errorNoCoincide: string;
  errorBiometria: string;
  contrasenaCambiada: string;
};

export const TEXTOS_EDITAR: Record<Idioma, TextosEditar> = {
  es: {
    titulo: 'Editar perfil',
    foto: 'Foto de perfil',
    cambiarFoto: 'Cambiar foto',
    tomarFoto: 'Tomar una foto',
    elegirDeGaleria: 'Elegir de la galería',
    errorCamara: 'Necesitamos permiso para usar la cámara. Podés activarlo en los ajustes del teléfono.',
    errorGaleria: 'Necesitamos permiso para acceder a tus fotos. Podés activarlo en los ajustes del teléfono.',
    quitarFoto: 'Quitar foto',
    datos: 'Datos personales',
    nombre: 'Nombre y apellido',
    email: 'Email',
    telefono: 'Teléfono',
    domicilio: 'Domicilio',
    alergias: 'Alergias',
    alergiasEjemplo: 'Ej: penicilina (escribí "ninguna" si no tenés)',
    numeroAfiliado: 'N° de afiliado',
    dni: 'DNI',
    dniNota: 'Verificado con RENAPER. No se puede modificar.',
    obrasSociales: 'Obras sociales',
    obrasSocialesNota: 'Vamos a mostrarte solo los médicos que atienden las que marques.',
    guardar: 'Guardar cambios',
    errorNombre: 'Ingresá tu nombre y apellido.',
    errorEmail: 'Ingresá un email válido.',
    errorCobertura: 'Elegí al menos una obra social.',
    seguridad: 'Seguridad',
    cambiarContrasena: 'Cambiar contraseña',
    cambiarContrasenaDetalle: 'Te vamos a pedir Face ID o huella para confirmar',
    contrasenaActual: 'Contraseña actual',
    contrasenaNueva: 'Contraseña nueva',
    contrasenaRepetir: 'Repetí la contraseña nueva',
    cancelar: 'Cancelar',
    confirmar: 'Confirmar',
    errorActual: 'La contraseña actual no es correcta.',
    errorLargo: 'La contraseña nueva debe tener al menos 6 caracteres.',
    errorNoCoincide: 'Las contraseñas nuevas no coinciden.',
    errorBiometria: 'No pudimos verificar tu identidad. No se hicieron cambios.',
    contrasenaCambiada: 'Contraseña actualizada.',
  },
  en: {
    titulo: 'Edit profile',
    foto: 'Profile picture',
    cambiarFoto: 'Change photo',
    tomarFoto: 'Take a photo',
    elegirDeGaleria: 'Choose from gallery',
    errorCamara: 'We need permission to use the camera. You can turn it on in your phone settings.',
    errorGaleria: 'We need permission to access your photos. You can turn it on in your phone settings.',
    quitarFoto: 'Remove photo',
    datos: 'Personal details',
    nombre: 'Full name',
    email: 'Email',
    telefono: 'Phone',
    domicilio: 'Address',
    alergias: 'Allergies',
    alergiasEjemplo: 'E.g. penicillin (write "none" if you have none)',
    numeroAfiliado: 'Member number',
    dni: 'ID number',
    dniNota: 'Verified with RENAPER. It cannot be changed.',
    obrasSociales: 'Health insurance',
    obrasSocialesNota: 'We will only show you doctors who accept the ones you select.',
    guardar: 'Save changes',
    errorNombre: 'Enter your first and last name.',
    errorEmail: 'Enter a valid email.',
    errorCobertura: 'Choose at least one health insurance.',
    seguridad: 'Security',
    cambiarContrasena: 'Change password',
    cambiarContrasenaDetalle: 'We will ask for Face ID or fingerprint to confirm',
    contrasenaActual: 'Current password',
    contrasenaNueva: 'New password',
    contrasenaRepetir: 'Repeat the new password',
    cancelar: 'Cancel',
    confirmar: 'Confirm',
    errorActual: 'The current password is not correct.',
    errorLargo: 'The new password must be at least 6 characters.',
    errorNoCoincide: 'The new passwords do not match.',
    errorBiometria: 'We could not verify your identity. No changes were made.',
    contrasenaCambiada: 'Password updated.',
  },
};
