import express from 'express'
import { userController } from '../controllers/controllersInit'

const users = express.Router()

users.get('/', (req, res, next) => userController.get(req, res, next))

users.post('/', (req, res, next) => userController.create(req, res, next))

users.put('/', (req, res, next) => userController.update(req, res, next))

users.delete('/', (req, res, next) => userController.delete(req, res, next))

export default users
