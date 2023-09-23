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
// const Lotes = Loader(lazy(() => import('src/content/porcicultor/porcinos/lotes')));

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
    }
    /* ,
    {
      path: 'porcinos/lotes',
      element: <Lotes />
    } */
]

export default porcicultorRoutes;