import { createContext, ReactNode, useState } from 'react';
import { Medicamento, MEDICAMENTOS, Paciente, PACIENTES, Receta, RECETAS } from './datos';

// Guarda los datos de los pacientes que pueden cambiar mientras la app está abierta:
// la lista de pacientes (el que usa la app puede editar sus datos desde el perfil),
// sus medicamentos, si ya le avisó al médico de una combinación riesgosa,
// y las recetas que emiten los médicos.
// Si se cierra la app, se vuelve a los datos de prueba.

export const PacienteContext = createContext({
  pacientes: PACIENTES,
  paciente: PACIENTES[0],
  actualizarPaciente: (pacienteNuevo: Paciente) => {},
  medicamentos: MEDICAMENTOS,
  agregarMedicamento: (medicamentoNuevo: Medicamento) => {},
  quitarMedicamento: (id: string) => {},
  avisoEnviado: false,
  avisarAlMedico: () => {},
  recetas: RECETAS,
  emitirReceta: (recetaNueva: Receta) => {},
});

type PropsPacienteProvider = {
  children: ReactNode;
};

export function PacienteProvider(props: PropsPacienteProvider) {
  const [pacientes, setPacientes] = useState(PACIENTES);
  // El paciente que usa la app es el primero de la lista (todavía no hay registro).
  const paciente = pacientes[0];
  const [medicamentos, setMedicamentos] = useState(MEDICAMENTOS);
  const [avisoEnviado, setAvisoEnviado] = useState(false);
  const [recetas, setRecetas] = useState(RECETAS);

  const actualizarPaciente = (pacienteNuevo: Paciente) => {
    setPacientes(
      pacientes.map((pacienteDeLaLista) => {
        if (pacienteDeLaLista.id === pacienteNuevo.id) {
          return pacienteNuevo;
        }
        return pacienteDeLaLista;
      })
    );
  };

  const agregarMedicamento = (medicamentoNuevo: Medicamento) => {
    setMedicamentos([...medicamentos, medicamentoNuevo]);
  };

  const quitarMedicamento = (id: string) => {
    setMedicamentos(medicamentos.filter((medicamento) => medicamento.id !== id));
  };

  const avisarAlMedico = () => {
    setAvisoEnviado(true);
  };

  // Guarda la receta. Si es para el paciente que usa la app, además se suma
  // a sus medicamentos (así la ve en "Mis medicamentos").
  const emitirReceta = (recetaNueva: Receta) => {
    setRecetas([...recetas, recetaNueva]);

    if (recetaNueva.idPaciente === paciente.id) {
      setMedicamentos([
        ...medicamentos,
        {
          id: 'receta-' + recetaNueva.id,
          abreviatura: recetaNueva.medicamento.slice(0, 3).toUpperCase(),
          nombre: recetaNueva.medicamento,
          detalle: recetaNueva.indicacion,
          riesgo: recetaNueva.riesgo,
          indicadoPor: recetaNueva.medico,
        },
      ]);
    }
  };

  return (
    <PacienteContext.Provider
      value={{
        pacientes,
        paciente,
        actualizarPaciente,
        medicamentos,
        agregarMedicamento,
        quitarMedicamento,
        avisoEnviado,
        avisarAlMedico,
        recetas,
        emitirReceta,
      }}>
      {props.children}
    </PacienteContext.Provider>
  );
}
