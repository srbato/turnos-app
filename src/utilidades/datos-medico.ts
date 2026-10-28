import { MedicamentoPropio } from '@/contextos/MedicamentosContext';
import { Paciente } from '@/datos/consultorio';
import { detectarInteracciones } from '@/datos/interacciones';
import { Receta } from '@/datos/recetas';

// Un medicamento del paciente tal como lo ve el médico.
export type MedicamentoParaMedico = {
  id: string;
  nombre: string;
  detalle: string;
  indicadoPor: string; // médico que lo recetó ('' si lo cargó el paciente)
  riesgo: boolean; // participa de una interacción detectada
};

// Arma los datos de un paciente para las pantallas del médico: el paciente, sus medicamentos (recetados y propios) y
// las interacciones que se detectan entre ellos. Es una función común: cada pantalla le pasa lo que ya leyó de los
// contextos. Si el paciente no está en la lista, paciente queda undefined.
export function datosParaMedico(
  idPaciente: string,
  pacientes: Paciente[],
  medicamentosPropios: MedicamentoPropio[],
  recetas: Receta[]
) {
  const paciente = pacientes.find((p) => p.id === idPaciente);
  const propios = medicamentosPropios.filter((medicamento) => medicamento.idPaciente === idPaciente);

  const recetasDelPaciente = recetas.filter((receta) => receta.idPaciente === idPaciente);
  const nombres = [
    ...recetasDelPaciente.map((receta) => receta.medicamento),
    ...propios.map((medicamento) => medicamento.nombre),
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
    ...propios.map((medicamento) => ({
      id: `propio-${medicamento.id}`,
      nombre: medicamento.nombre,
      detalle: [medicamento.dosis, medicamento.motivo ? `Para: ${medicamento.motivo}` : '']
        .filter((texto) => texto !== '')
        .join(' · '),
      indicadoPor: '',
      riesgo: enRiesgo.includes(medicamento.nombre),
    })),
  ];

  return { paciente, medicamentos, interacciones };
}
