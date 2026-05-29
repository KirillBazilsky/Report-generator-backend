import express from 'express'
import { userController } from '../controllers/controllersInit'
import { checkAuth } from '../middlewares/authChecker'

const users = express.Router()

users.post('/', (req, res, next) => userController.create(req, res, next))

users.use(checkAuth);

users.get('/', (req, res, next) => userController.get(req, res, next))

users.put('/', (req, res, next) => userController.update(req, res, next))

users.delete('/', (req, res, next) => userController.delete(req, res, next))

export default users
