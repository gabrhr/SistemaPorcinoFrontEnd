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
export const resultCodeUserError = 1008;

// Filtro de estados en tabla 
export const allStatus = {
    value: "",
    text: "Todos"
}

// Estados
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

export const loteTipos = {
  celo: "Celo",
  servicio: "Servicio"
}

export const alimentoCategorias = {
  cerda: "Cerda",
  lechon: "Lechón"
}

export const loteEstado = {
  enProceso: "En Proceso",
  finalizado: "Finalizado"
}

export const celoEstado = loteEstado;

export const servicioEstado = {
  porServir: "Por servir",
  enServicio: "En servicio",
  gestacion: "Gestacion",
  fallido: "Fallido",
  finalizado:"Finalizado"
}

export const tiposInseminacion = {
  inseminacion: "Inseminación Artificial",
  monta: "Monta Natural"
}

// Obtener estados

export const listEstadosCerda = () => {
  const estados = Object.values(cerdaEstados)
  const estadosList = []

  estados.forEach((value) => {
    const text = value === 'vacia' ? 'Vacía' : value; // Agregar tilde solo a "Vacia"
    estadosList.push({value, text})
  })

  return estadosList
}

export const listTiposLote = () => {
  const list = Object.values(loteTipos)
  const out = []

  list.forEach((value) => {
    out.push({value, text: value})
  })

  return out
}

const generalList = (listado) => {
  const list = Object.entries(listado)
  const out = []

  list.forEach((e) => {
    out.push({value:e[0] , text: e[1]})
  })

  return out
}

export const listCategoriasAlimento = () => {
  return generalList(alimentoCategorias)
}

export const listEstadoLotes = () => {
  return generalList(loteEstado)
}

export const listEstadoCelo = () => {
  const list = Object.values(celoEstado)
  const out = []

  list.forEach((value) => {
    out.push({value, text: value})
  })

  return out
}


export const listEstadoServicio = () => {
  const list = Object.values(servicioEstado)
  const out = []

  list.forEach((value) => {
    out.push({value, text: value})
  })

  return out
}

export const lisTiposInseminacion = () => {
  return generalList(tiposInseminacion)
}