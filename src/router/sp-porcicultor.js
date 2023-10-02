import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

import SuspenseLoader from 'src/components/SuspenseLoader';


const Loader = (Component) => (props) =>
(
  <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );
  
const Lineas = Loader(lazy(() => import('src/content/porcicultor/porcinos/lineas')));
const Verracos = Loader(lazy(() => import('src/content/porcicultor/porcinos/verracos')));
const Cerdas = Loader(lazy(() => import('src/content/porcicultor/porcinos/cerdas')));
const CerdaNuevo = Loader(lazy(() => import('src/content/porcicultor/porcinos/cerdas/addCerda')));
const CerdaDetalle = Loader(lazy(() => import('src/content/porcicultor/porcinos/cerdas/editCerda')));
const Lotes = Loader(lazy(() => import('src/content/porcicultor/porcinos/lotes')));
const LoteDetalle = Loader(lazy(() => import('src/content/porcicultor/porcinos/lotes/addEditLote')));

const Celos = Loader(lazy(() => import('src/content/porcicultor/manejo/celo')));
const CeloLoteDetalle = Loader(lazy(() => import('src/content/porcicultor/manejo/celoLote')));
const CeloLoteCerdaDetalle = Loader(lazy(() => import('src/content/porcicultor/manejo/celoLote/cerdaCelo')));

const Servicios = Loader(lazy(() => import('src/content/porcicultor/manejo/servicio')));
const ServicioLoteDetalle = Loader(lazy(() => import('src/content/porcicultor/manejo/servicioLote')));
const ServicioLoteCerdaDetalle = Loader(lazy(() => import('src/content/porcicultor/manejo/servicioLote/cerdaServicio')));

const Maternidad = Loader(lazy(() => import('src/content/porcicultor/manejo/maternidad')));
const Engorde = Loader(lazy(() => import('src/content/porcicultor/manejo/engorde')));

// Alimentacion
const Alimentos = Loader(lazy(() => import('src/content/porcicultor/alimentacion/alimentos')));
const AlimentoDetalle = Loader(lazy(() => import('src/content/porcicultor/alimentacion/alimentos/addEditAlimento')));


// Granja
const Parametros = Loader(lazy(() => import('src/content/porcicultor/granja/parametros')));



const porcicultorRoutes = [
    {
        path: '/',
        element: <Navigate to="porcinos/lineas" replace />
    },
    {
        path: 'porcinos/lineas',
        element: <Lineas />
    },
    {
      path: 'porcinos/verracos',
      element: <Verracos />
    },
    {
      path: 'porcinos/cerdas',
      element: <Cerdas />
    },
    {
      path: 'porcinos/cerdas/nuevo',
      element: <CerdaNuevo />
    },
    {
      path: 'porcinos/cerdas/detalle',
      element: <CerdaDetalle />
    },
    {
      path: 'porcinos/lotes',
      element: <Lotes />
    },
    {
      path: 'porcinos/lotes/detalle',
      element: <LoteDetalle />
    },
    {
      path: 'manejo/celo',
      element: <Celos />
    },
    {
      path: 'manejo/celo/lote-detalle',
      element: <CeloLoteDetalle />
    },
    {
      path: 'manejo/celo/lote-detalle/cerda-celo',
      element: <CeloLoteCerdaDetalle />
    },
    {
      path: 'manejo/servicio',
      element: <Servicios />
    },
    {
      path: 'manejo/servicio/lote-detalle',
      element: <ServicioLoteDetalle />
    },
    {
      path: 'manejo/servicio/lote-detalle/cerda-servicio',
      element: <ServicioLoteCerdaDetalle />
    },
    {
      path: 'manejo/maternidad',
      element: <Maternidad />
    },
    {
      path: 'manejo/engorde',
      element: <Engorde />
    },
    {path: 'alimentacion/alimentos',
     element: <Alimentos/>
    },
    {path: 'alimentacion/alimentos/Detalle',
     element: <AlimentoDetalle/>
    },
    {
      path: 'granja/parametros',
      element: <Parametros />
    }
]

export default porcicultorRoutes;