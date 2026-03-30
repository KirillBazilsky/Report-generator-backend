import express from 'express'
import { dailyTaskController } from '../controllers/controllersInit'

const dailyTasks = express.Router()

dailyTasks.post('/', (req, res) => dailyTaskController.create(req, res))

dailyTasks.get('/', (req, res) => dailyTaskController.get(req, res))

dailyTasks.put('/', (req, res) => dailyTaskController.update(req, res))

dailyTasks.delete('/', (req, res) => dailyTaskController.delete(req, res))

export default dailyTasks
