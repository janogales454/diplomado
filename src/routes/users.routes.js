import { Router } from "express";
import usersController from "../controllers/users.controller.js";
import validate from '../validators/validate.js';
import { createUserSchema } from "../validators/user.validate.js";
import { authenticateToken } from "../middlewares/authenticate.js";

const userRoutes = Router();

userRoutes
.route('/')
.get(usersController.getUsers)
.post(validate(createUserSchema, 'body'),usersController.createUser);

userRoutes
.route('/:id')
.get(authenticateToken, usersController.getUser)
.put(authenticateToken, usersController.updateUser)
.delete(authenticateToken, usersController.deleteUser)
.patch(authenticateToken, usersController.activateInactivate);

userRoutes
.route('/:id/tasks')
.get(authenticateToken, usersController.getTasks);


userRoutes
.route('/list/pagination')
.get(usersController.getUserPagination);

export default userRoutes;
