import { DailyRecordService } from './dailyRecordService'
import { DailyTaskService } from './dailyTaskService'
import { ProjectService } from './projectService'
import { TaskService } from './taskService'
import { UserService } from './userService'

export const userService = new UserService()
export const projectService = new ProjectService()
export const taskService = new TaskService()
export const dailyRecordService = new DailyRecordService()
export const dailyTaskService = new DailyTaskService()
