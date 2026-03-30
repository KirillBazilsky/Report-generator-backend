import {
    dailyRecordService,
    dailyTaskService,
    projectService,
    taskService,
    userService,
} from '../services/servicesInit'
import { AuthController } from './auth'
import { DailyRecordController } from './dailyRecord'
import { DailyTasksController } from './dailyTask'
import { ProjectController } from './projects'
import { TaskController } from './tasks'
import { UserController } from './user'

export const authController = new AuthController(userService)
export const userController = new UserController(userService)
export const projectController = new ProjectController(projectService)
export const taskController = new TaskController(taskService)
export const dailyRecordController = new DailyRecordController(dailyRecordService)
export const dailyTaskController = new DailyTasksController(dailyTaskService)
