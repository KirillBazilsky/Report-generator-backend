import express from 'express'
import { userController } from '../controllers/controllersInit'

const users = express.Router()

users.get('/', (req, res) => userController.get(req, res))

users.post('/', (req, res) => userController.create(req, res))

users.put('/', (req, res) => userController.update(req, res))

users.delete('/', (req, res) => userController.delete(req, res))

export default users
