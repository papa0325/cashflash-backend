import publicRoutes from './public/index';
import webhooksRoutes from './webhooks/index';

export default [
  ...publicRoutes,
  ...webhooksRoutes
];
