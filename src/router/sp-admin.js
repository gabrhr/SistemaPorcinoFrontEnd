import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';

import SuspenseLoader from 'src/components/SuspenseLoader';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Admin

const StatusComingSoon = Loader(
  lazy(() => import('src/content/pages/Status/ComingSoon'))
);

const adminRoutes = [
  {
    path: '/',
    element: <Navigate to="porcicultores" replace />
  },
  {
    path: 'porcicultores',
    element: <StatusComingSoon />
  }
];

export default adminRoutes;