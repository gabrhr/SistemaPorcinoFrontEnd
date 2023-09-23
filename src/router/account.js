import { Suspense, lazy } from 'react';

import SuspenseLoader from 'src/components/SuspenseLoader';
import Guest from 'src/components/Guest';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Account

const LoginCover = Loader(
  lazy(() => import('src/content/pages/Auth/Login/Cover'))
);

const RegisterClassic = Loader(
  lazy(() => import('src/content/pages/Auth/Register/Classic'))
);

const RecoverPassword = Loader(
  lazy(() => import('src/content/pages/Auth/RecoverPassword'))
);

const accountRoutes = [
  {
    path: 'login',
    element: (
      <Guest>
        <LoginCover />
      </Guest>
    )
  },
  {
    path: 'register/classic',
    element: <RegisterClassic />
  },
  {
    path: 'recover-password',
    element: <RecoverPassword />
  }
];

export default accountRoutes;
