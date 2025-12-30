"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = require("../controllers/auth.controllers");
const authRouter = (0, express_1.Router)();
authRouter.post('/signup', auth_controllers_1.signUp);
authRouter.post('/login', auth_controllers_1.login);
authRouter.delete('/logout', auth_controllers_1.logout);
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map