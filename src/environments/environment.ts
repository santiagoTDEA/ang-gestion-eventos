export const environment = {
  production: false,
  // apiUrl: 'http://localhost:3000/gestion-eventos/'
  apiUrl: 'https://nes-gestion-eventos.onrender.com/gestion-eventos/'
};

export const modulosAplicacion = [
  { value: 'facultades', label: 'Facultades', icono: '🏛️'  },
  { value: 'usuarios', label: 'Usuarios', icono: '👤' },
  { value: 'roles', label: 'Roles', icono: '🔑' },
  { value: 'personas', label: 'Personas', icono: '🧑' },
  { value: 'estados', label: 'Estados', icono: '⚙️' }
];