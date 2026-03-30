import express from 'express'
import { projectController } from '../controllers/controllersInit'

const projects = express.Router()

projects.post('/', (req, res) => projectController.create(req, res))

projects.get('/', (req, res) => projectController.get(req, res))

projects.delete('/', (req, res) => projectController.delete(req, res))

export default projects
