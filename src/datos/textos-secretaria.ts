// Textos de las pantallas de la secretaría (y de los componentes que usan) en cada idioma.
// Solo se traduce lo que escribe la app: los datos que cargó la gente (nombres, especialidades, motivos de cancelación...)
// quedan como están.
import { Idioma } from '@/contextos/PreferenciasContext';

type TextosSecretaria = {
  menu: { agendas: string; espera: string; alertas: string; personal: string; ajustes: string };
  comun: {
    cerrar: string;
    volver: string;
    cancelar: string;
    reprogramar: string;
    cancelarTurno: string;
    paciente: string;
    medico: string;
    listo: string;
    guardarCambios: string;
    hora: (hora: string) => string; // '09:00 h' / '09:00'
    verFicha: string;
    noEncontradoMedico: string;
    noEncontradoPaciente: string;
    personal: string;
  };
  niveles: { alto: string; medio: string; bajo: string };
  puntos: (cantidad: number) => string; // 'punto' / 'puntos'
  decimal: string; // separador decimal de los puntajes
  dias: string[]; // cortos, desde domingo
  diasLargos: string[]; // desde domingo
  nombresCalendario: { meses: string[]; semana: string[] }; // semana: de lunes a domingo
  agenda: {
    tituloHoy: string;
    titulo: string;
    hoy: string;
    cantidad: (n: number) => string;
    turnos: string;
    sinConfirmar: string;
    medicos: string;
    comparar: string;
    pacientes: string;
    todos: string;
    sinTurnos: string;
    paciente: string;
    ofrecidoPor: (medico: string) => string;
    ofrecido: string;
    esperandoRespuesta: string;
    riesgoAlto: string;
  };
  ajustes: {
    titulo: string;
    subtitulo: string;
    miPerfil: string;
    datos: string;
    nombre: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    duracion: string;
    minutos: (n: number) => string;
    notaDuracion: (duracion: number, turnos: number) => string;
    riesgo: string;
    notaRiesgo: string;
    riesgoMedio: string;
    riesgoAlto: string;
    puntos: string;
    avisosAntes: string;
    avisosAntesDetalle: string;
    horariosYReglas: string;
    atencion: string;
    sobreturnos: string;
    recordatorio: string;
    recordatorioDetalle: string;
    guardar: string;
    guardado: string;
    errorRiesgo: string;
    restar: string;
    sumar: string;
  };
  alertas: {
    titulo: string;
    subtitulo: string;
    reglas: { falta: string; asistencia: string; confirmacion: string };
    cancelados: (cantidad: number) => string;
    motivoCancelacion: (avisos: number) => string;
    hoy: (hora: string) => string;
    manana: (hora: string) => string;
    ofertas: (cantidad: number) => string;
    sinConfirmarTitulo: (cantidad: number) => string;
    todoEnOrden: string;
    sinPendientes: string;
    nivel: (puntos: string, nivel: string) => string;
    avisosEnviados: (cantidad: number, ultimo: string) => string;
    yaConfirmo: string;
    enviarAviso: (cantidad: number, total: number) => string;
    avisosCompletos: (total: number) => string;
    ayudaRiesgo: (total: number) => string;
    ayudaPuede: (total: number) => string;
    noAsistieronHoy: string;
    historialTitulo: string;
    historialAyuda: string;
    verHistorial: string;
    comoSeCalcula: string;
    calculo: (medio: string, puntosMedio: string, alto: string, avisos: number) => string;
  };
  espera: {
    respuestas: { enviada: string; aceptada: string; rechazada: string; 'sin-respuesta': string; retirada: string };
    titulo: string;
    subtitulo: (dias: number) => string;
    ofertasEnCurso: (cantidad: number) => string;
    sinOfertas: string;
    horarioOfrecido: string;
    enDias: (dias: number) => string;
    seLeOfrecio: string;
    esperaDesde: (desde: string, turno: string) => string;
    esperandoSuRespuesta: string;
    noContesta: string;
    tocarParaModificar: string;
    enEspera: (cantidad: number) => string;
    nadieEnLista: string;
    enEsperaChip: (cantidad: number) => string;
    verHorarios: string;
    desde: (desde: string, turno: string) => string;
    ofertaPendiente: (horario: string) => string;
    ver: string;
    proponer: string;
    respuestasTitulo: string;
    historial: (nivel: string, puntos: string) => string;
  };
  personal: {
    titulo: string;
    subtitulo: (medicos: number, secretarias: number) => string;
    medicos: string;
    secretarias: string;
    estados: { activo: string; licencia: string; baja: string };
    matricula: (m: string) => string;
    vuelveEl: (fecha: string) => string;
    activa: string;
    alta: string;
    altaTitulo: string;
    nombre: string;
    nombreEjemplo: string;
    matriculaCampo: string;
    especialidad: string;
    especialidadEjemplo: string;
    email: string;
    contrasena: string;
    contrasenaEjemplo: string;
    horarios: string;
    darDeAlta: string;
    cancelar: string;
    errores: { completar: string; email: string; contrasena: string; horario: string; matricula: string };
  };
  ficha: {
    estado: string;
    estadoBaja: string;
    reactivar: string;
    activo: string;
    deLicencia: string;
    vuelve: (fecha: string) => string;
    sinFechaVuelta: string;
    agendaBloqueada: string;
    cambiarFecha: string;
    cuandoVuelve: string;
    elegiPrimerDia: string;
    confirmarLicencia: string;
    atiendeNormal: string;
    proximos: (n: number) => string;
    etiquetaEstado: { activo: string; licencia: string; baja: string };
    etiquetaLicencia: (fecha: string) => string;
    verCalendario: (medico: string) => string;
    horariosTitulo: string;
    horariosNota: string;
    datos: string;
    nombre: string;
    nombreNota: string;
    especialidad: string;
    matricula: string;
    sala: string;
    completar: string;
    guardado: string;
    darDeBaja: string;
    bajaTitulo: (medico: string) => string;
    bajaTexto: string;
    bajaCancela: (proximos: string) => string;
    siBaja: string;
  };
  calendario: {
    atiende: (dias: string) => string;
    titulo: (medico: string) => string;
    resumenDia: (turnos: number, libres: number) => string;
    deLicencia: string;
    noAtiende: string;
    leyenda: string;
    nuevo: string;
    sinTurnos: string;
    cantidad: (n: number) => string;
  };
  comparar: {
    volver: string;
    titulo: string;
    medicos: (n: number) => string;
    licencia: string;
    ofrecido: string;
    a: (nombre: string) => string;
    noAtiende: string;
    libre: string;
    riesgoAlto: string;
    modalTitulo: string;
    modalAyuda: (max: number) => string;
    enLicencia: string;
    cantidad: (n: number) => string;
  };
  historial: {
    volver: string;
    titulo: string;
    subtitulo: string;
    atendidos: string;
    noAsistieron: string;
    cancelados: string;
    buscar: string;
    filtros: { todos: string; atendido: string; ausente: string; cancelado: string };
    vacio: string;
  };
  pacientes: { volver: string; titulo: string };
  fichaPaciente: {
    volver: string;
    datos: string;
    cobertura: string;
    afiliado: string;
    emailContacto: string;
    riesgoTitulo: string;
    nivel: (nivel: string) => string;
    faltas: (faltas: number, asistencias: number, confirmaciones: number) => string;
    regla: (falta: string, asistencia: string, confirmacion: string) => string;
    ausencias: string;
    turnos: string;
    sinTurnos: string;
  };
  reprogramar: {
    titulo: string;
    profesional: string;
    turnoActual: string;
    confirmar: (fecha: string, hora: string) => string;
    elegirNuevo: string;
    reprogramado: string;
    pendiente: string;
    volverAgenda: string;
  };
  detalleTurno: {
    titulo: string;
    especialidad: string;
    cobertura: string;
    confirmar: string;
    confirmarCancelacion: string;
    siCancelar: string;
  };
  detalleOferta: {
    titulo: string;
    esperando: string;
    suTurno: string;
    enEsperaDesde: string;
    cancelarOferta: string;
    confirmar: string;
    siCancelar: string;
  };
  nuevoTurno: {
    titulo: (dia: string, fecha: string) => string;
    dni: (dni: string, cobertura: string) => string;
    dia: string;
    medico: string;
    ninguno: string;
    horario: string;
    paciente: string;
    buscar: string;
    elegirPaciente: string;
    sinCoincidencias: string;
    asignar: string;
  };
  horariosDisponibles: {
    titulo: string;
    ayuda: (dias: number) => string;
    tituloReprogramar: string;
    ayudaReprogramar: (dias: number) => string;
    tituloProponer: string;
    ayudaProponer: (medico: string, dias: number, paciente: string) => string;
    todosOcupados: string;
    sinHorarios: string;
    dia: string;
    horarioLibre: string;
    sigueSiendoPara: string;
    sePropone: string;
    destino: (desde: string, turno: string, hora: string) => string;
    aQuien: string;
    candidato: (desde: string, turno: string, hora: string) => string;
    historial: (nivel: string, puntos: string) => string;
    proponer: string;
    cambiar: string;
    proponerHorario: string;
  };
  editor: {
    sinHorarios: string;
    a: (desde: string, hasta: string) => string;
    quitar: string;
    agregar: string;
    desde: string;
    hasta: string;
    boton: string;
    errores: { dia: string; horas: string; orden: string; superpone: string };
  };
  textoDeDias: { sinHorarios: string; a: string };
};

export const TEXTOS_SECRETARIA: Record<Idioma, TextosSecretaria> = {
  es: {
    menu: { agendas: 'Agendas', espera: 'Espera', alertas: 'Alertas', personal: 'Personal', ajustes: 'Ajustes' },
    comun: {
      cerrar: 'Cerrar',
      volver: 'Volver',
      cancelar: 'Cancelar',
      reprogramar: 'Reprogramar',
      cancelarTurno: 'Cancelar turno',
      paciente: 'Paciente',
      medico: 'Médico',
      listo: 'Listo',
      guardarCambios: 'Guardar cambios',
      hora: (hora) => `${hora} h`,
      verFicha: 'Ver ficha del paciente',
      noEncontradoMedico: 'No se encontró al médico.',
      noEncontradoPaciente: 'No se encontró el paciente.',
      personal: '‹ Personal',
    },
    niveles: { alto: 'alto', medio: 'medio', bajo: 'bajo' },
    puntos: (cantidad) => (cantidad === 1 ? 'punto' : 'puntos'),
    decimal: ',',
    dias: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    diasLargos: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    nombresCalendario: {
      meses: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      semana: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    },
    agenda: {
      tituloHoy: 'Turnos de hoy',
      titulo: 'Turnos del día',
      hoy: 'HOY',
      cantidad: (n) => `${n} t.`,
      turnos: 'Turnos',
      sinConfirmar: 'Sin confirmar',
      medicos: 'Médicos',
      comparar: '▦  Comparar horarios',
      pacientes: '◍  Pacientes',
      todos: 'Todos',
      sinTurnos: 'No hay turnos para este día.',
      paciente: 'Paciente',
      ofrecidoPor: (medico) => `Horario ofrecido · ${medico}`,
      ofrecido: 'Ofrecido',
      esperandoRespuesta: 'Esperando respuesta',
      riesgoAlto: 'Riesgo alto',
    },
    ajustes: {
      titulo: 'Configuración',
      subtitulo: 'Datos y reglas del consultorio',
      miPerfil: 'Mi perfil',
      datos: 'DATOS DEL CONSULTORIO',
      nombre: 'Nombre',
      direccion: 'Dirección',
      ciudad: 'Ciudad',
      telefono: 'Teléfono',
      duracion: 'DURACIÓN DE TURNO',
      minutos: (n) => `${n} min`,
      notaDuracion: (duracion, turnos) =>
        `Cada médico atiende en sus propios horarios (se cargan en su ficha, en Personal). Con ${duracion} minutos, un horario de 9 a 12 tiene ${turnos} turnos. Es la misma duración para pacientes, médicos y Secretaría. Los turnos que ya están cargados se mantienen.`,
      riesgo: 'RIESGO DE INASISTENCIA',
      notaRiesgo:
        'Cada falta suma 1 punto; asistir resta 0,5 y confirmar un turno resta 0,2. Acá definís desde cuántos puntos un paciente se considera de riesgo.',
      riesgoMedio: 'Riesgo medio desde',
      riesgoAlto: 'Riesgo alto desde',
      puntos: 'puntos',
      avisosAntes: 'Avisos antes de actuar',
      avisosAntesDetalle: 'Los que mandás a un paciente de riesgo alto antes de poder reprogramar o cancelar su turno',
      horariosYReglas: 'HORARIOS Y REGLAS',
      atencion: 'Atención',
      sobreturnos: 'Sobreturnos por día',
      recordatorio: 'Recordatorio automático',
      recordatorioDetalle: 'Aviso al paciente 24 h antes del turno',
      guardar: 'Guardar cambios',
      guardado: 'Cambios guardados ✓',
      errorRiesgo: 'El riesgo alto tiene que empezar en más puntos que el riesgo medio.',
      restar: 'Restar',
      sumar: 'Sumar',
    },
    alertas: {
      titulo: 'Alertas',
      subtitulo: 'Turnos que todavía no confirmaron los pacientes. Avisales para que confirmen; si no responden, liberá el horario.',
      reglas: { falta: 'Cada falta (no asistió)', asistencia: 'Cada vez que asistió', confirmacion: 'Cada turno que confirmó' },
      cancelados: (cantidad) =>
        cantidad === 0
          ? ''
          : cantidad === 1
            ? ' Hay 1 turno próximo cancelado por el sistema o por riesgo: avisales a los pacientes.'
            : ` Hay ${cantidad} turnos próximos cancelados por el sistema o por riesgo: avisales a los pacientes.`,
      motivoCancelacion: (avisos) =>
        `Cancelado por riesgo de inasistencia: no confirmó tras ${avisos} avisos. El horario quedó libre para la lista de espera.`,
      hoy: (hora) => `Hoy ${hora} h`,
      manana: (hora) => `Mañana ${hora} h`,
      ofertas: (cantidad) =>
        cantidad === 1 ? 'Hay 1 oferta de adelanto esperando respuesta' : `Hay ${cantidad} ofertas de adelanto esperando respuesta`,
      sinConfirmarTitulo: (cantidad) => `SIN CONFIRMAR (${cantidad})`,
      todoEnOrden: 'Todo en orden',
      sinPendientes: 'No hay turnos pendientes de confirmar.',
      nivel: (puntos, nivel) => `${puntos} pts · riesgo ${nivel}`,
      avisosEnviados: (cantidad, ultimo) => `Avisos enviados: ${cantidad} · último el ${ultimo}`,
      yaConfirmo: 'Ya confirmó',
      enviarAviso: (cantidad, total) => `Enviar aviso (${cantidad}/${total})`,
      avisosCompletos: (total) => `${total}/${total} avisos enviados`,
      ayudaRiesgo: (total) =>
        `Riesgo alto: después de ${total} avisos podés reprogramar o cancelar este turno para darle el horario a alguien de la lista de espera con mejor historial.`,
      ayudaPuede: (total) => `Ya recibió ${total} avisos y tiene riesgo alto: podés reprogramar o cancelar su turno.`,
      noAsistieronHoy: 'No asistieron hoy',
      historialTitulo: 'Historial de turnos',
      historialAyuda: 'Los turnos que ya pasaron y los cancelados, con el motivo.',
      verHistorial: 'Ver historial de turnos',
      comoSeCalcula: 'Cómo se calcula el riesgo',
      calculo: (medio, puntosMedio, alto, avisos) =>
        `Las faltas suman y asistir o confirmar resta; el puntaje no baja de 0. Desde ${medio} ${puntosMedio} el riesgo es medio y desde ${alto}, alto. No confirmar no suma nada. A un paciente de riesgo alto que no confirma, después de ${avisos} avisos tuyos podés reprogramarle o cancelarle el turno y darle el horario a alguien de la lista de espera con mejor historial. Los puntos de cada paciente están en su ficha.`,
    },
    espera: {
      respuestas: { enviada: 'Esperando respuesta', aceptada: 'Aceptó', rechazada: 'Rechazó', 'sin-respuesta': 'No contestó', retirada: 'Retirada' },
      titulo: 'Lista de espera',
      subtitulo: (dias) =>
        `Pacientes que quieren adelantar su turno. Tocá a uno para proponerle un horario libre del médico (desde dentro de ${dias} días), o mirá los horarios libres y elegí a quién ofrecérselo. Cada paciente recibe una oferta a la vez.`,
      ofertasEnCurso: (cantidad) => `OFERTAS EN CURSO (${cantidad})`,
      sinOfertas: 'No hay ofertas ahora. Tocá a un paciente de la lista y proponele un horario.',
      horarioOfrecido: 'HORARIO OFRECIDO',
      enDias: (dias) => `en ${dias} días`,
      seLeOfrecio: 'Se le ofreció a',
      esperaDesde: (desde, turno) => `Espera desde ${desde} · tiene ${turno}`,
      esperandoSuRespuesta: 'Esperando su respuesta',
      noContesta: 'No contesta',
      tocarParaModificar: 'Tocá para reprogramar o cancelar la oferta',
      enEspera: (cantidad) => `EN ESPERA (${cantidad})`,
      nadieEnLista: 'Nadie está en la lista. Los pacientes se anotan al sacar su turno.',
      enEsperaChip: (cantidad) => `${cantidad} en espera`,
      verHorarios: 'Ver horarios disponibles',
      desde: (desde, turno) => `Desde ${desde} · turno ${turno}`,
      ofertaPendiente: (horario) => `Oferta pendiente: ${horario}`,
      ver: 'Ver ›',
      proponer: 'Proponer ›',
      respuestasTitulo: 'RESPUESTAS',
      historial: (nivel, puntos) => `Historial: riesgo ${nivel} · ${puntos} pts`,
    },
    personal: {
      titulo: 'Personal',
      subtitulo: (medicos, secretarias) => `${medicos} médicos · ${secretarias} secretarias`,
      medicos: 'Médicos',
      secretarias: 'Secretarias',
      estados: { activo: 'Activo', licencia: 'Licencia', baja: 'Baja' },
      matricula: (m) => `Mat. ${m}`,
      vuelveEl: (fecha) => `Vuelve el ${fecha}`,
      activa: 'Activa',
      alta: '+ Alta de médico',
      altaTitulo: 'Alta de médico',
      nombre: 'Nombre y apellido',
      nombreEjemplo: 'Dra. Laura Gómez',
      matriculaCampo: 'Matrícula',
      especialidad: 'Especialidad',
      especialidadEjemplo: 'Pediatría',
      email: 'Email (para ingresar a la app)',
      contrasena: 'Contraseña inicial',
      contrasenaEjemplo: 'Al menos 6 caracteres',
      horarios: 'Horarios de atención',
      darDeAlta: 'Dar de alta',
      cancelar: 'Cancelar',
      errores: {
        completar: 'Completá todos los campos.',
        email: 'Ingresá un email válido.',
        contrasena: 'La contraseña debe tener al menos 6 caracteres.',
        horario: 'Cargá al menos un horario de atención.',
        matricula: 'Ya hay un médico con esa matrícula.',
      },
    },
    ficha: {
      estado: 'ESTADO',
      estadoBaja: 'Este médico está dado de baja: no aparece en las agendas ni se le pueden asignar turnos.',
      reactivar: 'Reactivar médico',
      activo: 'Activo',
      deLicencia: 'De licencia',
      vuelve: (fecha) => `Vuelve a atender el ${fecha}.`,
      sinFechaVuelta: 'Licencia sin fecha de vuelta.',
      agendaBloqueada: 'Su agenda aparece bloqueada hasta ese día. Los pacientes pueden sacar turno con él desde que vuelve.',
      cambiarFecha: 'Cambiar fecha de vuelta',
      cuandoVuelve: '¿Cuándo vuelve a atender?',
      elegiPrimerDia: 'Elegí el primer día en que ya atiende. Hasta entonces está de licencia.',
      confirmarLicencia: 'Confirmar licencia',
      atiendeNormal: 'Atiende con normalidad.',
      proximos: (n) => (n === 0 ? 'No tiene turnos próximos.' : n === 1 ? 'Tiene 1 turno próximo.' : `Tiene ${n} turnos próximos.`),
      etiquetaEstado: { activo: 'Activo', licencia: 'Licencia', baja: 'Baja' },
      etiquetaLicencia: (fecha) => ` · vuelve el ${fecha}`,
      verCalendario: (medico) => `▦  Ver todo el calendario de ${medico}`,
      horariosTitulo: 'HORARIOS DE ATENCIÓN',
      horariosNota:
        'Los cambios se guardan solos. Si quitás un horario, los turnos que caían ahí se cancelan y quedan en Alertas para que avises a los pacientes.',
      datos: 'DATOS DEL MÉDICO',
      nombre: 'Nombre y apellido',
      nombreNota: 'No se puede cambiar: figura en los turnos ya cargados.',
      especialidad: 'Especialidad',
      matricula: 'Matrícula',
      sala: 'Sala',
      completar: 'Completá todos los campos.',
      guardado: 'Cambios guardados ✓',
      darDeBaja: 'Dar de baja al médico',
      bajaTitulo: (medico) => `¿Dar de baja a ${medico}?`,
      bajaTexto: 'Deja de aparecer en las agendas y no se le podrán asignar turnos. Su historial se conserva y se puede reactivar cuando quieras.',
      bajaCancela: (proximos) => `${proximos} Se cancelan automáticamente y quedan en Alertas para que avises a los pacientes.`,
      siBaja: 'Sí, dar de baja',
    },
    calendario: {
      atiende: (dias) => `atiende ${dias}`,
      titulo: (medico) => `Calendario de ${medico}`,
      resumenDia: (turnos, libres) => `${turnos === 1 ? '1 turno' : `${turnos} turnos`} · ${libres} horarios libres`,
      deLicencia: 'De licencia este día.',
      noAtiende: 'No atiende este día.',
      leyenda: 'Gris: no atiende ese día · Ámbar: de licencia · t. = turnos',
      nuevo: '+ Turno',
      sinTurnos: 'No tiene turnos este día.',
      cantidad: (n) => `${n} t.`,
    },
    comparar: {
      volver: '‹ Turnos del día',
      titulo: 'Comparar horarios',
      medicos: (n) => `${n} médicos ▾`,
      licencia: 'Licencia',
      ofrecido: 'Ofrecido',
      a: (nombre) => `a ${nombre}`,
      noAtiende: 'No atiende',
      libre: 'Libre',
      riesgoAlto: 'Riesgo alto',
      modalTitulo: 'Médicos en la grilla',
      modalAyuda: (max) => `Elegí hasta ${max}. Probá con médicos de la misma especialidad.`,
      enLicencia: ' · licencia',
      cantidad: (n) => `${n} t.`,
    },
    historial: {
      volver: '‹ Alertas',
      titulo: 'Historial de turnos',
      subtitulo: 'Los turnos que ya pasaron y los que se cancelaron, con el motivo. Tocá uno para ver la ficha del paciente.',
      atendidos: 'Atendidos',
      noAsistieron: 'No asistieron',
      cancelados: 'Cancelados',
      buscar: 'Buscar por paciente o médico',
      filtros: { todos: 'Todos', atendido: 'Atendidos', ausente: 'No asistió', cancelado: 'Cancelados' },
      vacio: 'No hay turnos en el historial con ese filtro.',
    },
    pacientes: { volver: '‹ Turnos del día', titulo: 'Pacientes' },
    fichaPaciente: {
      volver: '‹ Pacientes',
      datos: 'Datos administrativos',
      cobertura: 'Cobertura',
      afiliado: 'N° de afiliado',
      emailContacto: 'Email de contacto',
      riesgoTitulo: 'Riesgo de ausencia',
      nivel: (nivel) => `Riesgo ${nivel}`,
      faltas: (faltas, asistencias, confirmaciones) =>
        `Faltó ${faltas} ${faltas === 1 ? 'vez' : 'veces'} · asistió ${asistencias} · confirmó ${confirmaciones}.`,
      regla: (falta, asistencia, confirmacion) =>
        `Cada falta suma ${falta} punto; cada asistencia resta ${asistencia} y cada turno confirmado resta ${confirmacion}. No baja de 0.`,
      ausencias: 'Turnos a los que no asistió',
      turnos: 'Turnos',
      sinTurnos: 'Todavía no tiene turnos.',
    },
    reprogramar: {
      titulo: '‹ Reprogramar turno',
      profesional: 'Profesional',
      turnoActual: 'Turno actual',
      confirmar: (fecha, hora) => `Reprogramar para ${fecha} · ${hora} h`,
      elegirNuevo: 'Seleccioná un nuevo horario',
      reprogramado: 'Turno reprogramado',
      pendiente: 'Queda pendiente de confirmación del paciente.',
      volverAgenda: 'Volver a la agenda',
    },
    detalleTurno: {
      titulo: 'Detalle del turno',
      especialidad: 'Especialidad',
      cobertura: 'Cobertura',
      confirmar: 'Confirmar turno',
      confirmarCancelacion: '¿Cancelar este turno? El horario queda libre y se le puede ofrecer a la lista de espera.',
      siCancelar: 'Sí, cancelar',
    },
    detalleOferta: {
      titulo: 'Horario ofrecido',
      esperando: 'Esperando respuesta',
      suTurno: 'Su turno actual',
      enEsperaDesde: 'En espera desde',
      cancelarOferta: 'Cancelar oferta',
      confirmar: '¿Cancelar esta oferta? El horario deja de ofrecerse y queda libre en la agenda del médico.',
      siCancelar: 'Sí, cancelar',
    },
    nuevoTurno: {
      titulo: (dia, fecha) => `Nuevo turno · ${dia} ${fecha}`,
      dni: (dni, cobertura) => `DNI ${dni} · ${cobertura}`,
      dia: 'Día',
      medico: 'Médico',
      ninguno: 'Ningún médico atiende ese día.',
      horario: 'Horario libre',
      paciente: 'Paciente',
      buscar: 'Buscar por nombre',
      elegirPaciente: 'Elegí un paciente',
      sinCoincidencias: 'Ningún paciente coincide con la búsqueda.',
      asignar: 'Asignar turno',
    },
    horariosDisponibles: {
      titulo: 'Horarios disponibles',
      ayuda: (dias) =>
        `Horarios libres desde dentro de ${dias} días y antes del último turno de la lista. Elegí uno y tocá al paciente a quien se lo querés proponer. Cada paciente recibe una sola oferta a la vez.`,
      tituloReprogramar: 'Reprogramar oferta',
      ayudaReprogramar: (dias) =>
        `Elegí otro horario libre, desde dentro de ${dias} días y antes del turno actual del paciente. La oferta pasa al nuevo horario.`,
      tituloProponer: 'Proponer un horario',
      ayudaProponer: (medico, dias, paciente) =>
        `Horarios libres de ${medico}, desde dentro de ${dias} días y antes del turno actual de ${paciente}.`,
      todosOcupados: 'Todos los pacientes en espera ya tienen una oferta pendiente. Cuando respondan, vas a poder ofrecer otro horario.',
      sinHorarios: 'No hay horarios libres para ofrecer: el médico no atiende, está de licencia o su agenda está completa.',
      dia: 'Día',
      horarioLibre: 'Horario libre',
      sigueSiendoPara: 'La oferta sigue siendo para',
      sePropone: 'Se le propone a',
      destino: (desde, turno, hora) => `, en espera desde ${desde} (su turno actual es el ${turno} a las ${hora} h).`,
      aQuien: '¿A quién se lo proponés?',
      candidato: (desde, turno, hora) => `En espera desde ${desde} · tiene ${turno} a las ${hora} h`,
      historial: (nivel, puntos) => `Historial: riesgo ${nivel} · ${puntos} pts`,
      proponer: 'Proponer ›',
      cambiar: 'Cambiar horario',
      proponerHorario: 'Proponer horario',
    },
    editor: {
      sinHorarios: 'Todavía no tiene horarios: no se le pueden dar turnos.',
      a: (desde, hasta) => `${desde} a ${hasta}`,
      quitar: 'Quitar',
      agregar: 'Agregar horario',
      desde: 'Desde (9:00)',
      hasta: 'Hasta (13:00)',
      boton: '+ Agregar',
      errores: {
        dia: 'Elegí el día.',
        horas: 'Escribí las horas así: 9, 9:30 o 14:00.',
        orden: 'La hora de inicio tiene que ser anterior a la de fin.',
        superpone: 'Se superpone con otro horario de ese día.',
      },
    },
    textoDeDias: { sinHorarios: 'sin horarios', a: 'a' },
  },
  en: {
    menu: { agendas: 'Schedules', espera: 'Waitlist', alertas: 'Alerts', personal: 'Staff', ajustes: 'Settings' },
    comun: {
      cerrar: 'Close',
      volver: 'Back',
      cancelar: 'Cancel',
      reprogramar: 'Reschedule',
      cancelarTurno: 'Cancel appointment',
      paciente: 'Patient',
      medico: 'Doctor',
      listo: 'Done',
      guardarCambios: 'Save changes',
      hora: (hora) => hora,
      verFicha: 'View patient record',
      noEncontradoMedico: 'Doctor not found.',
      noEncontradoPaciente: 'Patient not found.',
      personal: '‹ Staff',
    },
    niveles: { alto: 'high', medio: 'medium', bajo: 'low' },
    puntos: (cantidad) => (cantidad === 1 ? 'point' : 'points'),
    decimal: '.',
    dias: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    diasLargos: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    nombresCalendario: {
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      semana: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    agenda: {
      tituloHoy: "Today's agenda",
      titulo: "Day's agenda",
      hoy: 'TODAY',
      cantidad: (n) => `${n} appt.`,
      turnos: 'Appointments',
      sinConfirmar: 'Unconfirmed',
      medicos: 'Doctors',
      comparar: '▦  Compare schedules',
      pacientes: '◍  Patients',
      todos: 'All',
      sinTurnos: 'No appointments for this day.',
      paciente: 'Patient',
      ofrecidoPor: (medico) => `Time offered · ${medico}`,
      ofrecido: 'Offered',
      esperandoRespuesta: 'Waiting for reply',
      riesgoAlto: 'High risk',
    },
    ajustes: {
      titulo: 'Settings',
      subtitulo: 'Clinic details and rules',
      miPerfil: 'My profile',
      datos: 'CLINIC DETAILS',
      nombre: 'Name',
      direccion: 'Address',
      ciudad: 'City',
      telefono: 'Phone',
      duracion: 'APPOINTMENT LENGTH',
      minutos: (n) => `${n} min`,
      notaDuracion: (duracion, turnos) =>
        `Each doctor works their own hours (set on their profile, under Staff). With ${duracion} minutes, a 9 to 12 schedule has ${turnos} appointments. It's the same length for patients, doctors and the front desk. Appointments already booked are kept.`,
      riesgo: 'NO-SHOW RISK',
      notaRiesgo:
        'Each no-show adds 1 point; attending subtracts 0.5 and confirming an appointment subtracts 0.2. Here you set from how many points a patient is considered at risk.',
      riesgoMedio: 'Medium risk from',
      riesgoAlto: 'High risk from',
      puntos: 'points',
      avisosAntes: 'Notices before acting',
      avisosAntesDetalle: 'How many you send to a high-risk patient before you can reschedule or cancel their appointment',
      horariosYReglas: 'HOURS AND RULES',
      atencion: 'Opening hours',
      sobreturnos: 'Extra appointments per day',
      recordatorio: 'Automatic reminder',
      recordatorioDetalle: 'Notice to the patient 24 h before the appointment',
      guardar: 'Save changes',
      guardado: 'Changes saved ✓',
      errorRiesgo: 'High risk must start at more points than medium risk.',
      restar: 'Subtract',
      sumar: 'Add',
    },
    alertas: {
      titulo: 'Alerts',
      subtitulo: "Appointments patients haven't confirmed yet. Notify them to confirm; if they don't reply, free up the slot.",
      reglas: { falta: 'Each no-show', asistencia: 'Each time they attended', confirmacion: 'Each appointment they confirmed' },
      cancelados: (cantidad) =>
        cantidad === 0
          ? ''
          : cantidad === 1
            ? ' There is 1 upcoming appointment cancelled by the system or because of risk: notify the patients.'
            : ` There are ${cantidad} upcoming appointments cancelled by the system or because of risk: notify the patients.`,
      motivoCancelacion: (avisos) =>
        `Cancelado por riesgo de inasistencia: no confirmó tras ${avisos} avisos. El horario quedó libre para la lista de espera.`,
      hoy: (hora) => `Today ${hora}`,
      manana: (hora) => `Tomorrow ${hora}`,
      ofertas: (cantidad) =>
        cantidad === 1 ? '1 earlier-time offer is waiting for a reply' : `${cantidad} earlier-time offers are waiting for a reply`,
      sinConfirmarTitulo: (cantidad) => `UNCONFIRMED (${cantidad})`,
      todoEnOrden: 'All good',
      sinPendientes: 'No appointments are waiting to be confirmed.',
      nivel: (puntos, nivel) => `${puntos} pts · ${nivel} risk`,
      avisosEnviados: (cantidad, ultimo) => `Notices sent: ${cantidad} · last on ${ultimo}`,
      yaConfirmo: 'Already confirmed',
      enviarAviso: (cantidad, total) => `Send notice (${cantidad}/${total})`,
      avisosCompletos: (total) => `${total}/${total} notices sent`,
      ayudaRiesgo: (total) =>
        `High risk: after ${total} notices you can reschedule or cancel this appointment to give the slot to someone on the waitlist with a better record.`,
      ayudaPuede: (total) => `They've received ${total} notices and are high risk: you can reschedule or cancel their appointment.`,
      noAsistieronHoy: "Didn't show up today",
      historialTitulo: 'Appointment history',
      historialAyuda: 'Past and cancelled appointments, with the reason.',
      verHistorial: 'View appointment history',
      comoSeCalcula: 'How risk is calculated',
      calculo: (medio, puntosMedio, alto, avisos) =>
        `No-shows add and attending or confirming subtract; the score never drops below 0. From ${medio} ${puntosMedio} the risk is medium and from ${alto}, high. Not confirming adds nothing. For a high-risk patient who doesn't confirm, after ${avisos} notices from you, you can reschedule or cancel their appointment and give the slot to someone on the waitlist with a better record. Each patient's points are on their record.`,
    },
    espera: {
      respuestas: { enviada: 'Waiting for reply', aceptada: 'Accepted', rechazada: 'Declined', 'sin-respuesta': 'No reply', retirada: 'Withdrawn' },
      titulo: 'Waitlist',
      subtitulo: (dias) =>
        `Patients who want to move their appointment up. Tap one to offer them a free slot with the doctor (from ${dias} days out), or look at the free slots and pick who to offer it to. Each patient gets one offer at a time.`,
      ofertasEnCurso: (cantidad) => `OFFERS IN PROGRESS (${cantidad})`,
      sinOfertas: 'There are no offers right now. Tap a patient on the list and offer them a time.',
      horarioOfrecido: 'TIME OFFERED',
      enDias: (dias) => `in ${dias} days`,
      seLeOfrecio: 'Offered to',
      esperaDesde: (desde, turno) => `Waiting since ${desde} · has ${turno}`,
      esperandoSuRespuesta: 'Waiting for their reply',
      noContesta: "Didn't reply",
      tocarParaModificar: 'Tap to reschedule or cancel the offer',
      enEspera: (cantidad) => `WAITING (${cantidad})`,
      nadieEnLista: 'Nobody is on the list. Patients join when they book their appointment.',
      enEsperaChip: (cantidad) => `${cantidad} waiting`,
      verHorarios: 'View available times',
      desde: (desde, turno) => `Since ${desde} · appointment ${turno}`,
      ofertaPendiente: (horario) => `Pending offer: ${horario}`,
      ver: 'View ›',
      proponer: 'Offer ›',
      respuestasTitulo: 'REPLIES',
      historial: (nivel, puntos) => `Record: ${nivel} risk · ${puntos} pts`,
    },
    personal: {
      titulo: 'Staff',
      subtitulo: (medicos, secretarias) => `${medicos} doctors · ${secretarias} front-desk staff`,
      medicos: 'Doctors',
      secretarias: 'Front desk',
      estados: { activo: 'Active', licencia: 'On leave', baja: 'Inactive' },
      matricula: (m) => `Lic. ${m}`,
      vuelveEl: (fecha) => `Back on ${fecha}`,
      activa: 'Active',
      alta: '+ Add doctor',
      altaTitulo: 'Add doctor',
      nombre: 'First and last name',
      nombreEjemplo: 'Dr. Laura Gómez',
      matriculaCampo: 'License number',
      especialidad: 'Specialty',
      especialidadEjemplo: 'Pediatrics',
      email: 'Email (to sign in to the app)',
      contrasena: 'Initial password',
      contrasenaEjemplo: 'At least 6 characters',
      horarios: 'Working hours',
      darDeAlta: 'Add doctor',
      cancelar: 'Cancel',
      errores: {
        completar: 'Fill in all the fields.',
        email: 'Enter a valid email.',
        contrasena: 'The password must be at least 6 characters.',
        horario: 'Add at least one working schedule.',
        matricula: 'There is already a doctor with that license number.',
      },
    },
    ficha: {
      estado: 'STATUS',
      estadoBaja: "This doctor is inactive: they don't appear in the schedules and can't be given appointments.",
      reactivar: 'Reactivate doctor',
      activo: 'Active',
      deLicencia: 'On leave',
      vuelve: (fecha) => `Back to seeing patients on ${fecha}.`,
      sinFechaVuelta: 'Leave with no return date.',
      agendaBloqueada: 'Their schedule is blocked until that day. Patients can book with them from the day they return.',
      cambiarFecha: 'Change return date',
      cuandoVuelve: 'When do they return?',
      elegiPrimerDia: 'Pick the first day they see patients again. Until then they are on leave.',
      confirmarLicencia: 'Confirm leave',
      atiendeNormal: 'Seeing patients as usual.',
      proximos: (n) => (n === 0 ? 'No upcoming appointments.' : n === 1 ? '1 upcoming appointment.' : `${n} upcoming appointments.`),
      etiquetaEstado: { activo: 'Active', licencia: 'On leave', baja: 'Inactive' },
      etiquetaLicencia: (fecha) => ` · back on ${fecha}`,
      verCalendario: (medico) => `▦  View ${medico}'s full calendar`,
      horariosTitulo: 'WORKING HOURS',
      horariosNota:
        'Changes save automatically. If you remove a time slot, appointments that fell in it are cancelled and stay in Alerts so you can notify the patients.',
      datos: 'DOCTOR DETAILS',
      nombre: 'First and last name',
      nombreNota: "Can't be changed: it appears on appointments already booked.",
      especialidad: 'Specialty',
      matricula: 'License number',
      sala: 'Room',
      completar: 'Fill in all the fields.',
      guardado: 'Changes saved ✓',
      darDeBaja: 'Deactivate doctor',
      bajaTitulo: (medico) => `Deactivate ${medico}?`,
      bajaTexto: "They stop appearing in the schedules and can't be given appointments. Their history is kept and they can be reactivated any time.",
      bajaCancela: (proximos) => `${proximos} They are cancelled automatically and stay in Alerts so you can notify the patients.`,
      siBaja: 'Yes, deactivate',
    },
    calendario: {
      atiende: (dias) => `works ${dias}`,
      titulo: (medico) => `${medico}'s calendar`,
      resumenDia: (turnos, libres) => `${turnos === 1 ? '1 appointment' : `${turnos} appointments`} · ${libres} free slots`,
      deLicencia: 'On leave this day.',
      noAtiende: "Doesn't see patients this day.",
      leyenda: 'Gray: not working that day · Amber: on leave · appt. = appointments',
      nuevo: '+ Appointment',
      sinTurnos: 'No appointments this day.',
      cantidad: (n) => `${n} appt.`,
    },
    comparar: {
      volver: "‹ Day's appointments",
      titulo: 'Compare schedules',
      medicos: (n) => `${n} doctors ▾`,
      licencia: 'On leave',
      ofrecido: 'Offered',
      a: (nombre) => `to ${nombre}`,
      noAtiende: 'Not working',
      libre: 'Free',
      riesgoAlto: 'High risk',
      modalTitulo: 'Doctors in the grid',
      modalAyuda: (max) => `Pick up to ${max}. Try doctors from the same specialty.`,
      enLicencia: ' · on leave',
      cantidad: (n) => `${n} appt.`,
    },
    historial: {
      volver: '‹ Alerts',
      titulo: 'Appointment history',
      subtitulo: 'Past and cancelled appointments, with the reason. Tap one to see the patient record.',
      atendidos: 'Seen',
      noAsistieron: 'No-shows',
      cancelados: 'Cancelled',
      buscar: 'Search by patient or doctor',
      filtros: { todos: 'All', atendido: 'Seen', ausente: 'No-show', cancelado: 'Cancelled' },
      vacio: 'No appointments in the history with that filter.',
    },
    pacientes: { volver: "‹ Day's appointments", titulo: 'Patients' },
    fichaPaciente: {
      volver: '‹ Patients',
      datos: 'Administrative details',
      cobertura: 'Insurance',
      afiliado: 'Member number',
      emailContacto: 'Contact email',
      riesgoTitulo: 'No-show risk',
      nivel: (nivel) => `${nivel.charAt(0).toUpperCase()}${nivel.slice(1)} risk`,
      faltas: (faltas, asistencias, confirmaciones) =>
        `Missed ${faltas} ${faltas === 1 ? 'time' : 'times'} · attended ${asistencias} · confirmed ${confirmaciones}.`,
      regla: (falta, asistencia, confirmacion) =>
        `Each no-show adds ${falta} point; each attendance subtracts ${asistencia} and each confirmed appointment subtracts ${confirmacion}. It never goes below 0.`,
      ausencias: 'Appointments they missed',
      turnos: 'Appointments',
      sinTurnos: 'No appointments yet.',
    },
    reprogramar: {
      titulo: '‹ Reschedule appointment',
      profesional: 'Doctor',
      turnoActual: 'Current appointment',
      confirmar: (fecha, hora) => `Reschedule for ${fecha} · ${hora}`,
      elegirNuevo: 'Choose a new time',
      reprogramado: 'Appointment rescheduled',
      pendiente: "It's pending the patient's confirmation.",
      volverAgenda: 'Back to the schedule',
    },
    detalleTurno: {
      titulo: 'Appointment details',
      especialidad: 'Specialty',
      cobertura: 'Insurance',
      confirmar: 'Confirm appointment',
      confirmarCancelacion: 'Cancel this appointment? The slot is freed up and can be offered to the waitlist.',
      siCancelar: 'Yes, cancel',
    },
    detalleOferta: {
      titulo: 'Time offered',
      esperando: 'Waiting for reply',
      suTurno: 'Their current appointment',
      enEsperaDesde: 'Waiting since',
      cancelarOferta: 'Cancel offer',
      confirmar: "Cancel this offer? The time stops being offered and is freed up in the doctor's schedule.",
      siCancelar: 'Yes, cancel',
    },
    nuevoTurno: {
      titulo: (dia, fecha) => `New appointment · ${dia} ${fecha}`,
      dni: (dni, cobertura) => `ID ${dni} · ${cobertura}`,
      dia: 'Day',
      medico: 'Doctor',
      ninguno: 'No doctor works that day.',
      horario: 'Free time',
      paciente: 'Patient',
      buscar: 'Search by name',
      elegirPaciente: 'Choose a patient',
      sinCoincidencias: 'No patient matches the search.',
      asignar: 'Book appointment',
    },
    horariosDisponibles: {
      titulo: 'Available times',
      ayuda: (dias) =>
        `Free times from ${dias} days out and before the last appointment on the list. Pick one and tap the patient you want to offer it to. Each patient gets only one offer at a time.`,
      tituloReprogramar: 'Reschedule offer',
      ayudaReprogramar: (dias) =>
        `Pick another free time, from ${dias} days out and before the patient's current appointment. The offer moves to the new time.`,
      tituloProponer: 'Offer a time',
      ayudaProponer: (medico, dias, paciente) =>
        `Free times with ${medico}, from ${dias} days out and before ${paciente}'s current appointment.`,
      todosOcupados: 'All waiting patients already have a pending offer. When they reply, you can offer another time.',
      sinHorarios: 'There are no free times to offer: the doctor is not working, is on leave or their schedule is full.',
      dia: 'Day',
      horarioLibre: 'Free time',
      sigueSiendoPara: 'The offer is still for',
      sePropone: 'Offered to',
      destino: (desde, turno, hora) => `, waiting since ${desde} (their current appointment is on ${turno} at ${hora}).`,
      aQuien: 'Who do you offer it to?',
      candidato: (desde, turno, hora) => `Waiting since ${desde} · has ${turno} at ${hora}`,
      historial: (nivel, puntos) => `Record: ${nivel} risk · ${puntos} pts`,
      proponer: 'Offer ›',
      cambiar: 'Change time',
      proponerHorario: 'Offer time',
    },
    editor: {
      sinHorarios: "No working hours yet: they can't be given appointments.",
      a: (desde, hasta) => `${desde} to ${hasta}`,
      quitar: 'Remove',
      agregar: 'Add working hours',
      desde: 'From (9:00)',
      hasta: 'To (13:00)',
      boton: '+ Add',
      errores: {
        dia: 'Choose the day.',
        horas: 'Type the times like this: 9, 9:30 or 14:00.',
        orden: 'The start time must be before the end time.',
        superpone: 'It overlaps with another time slot that day.',
      },
    },
    textoDeDias: { sinHorarios: 'no hours', a: 'to' },
  },
};
