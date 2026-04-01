import { TPaginationProps } from "./types/common";

export const DEFAULT_PAGINATION = {take: 10, skip: 0}

export const MODEL_FIELD_TYPES: Record<string, Record<string, string>> = {
  User: {
    id: 'number',
    email: 'string',
    nickname: 'string',
  },
  Project: {
    name: 'string',
    id: 'number',
    userId: 'number',
  },
  Task: {
    name: 'string',
    id: 'number',
    userId: 'number',
    description: 'string',
    status: 'string',
    startDate: 'date',
    endDate: 'date',
    projectId: 'number',
  },
  DailyRecord: {
    id: 'number',
    userId: 'number',
    date: 'date',
  },
  DailyTask: {
    id: 'number',
    status: 'string',
    dailyRecordId: 'number',
    taskId: 'number',
    comment: 'string',
  },
}