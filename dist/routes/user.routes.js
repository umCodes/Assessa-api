"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const userRouter = (0, express_1.Router)();
userRouter.get('/user', user_controllers_1.getUser);
userRouter.put('/user/name', user_controllers_1.updateUserName);
userRouter.post('/api/feedback', user_controllers_1.sendFeedback);
exports.default = userRouter;
//# sourceMappingURL=user.routes.js.map