import asignacionRutina from "./asignacion-rutina";
import clase from "./clase";
import detallePago from "./detalle-pago";
import gyms from "./gyms";
import inscripcionClase from "./inscripcion-clase";
import miembro from "./miembro";
import organizations from "./organizations";
import pago from "./pago";
import persona from "./persona";
import rol from "./rol";
import rutina from "./rutina";
import tipoMembresia from "./tipo-membresia";
import usuario from "./usuario";
import usuarioOrganization from "./usuario-organization";

export const modules = [
  asignacionRutina,
  clase,
  detallePago,
  gyms,
  inscripcionClase,
  miembro,
  organizations,
  pago,
  persona,
  rol,
  rutina,
  tipoMembresia,
  usuario,
  usuarioOrganization
];

export type ModuleDefinition = (typeof modules)[number];

export default modules;
