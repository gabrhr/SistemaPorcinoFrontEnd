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
  destetada: 'Destetada',
  descartada: 'Descartada',
  gestante:'Gestante',
  lactante:'Lactante',
  parida: 'Parida',
  porservir: 'Por servir',
  servida: 'Servida',
  reemplazo: 'Reemplazo',
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

export const engordeEstado = {
  precebo: "Precebo",
  finalizado: "Finalizado",
  cebo: "Cebo"
}

export const lechonEstado = {
  muerto: "Muerto",
  destetado: "Destetado",
  lactante: "Lactante"
}

export const vacunaTipo = {
  cc: "Coli-clostridium",
  ple: "Parvovirus-leptospirosis-erisipela",
  cp: "Cólera porcino",
  myc: "Mycoplasma y Circovirus"
}

// Obtener estados

export const listEstadosCerda = () => {
  const estados = Object.values(cerdaEstados)
  const estadosList = []

  estados.forEach((value) => {
    const text = value === 'Vacia' ? 'Vacía' : value; // Agregar tilde solo a "Vacia"
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

export const listEstadoEngorde = () => {
  const list = Object.values(engordeEstado)
  const out = []

  list.forEach((value) => {
    out.push({value, text: value})
  })

  return out
}

export const listTiposVacuna = () => {
  return generalList(vacunaTipo)
}

export const listTiposVacunaServicio = () => {

  const obj = {
    cc: vacunaTipo.cc,
    ple: vacunaTipo.ple,
    cp: vacunaTipo.cp,
    otro: "Otro"
  }

  return generalList(obj)
}

export const listTiposVacunaReemp = () => {

  const obj = {
    cp: vacunaTipo.cp,
    ple: vacunaTipo.ple,
    otro: "Otro"
  }

  return generalList(obj)
}


export const listTiposVacunaEngorde = () => {

  const obj = {
    cp: vacunaTipo.cp,
    myc: vacunaTipo.myc,
    otro: "Otro"
  }

  return generalList(obj)
}

export const listadoCalendario = [
  {
    texto: "Vacunas",
    color: "red",
    value: "vacuna"
  },
  {
    texto: "Partos probables",
    color: "blue",
    value: "parto"
  },
  {
    texto: "Servicio verificación",
    color: "orange",
    value: "servicio"
  },
]

export const listadoCalendarioFilter = {
  all: true,
  vacuna: true,
  parto: true,
  servicio: true
}

export const listadoCalendarioFilterFalse = {
  all: false,
  vacuna: false,
  parto: false,
  servicio: false
}

export const coloresCalendario = {
  vacuna: "red",
  parto: "blue",
  servicio: "orange"
}

export const fertilidad = [
  "99 %",
  "97 %",
  "98 %",
  "95 %",
  "99 %",
  "0 %"
]