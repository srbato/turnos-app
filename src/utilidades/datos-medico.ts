import type { MedicamentoPropio } from '@/contextos/MedicamentosContext';
import type { PerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { nombreCobertura } from '@/datos/catalogo';
import { ID_PACIENTE_APP, PACIENTES, type Paciente } from '@/datos/consultorio';
import { detectarInteracciones } from '@/datos/interacciones';
import type { Receta } from '@/datos/recetas';

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
export function datosParaMedico(
  perfil: PerfilPaciente,
  medicamentosPropios: MedicamentoPropio[],
  recetas: Receta[]
) {
  // Lista de pacientes: el que usa la app muestra los datos que editó en su perfil.
  const [primerNombre, ...resto] = perfil.nombre.trim().split(/\s+/);
  const pacientes: Paciente[] = PACIENTES.map((paciente) => {
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
    };
  });
  const paciente = pacientes.find((p) => p.id === ID_PACIENTE_APP) as Paciente;

  const recetasDelPaciente = recetas.filter((receta) => receta.idPaciente === ID_PACIENTE_APP);
  const nombres = [
    ...recetasDelPaciente.map((receta) => receta.medicamento),
    ...medicamentosPropios.map((medicamento) => medicamento.nombre),
  ];
  const interacciones = detectarInteracciones(nombres);
  const enRiesgo = interacciones.flatMap((interaccion) => interaccion.medicamentos);

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
