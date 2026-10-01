import { createContext, ReactNode, useState } from 'react';
import { Medicamento, MEDICAMENTOS, Paciente, PACIENTE } from './datos';

// Guarda los datos del paciente que pueden cambiar mientras la app está abierta:
// sus datos personales (se editan desde el perfil), sus medicamentos y si ya
// le avisó al médico de una combinación riesgosa.
// Si se cierra la app, se vuelve a los datos de prueba.

export const PacienteContext = createContext({
  paciente: PACIENTE,
  actualizarPaciente: (pacienteNuevo: Paciente) => {},
  medicamentos: MEDICAMENTOS,
  agregarMedicamento: (medicamentoNuevo: Medicamento) => {},
  quitarMedicamento: (id: string) => {},
  avisoEnviado: false,
  avisarAlMedico: () => {},
});

type PropsPacienteProvider = {
  children: ReactNode;
};

export function PacienteProvider(props: PropsPacienteProvider) {
  const [paciente, setPaciente] = useState(PACIENTE);
  const [medicamentos, setMedicamentos] = useState(MEDICAMENTOS);
  const [avisoEnviado, setAvisoEnviado] = useState(false);

  const actualizarPaciente = (pacienteNuevo: Paciente) => {
    setPaciente(pacienteNuevo);
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

  return (
    <PacienteContext.Provider
      value={{
        paciente,
        actualizarPaciente,
        medicamentos,
        agregarMedicamento,
        quitarMedicamento,
        avisoEnviado,
        avisarAlMedico,
      }}>
      {props.children}
    </PacienteContext.Provider>
  );
}
