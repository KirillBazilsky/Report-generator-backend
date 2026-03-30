import express from 'express'
import { taskController } from '../controllers/controllersInit'

const tasks = express.Router()

tasks.post('/', (req, res) => taskController.create(req, res))

tasks.get('/', (req, res) => taskController.get(req, res))

tasks.put('/', (req, res) => taskController.update(req, res))

tasks.delete('/', (req, res) => taskController.delete(req, res))

export default tasks
