// Textos de las pantallas del médico (y de los componentes que usan) en cada idioma.
// Solo se traduce lo que escribe la app: los datos que cargó la gente (nombres, alergias, diagnósticos...) quedan como están.
import { Idioma } from '@/contextos/PreferenciasContext';
import { EstadoTurno } from '@/datos/consultorio';

type TextosMedico = {
  menu: { agenda: string; pacientes: string; recetas: string; perfil: string };
  estados: Record<EstadoTurno, string>;
  fechas: {
    dias: string[]; // desde domingo
    meses: string[];
    hoy: string;
    // Ej: 'Jueves 12 de noviembre' / 'Thursday, November 12'
    larga: (diaSemana: string, dia: number, mes: number) => string;
  };
  agenda: {
    tituloHoy: string;
    titulo: string;
    turnos: string;
    confirmados: string;
    pendientes: string;
    riesgoAlto: string;
    cantidadTurnos: (cantidad: number) => string; // abreviatura bajo cada día
    filtros: { todos: string; pendientes: string; confirmados: string; atendidos: string };
    sinTurnosDia: string;
    sinTurnosFiltro: string;
    paciente: string;
    preconsultaLista: string;
    sinPreconsulta: string;
    interaccionDetectada: string;
    riesgoAltoChip: string;
    duracion: string;
    interaccionDetalle: string; // 'Interacción detectada:'
    preconsulta: string;
    sinCompletarPreconsulta: string;
    historiaClinica: string;
    medicacionHabitual: string;
    sinMedicacion: string;
    alergias: string;
    ultimaConsulta: string;
    consulta: string;
    sinConsultaAnotada: string;
    editarConsulta: string;
    anotarConsulta: string;
    avisoConsulta: string;
    motivo: string;
    motivoEjemplo: string;
    diagnostico: string;
    diagnosticoEjemplo: string;
    errorDiagnostico: string;
    indicaciones: string;
    indicacionesEjemplo: string;
    notasPrivadas: string;
    notasEjemplo: string;
    volver: string;
    guardarConsulta: string;
    confirmar: string;
    atendido: string;
    marcarAtendido: string;
    noAsistio: string;
    cancelarTurno: string;
    avisoCorreccion: string;
    siAsistio: string;
    confirmarCancelacion: string;
    no: string;
    siCancelar: string;
  };
  pacientes: {
    tusPacientes: string;
    delConsultorio: string;
    mios: string;
    todos: string;
    buscar: string;
    cantidad: (cantidad: number) => string;
    sinPacientes: string;
    sinCoincidencias: string;
    sinTurnos: string;
    proximo: (diaSemana: string, dia: number, hora: string) => string;
    ultimo: (diaSemana: string, dia: number, hora: string) => string;
    riesgo: string;
  };
  tabla: {
    buscador: string;
    cantidad: (cantidad: number) => string;
    paciente: string;
    cobertura: string;
    turno: string;
    riesgo: string;
    vacio: string;
    ficha: string;
    nivelesRiesgo: { bajo: string; 'en-riesgo': string; alto: string };
  };
  ficha: {
    volver: string;
    noEncontrado: string;
    datos: string;
    cobertura: string;
    afiliado: string;
    alergias: string;
    medicacion: string;
    sinMedicamentos: string;
    recetasHechas: string;
    sinRecetas: string;
    historiaClinica: string;
    sinConsultas: string;
    conVos: string;
    turnosConVos: string;
    sinPreconsulta: string;
    ocultarPreconsulta: string;
    verPreconsulta: string;
  };
  consulta: { motivo: string; diagnostico: string; indicaciones: string; notasPrivadas: string };
  recetas: {
    titulo: string;
    nueva: string;
    vigentes: (cantidad: number) => string;
    historial: (cantidad: number) => string;
    vademecum: string;
    sinVigentes: string;
    sinVencidas: string;
    vencio: (fecha: string) => string;
    vigenteHasta: (fecha: string) => string;
    editar: string;
    paciente: string;
    nombreDePaciente: string; // si no se encuentra
    editarReceta: string;
    nuevaReceta: string;
    elegirPaciente: string;
    buscarPaciente: string;
    sinPacientesConTurnos: string;
    medicamento: string;
    buscarEnVademecum: string;
    medicamentoEjemplo: string;
    indicacion: string;
    indicacionEjemplo: string;
    riesgo: string;
    puedeSerRiesgoso: string;
    cancelar: string;
    guardarCambios: string;
    emitir: string;
    eliminar: string;
    confirmarEliminar: string;
    noVolver: string;
    siEliminar: string;
    errorPaciente: string;
    errorMedicamento: string;
    errorIndicacion: string;
    volverAReceta: string;
    buscarMedicamento: string;
    ayudaBuscador: string;
  };
  vademecum: { volver: string; titulo: string; ayuda: string };
  buscador: {
    ejemplo: string;
    buscar: string;
    avisoVacio: string;
    errorRed: string;
    buscando: string;
    reintentar: string;
    conReceta: string;
    elegir: string;
    mostrando: (mostrados: number, total: number) => string;
    pista: string;
    sinResultados: (busqueda: string) => string;
  };
  desplegable: { cerrar: string; sinCoincidencias: string; sinOpciones: string };
  preconsulta: {
    campos: {
      motivo: string;
      duracion: string;
      sintomas: string;
      medicacion: string;
      alergias: string;
      adicional: string;
    };
    noInformo: string;
  };
};

export const TEXTOS_MEDICO: Record<Idioma, TextosMedico> = {
  es: {
    menu: { agenda: 'Agenda', pacientes: 'Pacientes', recetas: 'Recetas', perfil: 'Perfil' },
    estados: {
      confirmado: 'Confirmado',
      pendiente: 'Pendiente',
      cancelado: 'Cancelado',
      atendido: 'Atendido',
      ausente: 'No asistió',
    },
    fechas: {
      dias: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      hoy: 'HOY',
      larga: (diaSemana, dia, mes) => `${diaSemana} ${dia} de ${TEXTOS_MEDICO.es.fechas.meses[mes - 1]}`,
    },
    agenda: {
      tituloHoy: 'Tu agenda de hoy',
      titulo: 'Tu agenda',
      turnos: 'turnos',
      confirmados: 'confirmados',
      pendientes: 'pendientes',
      riesgoAlto: 'riesgo alto',
      cantidadTurnos: (cantidad) => `${cantidad} t.`,
      filtros: { todos: 'Todos', pendientes: 'Pendientes', confirmados: 'Confirmados', atendidos: 'Atendidos' },
      sinTurnosDia: 'No tenés turnos para este día.',
      sinTurnosFiltro: 'No hay turnos con este filtro.',
      paciente: 'Paciente',
      preconsultaLista: 'preconsulta lista',
      sinPreconsulta: 'sin preconsulta',
      interaccionDetectada: 'Interacción medicamentosa detectada',
      riesgoAltoChip: 'Riesgo alto',
      duracion: '20 min',
      interaccionDetalle: 'Interacción detectada:',
      preconsulta: 'Preconsulta',
      sinCompletarPreconsulta: 'Todavía no completó la preconsulta.',
      historiaClinica: 'Historia clínica',
      medicacionHabitual: 'Medicación habitual',
      sinMedicacion: 'No tiene medicación cargada.',
      alergias: 'Alergias',
      ultimaConsulta: 'Última consulta',
      consulta: 'Consulta',
      sinConsultaAnotada: 'Todavía no anotaste la consulta.',
      editarConsulta: 'Editar consulta',
      anotarConsulta: 'Anotar consulta',
      avisoConsulta: 'Queda en la historia clínica del paciente. Al guardarla, el turno pasa a atendido.',
      motivo: 'Motivo',
      motivoEjemplo: 'Por qué vino',
      diagnostico: 'Diagnóstico',
      diagnosticoEjemplo: 'Ej: Faringitis aguda',
      errorDiagnostico: 'Escribí el diagnóstico.',
      indicaciones: 'Indicaciones',
      indicacionesEjemplo: 'Tratamiento, estudios, cuándo volver',
      notasPrivadas: 'Notas privadas',
      notasEjemplo: 'Solo las ves vos',
      volver: 'Volver',
      guardarConsulta: 'Guardar consulta',
      confirmar: 'Confirmar',
      atendido: 'Atendido',
      marcarAtendido: 'Marcar como atendido',
      noAsistio: 'El paciente no asistió',
      cancelarTurno: 'Cancelar turno',
      avisoCorreccion: 'Si lo marcaste por error, corregilo: la falta deja de sumar puntos de riesgo al paciente.',
      siAsistio: 'El paciente sí asistió',
      confirmarCancelacion: '¿Seguro que querés cancelar este turno?',
      no: 'No',
      siCancelar: 'Sí, cancelar',
    },
    pacientes: {
      tusPacientes: 'Tus pacientes',
      delConsultorio: 'Pacientes del consultorio',
      mios: 'Mis pacientes',
      todos: 'Todos',
      buscar: 'Buscar por nombre...',
      cantidad: (cantidad) => `${cantidad} paciente${cantidad === 1 ? '' : 's'}`,
      sinPacientes: 'Todavía no tenés pacientes con turnos.',
      sinCoincidencias: 'No hay pacientes con ese nombre.',
      sinTurnos: 'Sin turnos',
      proximo: (diaSemana, dia, hora) => `Próximo: ${diaSemana} ${dia} · ${hora} h`,
      ultimo: (diaSemana, dia, hora) => `Último: ${diaSemana} ${dia} · ${hora} h`,
      riesgo: 'Riesgo',
    },
    tabla: {
      buscador: 'Buscar por nombre, DNI u obra social',
      cantidad: (cantidad) => `${cantidad} paciente${cantidad === 1 ? '' : 's'} · tocá uno para darle turno`,
      paciente: 'Paciente',
      cobertura: 'Cobertura',
      turno: 'Turno',
      riesgo: 'Riesgo',
      vacio: 'No se encontró ningún paciente.',
      ficha: 'Ficha ›',
      nivelesRiesgo: { bajo: 'bajo', 'en-riesgo': 'medio', alto: 'alto' },
    },
    ficha: {
      volver: '‹ Pacientes',
      noEncontrado: 'No se encontró el paciente.',
      datos: 'Datos',
      cobertura: 'Cobertura',
      afiliado: 'N° de afiliado',
      alergias: 'Alergias',
      medicacion: 'Medicación',
      sinMedicamentos: 'No tiene medicamentos cargados.',
      recetasHechas: 'Recetas que le hiciste',
      sinRecetas: 'Todavía no le hiciste recetas.',
      historiaClinica: 'Historia clínica',
      sinConsultas: 'Todavía no hay consultas anotadas.',
      conVos: 'Con vos',
      turnosConVos: 'Turnos con vos',
      sinPreconsulta: 'Sin preconsulta',
      ocultarPreconsulta: 'Ocultar preconsulta ▴',
      verPreconsulta: 'Ver preconsulta ▾',
    },
    consulta: { motivo: 'Motivo', diagnostico: 'Diagnóstico', indicaciones: 'Indicaciones', notasPrivadas: 'Notas privadas' },
    recetas: {
      titulo: 'Recetas',
      nueva: '+ Nueva receta',
      vigentes: (cantidad) => `Vigentes (${cantidad})`,
      historial: (cantidad) => `Historial (${cantidad})`,
      vademecum: 'Vademécum ›',
      sinVigentes: 'No tenés recetas vigentes.',
      sinVencidas: 'Todavía no tenés recetas vencidas.',
      vencio: (fecha) => `Venció el ${fecha}`,
      vigenteHasta: (fecha) => `Vigente hasta el ${fecha}`,
      editar: 'Editar ›',
      paciente: 'Paciente',
      nombreDePaciente: 'Paciente',
      editarReceta: 'Editar receta',
      nuevaReceta: 'Nueva receta',
      elegirPaciente: 'Elegí un paciente',
      buscarPaciente: 'Buscar por nombre',
      sinPacientesConTurnos: 'Todavía no tenés pacientes con turnos.',
      medicamento: 'Medicamento',
      buscarEnVademecum: 'Buscar en el vademécum ›',
      medicamentoEjemplo: 'Ej: Amoxicilina 500 mg',
      indicacion: 'Indicación',
      indicacionEjemplo: 'Ej: 1 comprimido cada 8 h por 7 días',
      riesgo: 'Riesgo',
      puedeSerRiesgoso: 'Puede ser riesgoso con otros medicamentos',
      cancelar: 'Cancelar',
      guardarCambios: 'Guardar cambios',
      emitir: 'Emitir receta',
      eliminar: 'Eliminar receta',
      confirmarEliminar: '¿Eliminar esta receta? El paciente deja de verla y no se puede deshacer.',
      noVolver: 'No, volver',
      siEliminar: 'Sí, eliminar',
      errorPaciente: 'Elegí un paciente',
      errorMedicamento: 'El medicamento es obligatorio',
      errorIndicacion: 'Indicá la dosis o cada cuánto tomarlo',
      volverAReceta: '‹ Volver a la receta',
      buscarMedicamento: 'Buscar medicamento',
      ayudaBuscador: 'Vademécum de España (AEMPS). Elegí uno para cargar su nombre en la receta; después lo podés editar.',
    },
    vademecum: {
      volver: '‹ Recetas',
      titulo: 'Vademécum',
      ayuda:
        'Datos de CIMA, el vademécum de España (AEMPS). Es solo de consulta: los nombres comerciales y la condición de receta son los de allá.',
    },
    buscador: {
      ejemplo: 'Ej: ibuprofeno',
      buscar: 'Buscar',
      avisoVacio: 'Escribí el nombre de un medicamento.',
      errorRed: 'No se pudo consultar el vademécum. Revisá tu conexión e intentá de nuevo.',
      buscando: 'Buscando…',
      reintentar: 'Reintentar',
      conReceta: 'Con receta',
      elegir: 'Elegir ›',
      mostrando: (mostrados, total) =>
        `Mostrando los primeros ${mostrados} de ${total}. Probá con un nombre más específico.`,
      pista: 'Escribí el nombre de un medicamento y apretá Buscar.',
      sinResultados: (busqueda) => `No hay medicamentos que coincidan con «${busqueda}».`,
    },
    desplegable: { cerrar: 'Cerrar', sinCoincidencias: 'Ninguna opción coincide con la búsqueda.', sinOpciones: 'No hay opciones para elegir.' },
    preconsulta: {
      campos: {
        motivo: 'Motivo de la consulta',
        duracion: 'Desde cuándo',
        sintomas: 'Síntomas',
        medicacion: 'Medicación actual',
        alergias: 'Alergias',
        adicional: 'Algo más',
      },
      noInformo: 'No informó',
    },
  },
  en: {
    menu: { agenda: 'Schedule', pacientes: 'Patients', recetas: 'Prescriptions', perfil: 'Profile' },
    estados: {
      confirmado: 'Confirmed',
      pendiente: 'Pending',
      cancelado: 'Cancelled',
      atendido: 'Seen',
      ausente: 'No-show',
    },
    fechas: {
      dias: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      hoy: 'TODAY',
      larga: (diaSemana, dia, mes) => `${diaSemana}, ${TEXTOS_MEDICO.en.fechas.meses[mes - 1]} ${dia}`,
    },
    agenda: {
      tituloHoy: "Today's schedule",
      titulo: 'Your schedule',
      turnos: 'appointments',
      confirmados: 'confirmed',
      pendientes: 'pending',
      riesgoAlto: 'high risk',
      cantidadTurnos: (cantidad) => `${cantidad} appt.`,
      filtros: { todos: 'All', pendientes: 'Pending', confirmados: 'Confirmed', atendidos: 'Seen' },
      sinTurnosDia: 'You have no appointments for this day.',
      sinTurnosFiltro: 'No appointments match this filter.',
      paciente: 'Patient',
      preconsultaLista: 'pre-visit form ready',
      sinPreconsulta: 'no pre-visit form',
      interaccionDetectada: 'Drug interaction detected',
      riesgoAltoChip: 'High risk',
      duracion: '20 min',
      interaccionDetalle: 'Interaction detected:',
      preconsulta: 'Pre-visit form',
      sinCompletarPreconsulta: "They haven't completed the pre-visit form yet.",
      historiaClinica: 'Medical history',
      medicacionHabitual: 'Usual medication',
      sinMedicacion: 'No medication on file.',
      alergias: 'Allergies',
      ultimaConsulta: 'Last visit',
      consulta: 'Visit',
      sinConsultaAnotada: "You haven't written up the visit yet.",
      editarConsulta: 'Edit visit',
      anotarConsulta: 'Write up visit',
      avisoConsulta: "It goes into the patient's medical history. Saving it marks the appointment as seen.",
      motivo: 'Reason',
      motivoEjemplo: 'Why they came',
      diagnostico: 'Diagnosis',
      diagnosticoEjemplo: 'E.g. Acute pharyngitis',
      errorDiagnostico: 'Enter the diagnosis.',
      indicaciones: 'Instructions',
      indicacionesEjemplo: 'Treatment, tests, when to come back',
      notasPrivadas: 'Private notes',
      notasEjemplo: 'Only you can see them',
      volver: 'Back',
      guardarConsulta: 'Save visit',
      confirmar: 'Confirm',
      atendido: 'Seen',
      marcarAtendido: 'Mark as seen',
      noAsistio: "Patient didn't show up",
      cancelarTurno: 'Cancel appointment',
      avisoCorreccion: 'If you marked it by mistake, fix it: the absence stops adding risk points to the patient.',
      siAsistio: 'Patient did show up',
      confirmarCancelacion: 'Are you sure you want to cancel this appointment?',
      no: 'No',
      siCancelar: 'Yes, cancel',
    },
    pacientes: {
      tusPacientes: 'Your patients',
      delConsultorio: 'Clinic patients',
      mios: 'My patients',
      todos: 'All',
      buscar: 'Search by name...',
      cantidad: (cantidad) => `${cantidad} patient${cantidad === 1 ? '' : 's'}`,
      sinPacientes: "You don't have patients with appointments yet.",
      sinCoincidencias: 'No patients with that name.',
      sinTurnos: 'No appointments',
      proximo: (diaSemana, dia, hora) => `Next: ${diaSemana} ${dia} · ${hora}`,
      ultimo: (diaSemana, dia, hora) => `Last: ${diaSemana} ${dia} · ${hora}`,
      riesgo: 'Risk',
    },
    tabla: {
      buscador: 'Search by name, ID or health insurance',
      cantidad: (cantidad) => `${cantidad} patient${cantidad === 1 ? '' : 's'} · tap one to book an appointment`,
      paciente: 'Patient',
      cobertura: 'Insurance',
      turno: 'Appt.',
      riesgo: 'Risk',
      vacio: 'No patient found.',
      ficha: 'Record ›',
      nivelesRiesgo: { bajo: 'low', 'en-riesgo': 'medium', alto: 'high' },
    },
    ficha: {
      volver: '‹ Patients',
      noEncontrado: 'Patient not found.',
      datos: 'Details',
      cobertura: 'Insurance',
      afiliado: 'Member number',
      alergias: 'Allergies',
      medicacion: 'Medication',
      sinMedicamentos: 'No medication on file.',
      recetasHechas: 'Prescriptions you wrote',
      sinRecetas: "You haven't written any prescriptions for them yet.",
      historiaClinica: 'Medical history',
      sinConsultas: 'No visits written up yet.',
      conVos: 'With you',
      turnosConVos: 'Appointments with you',
      sinPreconsulta: 'No pre-visit form',
      ocultarPreconsulta: 'Hide pre-visit form ▴',
      verPreconsulta: 'View pre-visit form ▾',
    },
    consulta: { motivo: 'Reason', diagnostico: 'Diagnosis', indicaciones: 'Instructions', notasPrivadas: 'Private notes' },
    recetas: {
      titulo: 'Prescriptions',
      nueva: '+ New prescription',
      vigentes: (cantidad) => `Active (${cantidad})`,
      historial: (cantidad) => `History (${cantidad})`,
      vademecum: 'Drug index ›',
      sinVigentes: 'You have no active prescriptions.',
      sinVencidas: 'You have no expired prescriptions yet.',
      vencio: (fecha) => `Expired on ${fecha}`,
      vigenteHasta: (fecha) => `Valid until ${fecha}`,
      editar: 'Edit ›',
      paciente: 'Patient',
      nombreDePaciente: 'Patient',
      editarReceta: 'Edit prescription',
      nuevaReceta: 'New prescription',
      elegirPaciente: 'Choose a patient',
      buscarPaciente: 'Search by name',
      sinPacientesConTurnos: "You don't have patients with appointments yet.",
      medicamento: 'Medication',
      buscarEnVademecum: 'Search the drug index ›',
      medicamentoEjemplo: 'E.g. Amoxicillin 500 mg',
      indicacion: 'Instructions',
      indicacionEjemplo: 'E.g. 1 tablet every 8 h for 7 days',
      riesgo: 'Risk',
      puedeSerRiesgoso: 'May be risky with other medications',
      cancelar: 'Cancel',
      guardarCambios: 'Save changes',
      emitir: 'Issue prescription',
      eliminar: 'Delete prescription',
      confirmarEliminar: 'Delete this prescription? The patient will no longer see it and this cannot be undone.',
      noVolver: 'No, go back',
      siEliminar: 'Yes, delete',
      errorPaciente: 'Choose a patient',
      errorMedicamento: 'The medication is required',
      errorIndicacion: 'Enter the dose or how often to take it',
      volverAReceta: '‹ Back to the prescription',
      buscarMedicamento: 'Search medication',
      ayudaBuscador: "Spain's drug index (AEMPS). Pick one to load its name into the prescription; you can edit it afterwards.",
    },
    vademecum: {
      volver: '‹ Prescriptions',
      titulo: 'Drug index',
      ayuda:
        "Data from CIMA, Spain's drug index (AEMPS). It's for reference only: brand names and prescription status are the Spanish ones.",
    },
    buscador: {
      ejemplo: 'E.g. ibuprofeno',
      buscar: 'Search',
      avisoVacio: 'Enter a medication name.',
      errorRed: "Couldn't reach the drug index. Check your connection and try again.",
      buscando: 'Searching…',
      reintentar: 'Try again',
      conReceta: 'Prescription only',
      elegir: 'Choose ›',
      mostrando: (mostrados, total) => `Showing the first ${mostrados} of ${total}. Try a more specific name.`,
      pista: 'Enter a medication name and press Search.',
      sinResultados: (busqueda) => `No medications match “${busqueda}”.`,
    },
    desplegable: { cerrar: 'Close', sinCoincidencias: 'No option matches your search.', sinOpciones: 'No options to choose from.' },
    preconsulta: {
      campos: {
        motivo: 'Reason for the visit',
        duracion: 'Since when',
        sintomas: 'Symptoms',
        medicacion: 'Current medication',
        alergias: 'Allergies',
        adicional: 'Anything else',
      },
      noInformo: 'Not reported',
    },
  },
};
