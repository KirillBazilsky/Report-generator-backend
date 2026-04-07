import express from 'express'
import { dailyRecordController } from '../controllers/controllersInit'

const dailyRecord = express.Router()

dailyRecord.post('/', (req, res, next) => dailyRecordController.create(req, res, next))

dailyRecord.get('/', (req, res, next) => dailyRecordController.get(req, res, next))

dailyRecord.put('/', (req, res, next) => dailyRecordController.update(req, res, next))

dailyRecord.delete('/', (req, res, next) => dailyRecordController.delete(req, res, next))

export default dailyRecord
