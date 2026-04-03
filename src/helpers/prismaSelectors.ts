export const idSelector = {
  select: {
    id: true,
  },
}

export const nameSelector = {
  select: {
    id: true,
    name: true,
  },
}

export const nickNameSelector = {
  select: {
    id: true,
    nickname: true,
  },
}

export const baseUserSelector = {
  id: true,
  email: true,
  nickname: true,
  dailyRecords: idSelector,
  projects: idSelector,
  tasks: idSelector,
}

export const baseProjectSelector = {
  id: true,
  name: true,
  userId: true,
  dailyRecords: idSelector,
  tasks: idSelector,
  user: nickNameSelector,
}

export const baseTaskSelector = {
  id: true,
  name: true,
  status: true,
  startDate: true,
  endDate: true,
  description: true,
  project: nameSelector,
  projectId: true,
  user: nickNameSelector,
  userId: true,
  dailyTasks: idSelector,
}

export const baseDailyRecordSelector = {
  id: true,
  date: true,
  userId: true,
  dailyTasks: idSelector,
  user: { select: baseUserSelector },
  projects: idSelector,
}

export const baseDailyTaskSelector = {
  id: true,
  comment: true,
  dailyRecordId: true,
  status: true,
  taskId: true,
  dailyRecord: { select: baseDailyRecordSelector },
  task: { select: baseTaskSelector },
}

export const fullUserSelector = {
  ...baseUserSelector,
  dailyRecords: { select: baseDailyRecordSelector },
  projects: { select: baseProjectSelector },
  tasks: { select: baseTaskSelector },
}

export const fullProjectSelector = {
  ...baseProjectSelector,
  dailyRecords: { select: baseDailyRecordSelector },
  tasks: { select: baseTaskSelector },
  user: { select: baseUserSelector },
}

export const fullTaskSelector = {
  ...baseTaskSelector,
  user: { select: baseUserSelector },
  dailyTasks: { select: baseDailyTaskSelector },
  project: { select: baseProjectSelector },
}

export const fullDailyRecordSelector = {
  ...baseDailyRecordSelector,
  dailyTasks: { select: baseDailyTaskSelector },
  projects: { select: baseProjectSelector },
}
