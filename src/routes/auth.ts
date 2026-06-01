import express from 'express'
import { authController } from '../controllers/controllersInit'
import { checkAuth } from '../middlewares/authChecker'

const auth = express.Router()

auth.post('/logout', (req, res, next) => authController.logout(req, res, next))
auth.post('/refresh', (req, res, next) => authController.refreshTokens(req, res, next))
auth.get('/logged', checkAuth, (req, res, next) => authController.getLoggedUser(req, res, next))
auth.get('/:email', (req, res, next) => authController.auth(req, res, next))

export default auth
