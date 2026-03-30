import express from 'express'
import { dailyRecordController } from '../controllers/controllersInit'

const dailyRecord = express.Router()

dailyRecord.post('/', (req, res) => dailyRecordController.create(req, res))

dailyRecord.get('/', (req, res) => dailyRecordController.get(req, res))

dailyRecord.put('/', (req, res) => dailyRecordController.update(req, res))

dailyRecord.delete('/', (req, res) => dailyRecordController.delete(req, res))

export default dailyRecord
