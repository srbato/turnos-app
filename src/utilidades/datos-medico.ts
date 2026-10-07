import { MedicamentoPropio } from '@/contextos/MedicamentosContext';
import { PerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { nombreCobertura } from '@/datos/catalogo';
import { ID_PACIENTE_APP, Paciente } from '@/datos/consultorio';
import { detectarInteracciones } from '@/datos/interacciones';
import { Receta } from '@/datos/recetas';
import { palabras } from '@/utilidades/texto';

// Un medicamento del paciente tal como lo ve el médico.
export type MedicamentoParaMedico = {
  id: string;
  nombre: string;
  detalle: string;
  indicadoPor: string; // médico que lo recetó ('' si lo cargó el paciente)
  riesgo: boolean; // participa de una interacción detectada
};

// Arma los datos del paciente que usa la app para las pantallas del médico: su perfil actualizado,
// sus medicamentos (recetados y propios) y las interacciones que se detectan entre ellos.
// Es una función común: cada pantalla le pasa lo que ya leyó de los contextos.
// Lista de pacientes del consultorio activo (se la pasa cada pantalla, leída de useConsultorio): el que usa la app
// muestra los datos que editó en su perfil.
// No incluye nada clínico del paciente de la app (medicación, recetas, interacciones): eso es solo para el médico.
export function pacientesConPerfil(perfil: PerfilPaciente, pacientesDelConsultorio: Paciente[]) {
  const [primerNombre, ...resto] = palabras(perfil.nombre);
  const pacientes: Paciente[] = pacientesDelConsultorio.map((paciente) => {
    if (paciente.id !== ID_PACIENTE_APP) return paciente;
    const coberturas = perfil.coberturaIds.map(nombreCobertura);
    return {
      ...paciente,
      nombre: primerNombre,
      apellido: resto.join(' '),
      iniciales: [primerNombre, ...resto]
        .slice(0, 2)
        .map((palabra) => palabra[0].toUpperCase())
        .join(''),
      email: perfil.email,
      cobertura: coberturas.length > 0 ? coberturas.join(' / ') : 'Sin cobertura cargada',
      plan: '',
      // Un N° de afiliado por cada obra social que lo tenga cargado.
      numeroAfiliado:
        perfil.coberturaIds
          .filter((id) => perfil.numerosAfiliado[id])
          .map((id) => `${nombreCobertura(id)}: ${perfil.numerosAfiliado[id]}`)
          .join(' · ') || 'No cargado',
      alergias: perfil.alergias.trim() || 'No informó',
    };
  });
  return pacientes;
}

export function datosParaMedico(
  perfil: PerfilPaciente,
  pacientesDelConsultorio: Paciente[],
  medicamentosPropios: MedicamentoPropio[],
  recetas: Receta[]
) {
  const pacientes = pacientesConPerfil(perfil, pacientesDelConsultorio);
  // El paciente de la app siempre está en la lista (pacientesConPerfil lo agrega).
  const paciente = pacientes.filter((p) => p.id === ID_PACIENTE_APP)[0];

  const recetasDelPaciente = recetas.filter((receta) => receta.idPaciente === ID_PACIENTE_APP);
  const nombres = [
    ...recetasDelPaciente.map((receta) => receta.medicamento),
    ...medicamentosPropios.map((medicamento) => medicamento.nombre),
  ];
  const interacciones = detectarInteracciones(nombres);
  // Todos los medicamentos que aparecen en alguna interacción.
  const enRiesgo: string[] = [];
  interacciones.forEach((interaccion) => {
    interaccion.medicamentos.forEach((medicamento) => enRiesgo.push(medicamento));
  });

  const medicamentos: MedicamentoParaMedico[] = [
    ...recetasDelPaciente.map((receta) => ({
      id: `receta-${receta.id}`,
      nombre: receta.medicamento,
      detalle: receta.indicacion,
      indicadoPor: receta.medico,
      riesgo: enRiesgo.includes(receta.medicamento),
    })),
    ...medicamentosPropios.map((medicamento) => ({
      id: `propio-${medicamento.id}`,
      nombre: medicamento.nombre,
      detalle: [medicamento.dosis, medicamento.motivo ? `Para: ${medicamento.motivo}` : '']
        .filter((texto) => texto !== '')
        .join(' · '),
      indicadoPor: '',
      riesgo: enRiesgo.includes(medicamento.nombre),
    })),
  ];

  return { pacientes, paciente, medicamentos, interacciones };
}
