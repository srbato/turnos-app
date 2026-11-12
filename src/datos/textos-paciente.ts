// Textos de las pantallas del paciente (y de los componentes que usan) en cada idioma.
// Solo se traduce lo que escribe la app: los datos que cargó la gente o el consultorio (nombres de médicos y de
// especialidades, instrucciones, estudios, alergias...) quedan como están.
import { Idioma } from '@/contextos/PreferenciasContext';
import { EstadoEstudio } from '@/datos/estudios';
import { EstadoTurno } from '@/datos/consultorio';

type TextosPaciente = {
  menu: { inicio: string; turnos: string; salud: string; perfil: string };
  estados: Record<EstadoTurno, string>;
  estadosEstudio: Record<EstadoEstudio, string>;
  comun: { cerrar: string; volver: string; volverAlInicio: string; cambiar: string; reprogramar: string; cancelarTurno: string };
  home: {
    saludo: { dia: string; tarde: string; noche: string };
    preconsultaNecesitas: string;
    preconsultaEnviada: string;
    preconsultaOpcional: string;
    sinTurnos: string;
    sacarNuevo: string;
    proximo: string;
    hora: (diaSemana: string, hora: string) => string;
    verDetalle: string;
    misTurnos: string;
    misEstudios: string;
    verTodos: string;
    pendiente: string;
    puesto: (posicion: number) => string;
    esperaTitulo: (posicion: number, total: number) => string;
    esperaSubtitulo: (medico: string) => string;
    preconsulta: string;
    misMedicamentos: string;
  };
  turnos: {
    sinProximos: string;
    sinHistorial: string;
    proximos: string;
    historial: string;
    titulo: string;
    sacarTurno: string;
  };
  detalleTurno: {
    titulo: string;
    hora: (diaSemana: string, fecha: string, hora: string) => string;
    consultorio: string;
    sede: string;
    cobertura: string;
    indicoMedico: string;
    diagnostico: (texto: string) => string;
    verPreconsulta: string;
    preconsulta: string;
    volverAPedir: string;
    cancelarTitulo: string;
    cancelarAviso: string;
    siCancelar: string;
  };
  adelanto: {
    etiqueta: string;
    titulo: string;
    tuTurno: string;
    nuevoHorario: string;
    noGracias: string;
    siAdelantar: string;
    opcionTitulo: string;
    opcionDetalle: (dias: number) => string;
  };
  aviso: {
    hoy: (hora: string) => string;
    manana: (hora: string) => string;
    otroDia: (dia: string, fecha: string, hora: string) => string;
    ultimoAviso: string;
    avisoConsultorio: string;
    puedePerderse: string;
    confirmaTurno: string;
    textoUrgente: (veces: number) => string;
    textoNormal: string;
    noPuedoIr: string;
    confirmarAhora: string;
    confirmarTurno: string;
  };
  estudios: {
    titulo: string;
    pendientes: string;
    historial: string;
    sinPendientes: string;
    sinHistorial: string;
    detalle: string;
    pedidoPor: string;
    sacarTurno: string;
  };
  medicamentos: {
    titulo: string;
    recetados: string;
    propios: string;
    sinRecetados: string;
    validaHasta: string;
    vencioEl: string;
    vigente: string;
    vencida: string;
    receta: string;
    recetadoPor: string;
    emitidaEl: string;
    codigo: string;
    mostrarEnFarmacia: string;
    recetaVencida: string;
    sinPropios: string;
    para: (motivo: string) => string;
    editar: string;
    agregar: string;
    editarMedicamento: string;
    nombre: string;
    nombreEjemplo: string;
    dosis: string;
    dosisEjemplo: string;
    motivo: string;
    motivoEjemplo: string;
    eliminar: string;
    cancelar: string;
    guardar: string;
    errorNombre: string;
    errorDosis: string;
    eliminarTitulo: string;
    sacarDeLista: string;
    volver: string;
    siEliminar: string;
  };
  sacarTurno: {
    tituloEspecialidad: string;
    elegirProfesional: string;
    sinObraSocial: string;
    sinProfesionales: (especialidad: string) => string;
    atiende: (cobertura: string) => string;
    deLicencia: (fecha: string) => string;
    pasos: { especialidad: string; medico: string; horario: string };
    volverTitulo: string;
    volver: string;
    licenciaAviso: (medico: string, fecha: string) => string;
    confirmar: (fecha: string, hora: string) => string;
    elegirHorario: string;
    solicitado: string;
  };
  reprogramar: {
    titulo: string;
    noAtiende: (medico: string) => string;
    turnoActual: string;
    licenciaAviso: (medico: string, fecha: string) => string;
    confirmar: (fecha: string, hora: string) => string;
    elegirNuevo: string;
    reprogramado: string;
    pendiente: string;
  };
  resumen: { especialidad: string; profesional: string };
  horarios: {
    dias: string[]; // etiqueta corta del día, desde domingo
    diasLargos: string[];
    meses: string[]; // etiqueta corta, en mayúsculas
    horariosDel: (fecha: string) => string;
    duracion: (minutos: number, direccion: string) => string;
    sinHorarios: string;
    manana: string;
    tarde: string;
    fechaLarga: (diaSemana: string, dia: number, mes: number) => string;
    fechaCorta: (dia: number, mes: number) => string;
  };
  preconsulta: {
    titulo: string;
    asistente: string;
    sintomas: string[]; // mismo orden que SINTOMAS (datos)
    elegirSintomas: string;
    listo: string;
    ninguno: string;
    escribi: string;
    saltear: string;
    prefieroNo: string;
    ninguna: string;
    intro: string;
    sinDatos: string;
    actualizarYEnviar: string;
    enviar: string;
    enviadaTitulo: string;
    enviadaTexto: (medico: string) => string;
    volverAlInicio: string;
    // Mensajes del asistente
    alarma: (sintomas: string) => string;
    saludo: (nombre: string) => string;
    pMotivo: string;
    pDuracion: string;
    pSintomas: string;
    pMedicacionCargada: (lista: string) => string;
    pMedicacion: string;
    pAlergiasCargadas: (texto: string) => string;
    pAlergias: string;
    pAdicional: string;
    cierre: string;
  };
};

export const TEXTOS_PACIENTE: Record<Idioma, TextosPaciente> = {
  es: {
    menu: { inicio: 'Inicio', turnos: 'Turnos', salud: 'Medicamentos', perfil: 'Perfil' },
    estados: { confirmado: 'Confirmado', pendiente: 'Pendiente', cancelado: 'Cancelado', atendido: 'Atendido', ausente: 'No asistió' },
    estadosEstudio: { pendiente: 'Pendiente', vencido: 'Vencido', realizado: 'Realizado' },
    comun: { cerrar: 'Cerrar', volver: 'Volver', volverAlInicio: 'Volver al inicio', cambiar: 'Cambiar', reprogramar: 'Reprogramar', cancelarTurno: 'Cancelar turno' },
    home: {
      saludo: { dia: 'Buen día', tarde: 'Buenas tardes', noche: 'Buenas noches' },
      preconsultaNecesitas: 'Necesitás un turno próximo',
      preconsultaEnviada: 'Enviada al médico ✓',
      preconsultaOpcional: 'Opcional · contale a tu médico',
      sinTurnos: 'Todavía no tenés turnos. Cuando saques uno, lo vas a ver acá.',
      sacarNuevo: 'Sacar un nuevo turno',
      proximo: 'Próximo turno',
      hora: (diaSemana, hora) => `${diaSemana} ${hora} h`,
      verDetalle: 'Ver detalle',
      misTurnos: 'Mis turnos',
      misEstudios: 'Mis estudios',
      verTodos: 'Ver todos',
      pendiente: 'Pendiente',
      puesto: (posicion) => `${posicion}°`,
      esperaTitulo: (posicion, total) => `Lista de espera: ${posicion}° de ${total}`,
      esperaSubtitulo: (medico) => `${medico} · te ofrecemos un horario antes si se libera`,
      preconsulta: 'Preconsulta',
      misMedicamentos: 'Mis medicamentos',
    },
    turnos: {
      sinProximos: 'No tenés ningún turno próximamente.',
      sinHistorial: 'Todavía no tenés turnos en el historial.',
      proximos: 'Próximos',
      historial: 'Historial',
      titulo: 'Mis turnos',
      sacarTurno: 'Sacar un turno',
    },
    detalleTurno: {
      titulo: 'Detalle del turno',
      hora: (diaSemana, fecha, hora) => `${diaSemana} ${fecha} · ${hora} h`,
      consultorio: 'Consultorio',
      sede: 'Sede',
      cobertura: 'Cobertura',
      indicoMedico: 'Lo que indicó el médico',
      diagnostico: (texto) => `Diagnóstico: ${texto}`,
      verPreconsulta: 'Ver preconsulta',
      preconsulta: 'Preconsulta',
      volverAPedir: 'Volver a pedir turno con este profesional',
      cancelarTitulo: '¿Cancelar este turno?',
      cancelarAviso: 'El horario va a quedar libre para otros pacientes.',
      siCancelar: 'Sí, cancelar',
    },
    adelanto: {
      etiqueta: 'SE LIBERÓ UN HORARIO ANTES',
      titulo: '¿Querés adelantar tu turno?',
      tuTurno: 'Tu turno',
      nuevoHorario: 'Nuevo horario',
      noGracias: 'No, gracias',
      siAdelantar: 'Sí, adelantar',
      opcionTitulo: 'Avisarme si se libera un horario antes',
      opcionDetalle: (dias) =>
        `Si alguien cancela con ${dias} días o más de anticipación, te ofrecemos adelantar tu turno. Se le ofrece primero a quien hace más tiempo espera.`,
    },
    aviso: {
      hoy: (hora) => `hoy ${hora} h`,
      manana: (hora) => `mañana ${hora} h`,
      otroDia: (dia, fecha, hora) => `${dia} ${fecha} · ${hora} h`,
      ultimoAviso: 'ÚLTIMO AVISO',
      avisoConsultorio: 'AVISO DEL CONSULTORIO',
      puedePerderse: 'Tu turno puede perderse',
      confirmaTurno: 'Confirmá tu turno',
      textoUrgente: (veces) =>
        `Ya te avisamos ${veces} veces y no lo confirmaste. Si no lo confirmás, el consultorio puede reprogramarlo para dárselo a otra persona.`,
      textoNormal: 'El consultorio te pidió que confirmes que vas a ir. Así el horario no se pierde.',
      noPuedoIr: 'No puedo ir',
      confirmarAhora: 'Confirmar ahora',
      confirmarTurno: 'Confirmar turno',
    },
    estudios: {
      titulo: '‹ Mis estudios',
      pendientes: 'Pendientes',
      historial: 'Historial',
      sinPendientes: 'No tenés estudios pendientes.',
      sinHistorial: 'Todavía no tenés estudios en el historial.',
      detalle: 'Detalle del estudio',
      pedidoPor: 'Pedido por',
      sacarTurno: 'Sacar turno para este estudio',
    },
    medicamentos: {
      titulo: 'Mis medicamentos',
      recetados: 'Recetados',
      propios: 'Agregados por mí',
      sinRecetados: 'Tu médico todavía no te recetó medicamentos.',
      validaHasta: 'Válida hasta',
      vencioEl: 'Venció el',
      vigente: 'Vigente',
      vencida: 'Vencida',
      receta: 'Receta',
      recetadoPor: 'Recetado por',
      emitidaEl: 'Emitida el',
      codigo: 'Código de receta',
      mostrarEnFarmacia: 'Mostralo en la farmacia para retirar tu medicamento.',
      recetaVencida: 'Esta receta ya venció. Pedile una nueva a tu médico.',
      sinPropios: 'Todavía no agregaste ningún medicamento.',
      para: (motivo) => `Para: ${motivo}`,
      editar: 'Editar',
      agregar: 'Agregar medicamento',
      editarMedicamento: 'Editar medicamento',
      nombre: 'Nombre',
      nombreEjemplo: 'Ej. Paracetamol 500 mg',
      dosis: 'Dosis y frecuencia',
      dosisEjemplo: 'Ej. 1 comprimido cada 8 h',
      motivo: 'Motivo',
      motivoEjemplo: 'Ej. Dolor de cabeza',
      eliminar: 'Eliminar medicamento',
      cancelar: 'Cancelar',
      guardar: 'Guardar',
      errorNombre: 'El nombre es obligatorio',
      errorDosis: 'Indicá la dosis o cada cuánto lo tomás',
      eliminarTitulo: '¿Eliminar este medicamento?',
      sacarDeLista: 'Lo vas a sacar de tu lista.',
      volver: 'Volver',
      siEliminar: 'Sí, eliminar',
    },
    sacarTurno: {
      tituloEspecialidad: '¿Qué especialidad necesitás?',
      elegirProfesional: 'Elegí un profesional',
      sinObraSocial: 'Todavía no cargaste tu obra social. Agregala en Perfil > Editar perfil.',
      sinProfesionales: (especialidad) =>
        `No hay profesionales de ${especialidad} disponibles ahora que atiendan tus obras sociales.`,
      atiende: (cobertura) => `Atiende ${cobertura}`,
      deLicencia: (fecha) => `De licencia · vuelve el ${fecha}`,
      pasos: { especialidad: 'Especialidad', medico: 'Médico', horario: 'Horario' },
      volverTitulo: '‹ Sacar turno',
      volver: '‹ Volver',
      licenciaAviso: (medico, fecha) => `${medico} está de licencia y vuelve el ${fecha}. Podés sacar turno desde ese día.`,
      confirmar: (fecha, hora) => `Confirmar ${fecha} · ${hora} h`,
      elegirHorario: 'Seleccioná un horario',
      solicitado: '¡Turno solicitado!',
    },
    reprogramar: {
      titulo: '‹ Reprogramar turno',
      noAtiende: (medico) =>
        `${medico} ya no atiende, así que no se puede elegir un horario nuevo con él. Comunicate con el consultorio para reprogramar tu turno.`,
      turnoActual: 'Turno actual',
      licenciaAviso: (medico, fecha) => `${medico} está de licencia y vuelve el ${fecha}. Podés elegir un horario desde ese día.`,
      confirmar: (fecha, hora) => `Reprogramar para ${fecha} · ${hora} h`,
      elegirNuevo: 'Seleccioná un nuevo horario',
      reprogramado: '¡Turno reprogramado!',
      pendiente: 'Queda pendiente de confirmación.',
    },
    resumen: { especialidad: 'Especialidad', profesional: 'Profesional' },
    horarios: {
      dias: ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'],
      diasLargos: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      meses: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
      horariosDel: (fecha) => `Horarios del ${fecha}`,
      duracion: (minutos, direccion) => `Turnos de ${minutos} minutos · ${direccion}`,
      sinHorarios: 'El médico no atiende este día.',
      manana: 'MAÑANA',
      tarde: 'TARDE',
      fechaLarga: (diaSemana, dia, mes) => `${diaSemana} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`,
      fechaCorta: (dia, mes) => `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`,
    },
    preconsulta: {
      titulo: 'Preconsulta',
      asistente: 'IA',
      sintomas: ['Dolor de cabeza', 'Náuseas', 'Fiebre', 'Mareos', 'Visión borrosa', 'Tos', 'Cansancio', 'Dolor de pecho', 'Dificultad para respirar'],
      elegirSintomas: 'Elegí tus síntomas',
      listo: 'Listo',
      ninguno: 'Ninguno de estos',
      escribi: 'Escribí tu respuesta...',
      saltear: 'Saltear esta pregunta',
      prefieroNo: 'Prefiero no responder',
      ninguna: 'Ninguno',
      intro:
        'Este es el resumen que va a ver tu médico. Podés corregir lo que quieras. Fue armado con un asistente de IA a partir de tus respuestas; no es un diagnóstico.',
      sinDatos: 'Sin datos',
      actualizarYEnviar: 'Actualizar y enviar al médico',
      enviar: 'Enviar al médico',
      enviadaTitulo: 'Preconsulta enviada',
      enviadaTexto: (medico) => `${medico} la va a ver antes de tu turno. Podés volver a entrar y actualizarla cuando quieras.`,
      volverAlInicio: 'Volver al inicio',
      alarma: (sintomas) =>
        `Marcaste ${sintomas}. Si en este momento es intenso o te cuesta respirar, no esperes al turno: andá a una guardia o llamá al 107.`,
      saludo: (nombre) =>
        `Hola ${nombre}. Soy el asistente de preconsulta: no soy médico ni hago diagnósticos, solo junto información para que tu médico llegue al turno con contexto. Podés saltear cualquier pregunta.`,
      pMotivo: '¿Cuál es el motivo principal de tu consulta?',
      pDuracion: 'Gracias. ¿Hace cuánto tiempo te pasa? ¿Es constante o va y viene?',
      pSintomas: '¿Tuviste alguno de estos síntomas? Marcá todos los que apliquen.',
      pMedicacionCargada: (lista) => `En la app tenés cargados: ${lista}. ¿Tomás algún otro medicamento, o dejaste de tomar alguno?`,
      pMedicacion: '¿Tomás algún medicamento actualmente?',
      pAlergiasCargadas: (texto) => `En tu perfil figura: ${texto}. ¿Querés agregar o corregir algo? Si está todo bien, podés saltear la pregunta.`,
      pAlergias: '¿Tenés alguna alergia (a medicamentos, alimentos u otras cosas)?',
      pAdicional: '¿Querés contarle algo más a tu médico? Por ejemplo, antecedentes o dudas que tengas.',
      cierre: 'Listo, con lo que me contaste armé un resumen para tu médico. Revisalo y corregí lo que haga falta antes de enviarlo.',
    },
  },
  en: {
    menu: { inicio: 'Home', turnos: 'Appointments', salud: 'Medications', perfil: 'Profile' },
    estados: { confirmado: 'Confirmed', pendiente: 'Pending', cancelado: 'Cancelled', atendido: 'Seen', ausente: 'No-show' },
    estadosEstudio: { pendiente: 'Pending', vencido: 'Expired', realizado: 'Done' },
    comun: { cerrar: 'Close', volver: 'Back', volverAlInicio: 'Back to home', cambiar: 'Change', reprogramar: 'Reschedule', cancelarTurno: 'Cancel appointment' },
    home: {
      saludo: { dia: 'Good morning', tarde: 'Good afternoon', noche: 'Good evening' },
      preconsultaNecesitas: 'You need an upcoming appointment',
      preconsultaEnviada: 'Sent to your doctor ✓',
      preconsultaOpcional: 'Optional · tell your doctor',
      sinTurnos: "You don't have any appointments yet. When you book one, you'll see it here.",
      sacarNuevo: 'Book a new appointment',
      proximo: 'Next appointment',
      hora: (diaSemana, hora) => `${diaSemana} ${hora}`,
      verDetalle: 'View details',
      misTurnos: 'My appointments',
      misEstudios: 'My tests',
      verTodos: 'See all',
      pendiente: 'Pending',
      puesto: (posicion) => `#${posicion}`,
      esperaTitulo: (posicion, total) => `Waitlist: #${posicion} of ${total}`,
      esperaSubtitulo: (medico) => `${medico} · we'll offer you an earlier time if one opens up`,
      preconsulta: 'Pre-visit form',
      misMedicamentos: 'My medications',
    },
    turnos: {
      sinProximos: "You don't have any upcoming appointments.",
      sinHistorial: "You don't have any appointments in your history yet.",
      proximos: 'Upcoming',
      historial: 'History',
      titulo: 'My appointments',
      sacarTurno: 'Book an appointment',
    },
    detalleTurno: {
      titulo: 'Appointment details',
      hora: (diaSemana, fecha, hora) => `${diaSemana} ${fecha} · ${hora}`,
      consultorio: 'Room',
      sede: 'Location',
      cobertura: 'Insurance',
      indicoMedico: 'What the doctor recommended',
      diagnostico: (texto) => `Diagnosis: ${texto}`,
      verPreconsulta: 'View pre-visit form',
      preconsulta: 'Pre-visit form',
      volverAPedir: 'Book again with this doctor',
      cancelarTitulo: 'Cancel this appointment?',
      cancelarAviso: 'The time slot will be freed up for other patients.',
      siCancelar: 'Yes, cancel',
    },
    adelanto: {
      etiqueta: 'AN EARLIER TIME OPENED UP',
      titulo: 'Want to move your appointment up?',
      tuTurno: 'Your appointment',
      nuevoHorario: 'New time',
      noGracias: 'No, thanks',
      siAdelantar: 'Yes, move it up',
      opcionTitulo: 'Let me know if an earlier time opens up',
      opcionDetalle: (dias) =>
        `If someone cancels ${dias} days or more in advance, we'll offer you to move your appointment up. It's offered first to whoever has waited the longest.`,
    },
    aviso: {
      hoy: (hora) => `today ${hora}`,
      manana: (hora) => `tomorrow ${hora}`,
      otroDia: (dia, fecha, hora) => `${dia} ${fecha} · ${hora}`,
      ultimoAviso: 'FINAL NOTICE',
      avisoConsultorio: 'NOTICE FROM THE CLINIC',
      puedePerderse: 'Your appointment may be lost',
      confirmaTurno: 'Confirm your appointment',
      textoUrgente: (veces) =>
        `We've notified you ${veces} times and you haven't confirmed. If you don't confirm, the clinic may reschedule it and give it to someone else.`,
      textoNormal: "The clinic asked you to confirm you'll attend. That way the time slot isn't lost.",
      noPuedoIr: "I can't go",
      confirmarAhora: 'Confirm now',
      confirmarTurno: 'Confirm appointment',
    },
    estudios: {
      titulo: '‹ My tests',
      pendientes: 'Pending',
      historial: 'History',
      sinPendientes: "You don't have any pending tests.",
      sinHistorial: "You don't have any tests in your history yet.",
      detalle: 'Test details',
      pedidoPor: 'Ordered by',
      sacarTurno: 'Book an appointment for this test',
    },
    medicamentos: {
      titulo: 'My medications',
      recetados: 'Prescribed',
      propios: 'Added by me',
      sinRecetados: "Your doctor hasn't prescribed any medication yet.",
      validaHasta: 'Valid until',
      vencioEl: 'Expired on',
      vigente: 'Active',
      vencida: 'Expired',
      receta: 'Prescription',
      recetadoPor: 'Prescribed by',
      emitidaEl: 'Issued on',
      codigo: 'Prescription code',
      mostrarEnFarmacia: 'Show it at the pharmacy to pick up your medication.',
      recetaVencida: 'This prescription has expired. Ask your doctor for a new one.',
      sinPropios: "You haven't added any medication yet.",
      para: (motivo) => `For: ${motivo}`,
      editar: 'Edit',
      agregar: 'Add medication',
      editarMedicamento: 'Edit medication',
      nombre: 'Name',
      nombreEjemplo: 'E.g. Paracetamol 500 mg',
      dosis: 'Dose and frequency',
      dosisEjemplo: 'E.g. 1 tablet every 8 h',
      motivo: 'Reason',
      motivoEjemplo: 'E.g. Headache',
      eliminar: 'Delete medication',
      cancelar: 'Cancel',
      guardar: 'Save',
      errorNombre: 'The name is required',
      errorDosis: 'Enter the dose or how often you take it',
      eliminarTitulo: 'Delete this medication?',
      sacarDeLista: "It will be removed from your list.",
      volver: 'Back',
      siEliminar: 'Yes, delete',
    },
    sacarTurno: {
      tituloEspecialidad: 'What specialty do you need?',
      elegirProfesional: 'Choose a doctor',
      sinObraSocial: "You haven't added your health insurance yet. Add it in Profile > Edit profile.",
      sinProfesionales: (especialidad) =>
        `There are no ${especialidad} doctors available right now who accept your health insurance.`,
      atiende: (cobertura) => `Accepts ${cobertura}`,
      deLicencia: (fecha) => `On leave · back on ${fecha}`,
      pasos: { especialidad: 'Specialty', medico: 'Doctor', horario: 'Time' },
      volverTitulo: '‹ Book appointment',
      volver: '‹ Back',
      licenciaAviso: (medico, fecha) => `${medico} is on leave and returns on ${fecha}. You can book from that day on.`,
      confirmar: (fecha, hora) => `Confirm ${fecha} · ${hora}`,
      elegirHorario: 'Choose a time',
      solicitado: 'Appointment requested!',
    },
    reprogramar: {
      titulo: '‹ Reschedule appointment',
      noAtiende: (medico) =>
        `${medico} is no longer seeing patients, so you can't pick a new time with them. Contact the clinic to reschedule your appointment.`,
      turnoActual: 'Current appointment',
      licenciaAviso: (medico, fecha) => `${medico} is on leave and returns on ${fecha}. You can pick a time from that day on.`,
      confirmar: (fecha, hora) => `Reschedule for ${fecha} · ${hora}`,
      elegirNuevo: 'Choose a new time',
      reprogramado: 'Appointment rescheduled!',
      pendiente: 'It is pending confirmation.',
    },
    resumen: { especialidad: 'Specialty', profesional: 'Doctor' },
    horarios: {
      dias: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      diasLargos: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      meses: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      horariosDel: (fecha) => `Times for ${fecha}`,
      duracion: (minutos, direccion) => `${minutos}-minute appointments · ${direccion}`,
      sinHorarios: "The doctor doesn't see patients this day.",
      manana: 'MORNING',
      tarde: 'AFTERNOON',
      fechaLarga: (diaSemana, dia, mes) =>
        `${diaSemana}, ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mes - 1]} ${dia}`,
      fechaCorta: (dia, mes) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mes - 1]} ${dia}`,
    },
    preconsulta: {
      titulo: 'Pre-visit form',
      asistente: 'AI',
      sintomas: ['Headache', 'Nausea', 'Fever', 'Dizziness', 'Blurred vision', 'Cough', 'Tiredness', 'Chest pain', 'Shortness of breath'],
      elegirSintomas: 'Choose your symptoms',
      listo: 'Done',
      ninguno: 'None of these',
      escribi: 'Type your answer...',
      saltear: 'Skip this question',
      prefieroNo: "I'd rather not answer",
      ninguna: 'None',
      intro:
        'This is the summary your doctor will see. You can correct anything you like. It was put together by an AI assistant from your answers; it is not a diagnosis.',
      sinDatos: 'No data',
      actualizarYEnviar: 'Update and send to your doctor',
      enviar: 'Send to your doctor',
      enviadaTitulo: 'Pre-visit form sent',
      enviadaTexto: (medico) => `${medico} will see it before your appointment. You can come back and update it whenever you like.`,
      volverAlInicio: 'Back to home',
      alarma: (sintomas) =>
        `You marked ${sintomas}. If it's severe right now or you have trouble breathing, don't wait for your appointment: go to an emergency room or call your local emergency number.`,
      saludo: (nombre) =>
        `Hi ${nombre}. I'm the pre-visit assistant: I'm not a doctor and I don't diagnose, I just gather information so your doctor arrives at the appointment with context. You can skip any question.`,
      pMotivo: "What's the main reason for your visit?",
      pDuracion: 'Thanks. How long has this been going on? Is it constant or on and off?',
      pSintomas: 'Have you had any of these symptoms? Select all that apply.',
      pMedicacionCargada: (lista) => `In the app you have: ${lista}. Do you take any other medication, or have you stopped any?`,
      pMedicacion: 'Are you currently taking any medication?',
      pAlergiasCargadas: (texto) => `Your profile lists: ${texto}. Want to add or correct anything? If it's all fine, you can skip the question.`,
      pAlergias: 'Do you have any allergies (to medications, food or anything else)?',
      pAdicional: 'Is there anything else you want to tell your doctor? For example, history or questions you have.',
      cierre: "Done, with what you told me I put together a summary for your doctor. Review it and fix whatever you need before sending it.",
    },
  },
};
