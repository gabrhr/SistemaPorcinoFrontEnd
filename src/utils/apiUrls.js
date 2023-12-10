// Lineas genéticas

const urlLinea = "lineaGenetica/"
export const lineaQueryAPI = `${urlLinea}query`
export const lineaQueryAllAPI = `${urlLinea}query-all`
export const lineaRegisterAPI = `${urlLinea}register`
export const lineaUpdateAPI = `${urlLinea}update`
export const lineaDeleteAPI = `${urlLinea}delete`

// Verraco
const urlVerraco = "verraco/"
export const verracoQueryAPI = `${urlVerraco}query`
export const verracoRegisterAPI = `${urlVerraco}register`
export const verracoUpdateAPI = `${urlVerraco}update`
export const verracoDeleteAPI = `${urlVerraco}delete`
export const verracoQueryAllAPI = `${urlVerraco}query-all`

// Cerda
const urlCerda = "cerda/"
export const cerdaQueryAPI = `${urlCerda}query`
export const cerdaRegisterAPI = `${urlCerda}register`
export const cerdaUpdateAPI = `${urlCerda}update`
export const cerdaDeleteAPI = `${urlCerda}delete`
export const cerdaDescartarAPI = `${urlCerda}descartar`
export const cerdaFindByIdAPI = `${urlCerda}find`

export const cerdaToAddLoteAPI = `${urlCerda}getCerdaToAddLote`


// Lote
const urlLote = "lote/"
export const loteQueryAPI = `${urlLote}query`
export const loteRegisterAPI = `${urlLote}register`
export const loteUpdateAPI = `${urlLote}update`
export const loteDeleteAPI = `${urlLote}delete`
export const loteFindByIdAPI = `${urlLote}find`

// Celo
const urlCelo = "celo/"
export const celoQueryAPI = `${urlCelo}query`
export const celoRegisterAPI = `${urlCelo}register`
export const celoUpdateAPI = `${urlCelo}update`
export const celoDeleteAPI = `${urlCelo}delete`
export const celoGetLotesPendientesAPI = `${urlCelo}lotesPendientes`


// Celo Lote
export const celoLoteQueryAPI = `${urlCelo}loteDetalle`
export const celoLoteRegisterAPI = `${urlCelo}register`
export const celoLoteUpdateAPI = `${urlCelo}update`
export const celoLoteDeleteAPI = `${urlCelo}delete`
export const cerdaCeloFindByIdAPI = `${urlCelo}find`

export const celoAptaServicioAPI = `${urlCelo}aptaServicio`

export const cerdaCeloDescartarAPI = `${urlCelo}descartarCerda`
export const deteccionRegisterAPI = `${urlCelo}deteccion/register`
export const deteccionDeleteAPI = `${urlCelo}deteccion/delete`


// Servicio y Gestación
const urlServicio = "servicio/"
export const servicioQueryAPI = `${urlServicio}query`
export const servicioRegisterAPI = `${urlServicio}register`
export const servicioUpdateAPI = `${urlServicio}update`
export const servicioDeleteAPI = `${urlServicio}delete`
export const servicioGetLotesPendientesAPI = `${urlServicio}lotesPendientes`

// Servicio Lote
export const servicioLoteQueryAPI = `${urlServicio}loteDetalle`
export const servicioLoteInseminacionAPI = `${urlServicio}inseminacion/update`
export const servicioLoteVerificacionesAPI = `${urlServicio}verificacion/update`
export const servicioLoteGestacionAPI = `${urlServicio}gestacion/update`
export const servicioTerminarGestacionAPI = `${urlServicio}terminarGestacion`
export const servicioFalloRegisterAPI = `${urlServicio}fallo/register`

export const cerdaServicioFindByIdAPI = `${urlServicio}find`

// Meternidad
const urlMaternidad = "maternidad/"
export const maternidadQueryAPI = `${urlMaternidad}query`
export const maternidadLoteQueryAPI = `${urlMaternidad}loteDetalle`

// Maternidad Lote
export const maternidadFindByIdAPI = `${urlMaternidad}find`
export const maternidadUpdateAPI = `${urlMaternidad}update`
export const mLechonRegisterAPI = `${urlMaternidad}lechon/register`
export const mLechonDeleteAPI = `${urlMaternidad}lechon/delete`
export const mLechonDescartarAPI = `${urlMaternidad}lechon/descartar`
export const maternidadTerminarAPI = `${urlMaternidad}terminar`
export const pesosDesteteRegisterAPI = `${urlMaternidad}pesosDestete/register`

// Engorde
const urlEngorde = "engorde/"
export const engordeQueryAPI = `${urlEngorde}query`
export const engordeFindByIdAPI = `${urlEngorde}find`
export const engordeRegisterAPI = `${urlEngorde}register`
export const engordeUpdateAPI = `${urlEngorde}update`
export const camadaToAddAPI = `${urlEngorde}camadaToAdd`
export const engordeDeleteAPI = `${urlEngorde}delete`
export const preceboTerminarAPI = `${urlEngorde}precebo/terminar`
export const ceboTerminarAPI = `${urlEngorde}cebo/terminar`
export const pesosRegisterAPI = `${urlEngorde}peso/register`
export const lechonesCamadaIdAPI = `${urlEngorde}camada/lechones`


// Granja Parametros
const urlParametros = "parametrogranja/"
export const parametroFindByGranjaIdAPI = `${urlParametros}find`
export const paramatroUpdateAPI = `${urlParametros}update`

// Granja perfil
const urlUser = "user/"
export const perfilFindByGranjaIdAPI = `${urlUser}find`
export const perfilUpdateAPI = `${urlUser}update`

// Granja corral
const urlCorral = "corral/"
export const corralQueryAPI = `${urlCorral}query`
export const corralQueryAllAPI = `${urlCorral}query-all`
export const corralRegisterAPI = `${urlCorral}register`
export const corralUpdateAPI = `${urlCorral}update`
export const corralDeleteAPI = `${urlCorral}delete`


// Alimento
const urlAlimento = "alimento/"
export const alimentoQueryAPI = `${urlAlimento}query`
export const alimentoQueryAllAPI = `${urlAlimento}query-all`
export const alimentoRegisterAPI = `${urlAlimento}register`
export const alimentoUpdateAPI = `${urlAlimento}update`
export const alimentoDeleteAPI = `${urlAlimento}delete`
export const alimentoFindByIdAPI = `${urlAlimento}find`

// Alimento compras
export const compraRegisterAPI = `${urlAlimento}compra/register`
export const compraDeleteAPI = `${urlAlimento}compra/delete`

// Alimentacion - Control cerdas
export const controlCerdasQueryAPI = `${urlAlimento}controlCerda/query`
export const controlCerdasRegisterAPI = `${urlAlimento}controlCerda/register`
export const controlCerdasMasivoAPI = `${urlAlimento}controlCerda/masivo`
export const controlCerdasDeleteAPI = `${urlAlimento}controlCerda/delete`
export const controlCerdasFindByIdAPI = `${urlAlimento}controlCerda/find`
export const controlCerdaEstadoTotaldAPI = `${urlAlimento}controlCerda/estado`

// Alimentacion - Control engorde
export const controlEngordeRegisterAPI = `${urlAlimento}controlEngorde/register`
export const controlEngordeQueryAPI = `${urlAlimento}controlEngorde/query`
export const controlEngordeDeleteAPI = `${urlAlimento}controlEngorde/delete`
export const controlEngordeFindByIdAPI = `${urlAlimento}controlEngorde/find`

// Alimentacion - Control cerdas
const urlSanidad = "sanidad/"
export const sanitarioServicioQueryAPI = `${urlSanidad}servicio/query`
export const sanitarioServicioFindByIdAPI = `${urlSanidad}servicio/find`
export const sanitarioReemplazoQueryAPI = `${urlSanidad}reemplazo/query`
export const sanitarioReemplazoFindByIdAPI = `${urlSanidad}reemplazo/find`
export const sanitarioEngordeQueryAPI = `${urlSanidad}engorde/query`
export const sanitarioEngordeFindByIdAPI = `${urlSanidad}engorde/find`
export const controlSanitarioRegisterAPI = `${urlSanidad}control/register`
export const controlSanitarioDeleteAPI = `${urlSanidad}control/delete`

// Calendario 
const urlData = "data/"
export const eventsFindAPI = `${urlData}calendar-date`
export const estGeneralAPI = `${urlData}estadisticas`
export const estCerdasAPI = `${urlData}est-cerdas`
export const estLechonesAPI = `${urlData}est-lechones`