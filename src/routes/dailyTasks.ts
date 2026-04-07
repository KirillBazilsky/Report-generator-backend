import express from 'express'
import { dailyTaskController } from '../controllers/controllersInit'

const dailyTasks = express.Router()

dailyTasks.post('/', (req, res, next) => dailyTaskController.create(req, res, next))

dailyTasks.get('/', (req, res, next) => dailyTaskController.get(req, res, next))

dailyTasks.put('/', (req, res, next) => dailyTaskController.update(req, res, next))

dailyTasks.delete('/', (req, res, next) => dailyTaskController.delete(req, res, next))

export default dailyTasks
