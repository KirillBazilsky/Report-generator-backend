import express from 'express'
import { authController } from '../controllers/controllersInit'

const auth = express.Router()

auth.get('/:email', (req, res) => authController.auth(req, res))

export default auth
