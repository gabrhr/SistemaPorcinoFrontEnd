export const departamentosPeru = [
    { key: 0, value: 'Amazonas' },
    { key: 1, value: 'Áncash' },
    { key: 2, value: 'Apurímac' },
    { key: 3, value: 'Arequipa' },
    { key: 4, value: 'Ayacucho' },
    { key: 5, value: 'Cajamarca' },
    { key: 6, value: 'Callao' },
    { key: 7, value: 'Cusco' },
    { key: 8, value: 'Huancavelica' },
    { key: 9, value: 'Huánuco' },
    { key: 10, value: 'Ica' },
    { key: 11, value: 'Junín' },
    { key: 12, value: 'La Libertad' },
    { key: 13, value: 'Lambayeque' },
    { key: 14, value: 'Lima' },
    { key: 15, value: 'Loreto' },
    { key: 16, value: 'Madre de Dios' },
    { key: 17, value: 'Moquegua' },
    { key: 18, value: 'Pasco' },
    { key: 19, value: 'Piura' },
    { key: 20, value: 'Puno' },
    { key: 21, value: 'San Martín' },
    { key: 22, value: 'Tacna' },
    { key: 23, value: 'Tumbes' },
    { key: 24, value: 'Ucayali' }
  ];



// Back end Code
export const resultCodeOk = 0;
export const resultCodeDuplicatedError = 1006;
export const resultCodeUserError = 1006;

// Filtro de estados en tabla 
export const allStatus = {
    value: "",
    text: "Todos"
}

// Estaddos
export const cerdaEstados = {
  reemplazo: 'Reemplazo',
  porservir: 'Por servir',
  servida: 'Servida',
  gestante:'Gestante',
  parida: 'Parida',
  lactante:'Lactante',
  destetada: 'Destetada',
  descartada: 'Descartada',
  vacia:'Vacia'
}

export const listEstadosCerda = () => {
  const estados = Object.values(cerdaEstados)
  const estadosList = []

  estados.forEach((value) => {
    const text = value === 'vacia' ? 'Vacía' : value; // Agregar tilde solo a "Vacia"
    estadosList.push({value, text})
  })

  return estadosList
}