import express from 'express'
import users from './users'
import projects from './projects';
import auth from './auth';
import dailyRecord from './dailyRecords';
import tasks from './tasks';
import dailyTasks from './dailyTasks';

export const route = express.Router()

route.use("/auth", auth)

route.use("/users", users );

route.use('/projects', projects);

route.use('/tasks', tasks)

route.use('/daily-records', dailyRecord)

route.use('/daily-tasks', dailyTasks)
