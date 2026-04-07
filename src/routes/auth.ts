import express from 'express'
import { authController } from '../controllers/controllersInit'

const auth = express.Router()

auth.get('/:email', (req, res, next) => authController.auth(req, res, next))

export default auth
