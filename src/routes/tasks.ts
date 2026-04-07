import express from 'express'
import { taskController } from '../controllers/controllersInit'

const tasks = express.Router()

tasks.post('/', (req, res, next) => taskController.create(req, res, next))

tasks.get('/', (req, res, next) => taskController.get(req, res, next))

tasks.put('/', (req, res, next) => taskController.update(req, res, next))

tasks.delete('/', (req, res, next) => taskController.delete(req, res, next))

export default tasks
