import Authenticated from 'src/components/Authenticated';

import AccentHeaderLayout from 'src/layouts/AccentHeaderLayout';
import BaseLayout from 'src/layouts/BaseLayout';
import accountRoutes from './account';
import baseRoutes from './base';
import adminRoutes from './sp-admin';
import porcicultorRoutes from './sp-porcicultor';

const router = [
  {
    path: 'account',
    children: accountRoutes
  },
  {
    path: '*',
    element: <BaseLayout />,
    children: baseRoutes
  },

  // Accent Header Layout
  {
    path: 'sp',
    element: (
      <Authenticated>
        <AccentHeaderLayout />
      </Authenticated>
    ),
    children: [
      {
        path: 'porcicultor',
        children: porcicultorRoutes
      },
      {
        path: 'admin',
        children: adminRoutes
      }
    ]
  }
];

export default router;
