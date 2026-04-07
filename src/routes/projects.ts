import express from 'express'
import { projectController } from '../controllers/controllersInit'

const projects = express.Router()

projects.post('/', (req, res, next) => projectController.create(req, res, next))

projects.get('/', (req, res, next) => projectController.get(req, res, next))

projects.delete('/', (req, res, next) => projectController.delete(req, res, next))

export default projects
