"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const UserController_1 = require("./controller/UserController");
const OperationController_1 = require("./controller/OperationController");
const FileController_1 = require("./controller/FileController");
exports.AppRoutes = [
    {
        method: 'get',
        route: '/users',
        controller: UserController_1.UserController,
        action: 'all'
    },
    {
        method: 'get',
        route: '/users/:id',
        controller: UserController_1.UserController,
        action: 'one'
    },
    {
        method: 'post',
        route: '/users',
        controller: UserController_1.UserController,
        action: 'save'
    },
    {
        method: 'delete',
        route: '/users/:id',
        controller: UserController_1.UserController,
        action: 'remove'
    },
    {
        method: 'get',
        route: '/operations',
        controller: OperationController_1.OperationController,
        action: 'all'
    },
    {
        method: 'get',
        route: '/operations/:id',
        controller: OperationController_1.OperationController,
        action: 'one'
    },
    {
        method: 'post',
        route: '/operations',
        controller: OperationController_1.OperationController,
        action: 'save'
    },
    {
        method: 'delete',
        route: '/operations/:id',
        controller: OperationController_1.OperationController,
        action: 'remove'
    },
    {
        method: 'post',
        route: '/operations/uploads',
        controller: OperationController_1.OperationController,
        action: 'upload'
    },
    {
        method: 'post',
        route: '/file',
        controller: FileController_1.FileController,
        action: 'upload'
    },
];
