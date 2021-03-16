import { UserController } from './controller/UserController';
import { OperationController } from './controller/OperationController';

export const AppRoutes = [
  {
    method: 'get',
    route: '/users',
    controller: UserController,
    action: 'all'
  },
  {
    method: 'get',
    route: '/users/:id',
    controller: UserController,
    action: 'one'
  },
  {
    method: 'post',
    route: '/users',
    controller: UserController,
    action: 'save'
  },
  {
    method: 'delete',
    route: '/users/:id',
    controller: UserController,
    action: 'remove'
  },
  //Operation
  {
    method: 'get',
    route: '/operations',
    controller: OperationController,
    action: 'all'
  },
  {
    method: 'get',
    route: '/operations/:id',
    controller: OperationController,
    action: 'one'
  },
  {
    method: 'post',
    route: '/operations',
    controller: OperationController,
    action: 'save'
  },
  {
    method: 'delete',
    route: '/operations/:id',
    controller: OperationController,
    action: 'remove'
  },
  {
    method: 'post',
    route: '/operations/uploads',
    controller: OperationController,
    action: 'upload'
  }
];
