/**
 * @swagger
 * components:
 *   schemas:
 *     # Enum definitions
 *     TaskStatus:
 *       type: string
 *       enum: [IN_PROGRESS, IN_REVIEW, BLOCKED, CLOSED, DONE]
 *       description: |
 *         Status of the task:
 *         - `IN_PROGRESS`: Task is being worked on
 *         - `IN_REVIEW`: Task is under review
 *         - `BLOCKED`: Task is blocked by something
 *         - `CLOSED`: Task is closed
 *         - `DONE`: Task is completed
 *       example: IN_PROGRESS
 *
 *     IdObject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Entity ID
 *           example: 42
 *       required:
 *         - id
 * 
 *     IdsArray:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/IdObject'
 *       description: List of entity IDs as objects
 *       example:
 *         - id: 42
 *         - id: 43
 *         - id: 44
 *
 *     # User base model
 *     UserBase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         nickname:
 *           type: string
 *           description: User's nickname
 *           example: johndoe123
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IdsArray'
 *           description: List of user's projects IDs
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IdsArray'
 *           description: List of user's tasks IDs
 *         dailyRecords:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IdsArray'
 *           description: User's daily records IDs
 *       required:
 *         - id
 *         - email
 *         - nickname
 *
 * # User full model
 *     UserFull:
 *       allOff: '#/components/schemas/UserBase'
 *       type: object
 *       properties:
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectBase'
 *           description: List of user's projects
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskBase'
 *           description: List of user's tasks
 *         dailyRecords:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DailyRecordBase'
 *           description: User's daily records
 *
 *     #Project base model
 *     ProjectBase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Project ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Project name
 *           example: E-commerce Platform
 *         userId:
 *           type: integer
 *           description: ID of the project owner
 *           example: 5
 *         user:
 *           $ref: '#/components/schemas/UserBase'
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IdsArray'
 *           description: List of tasks in this project ids
 *         dailyRecords:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IdsArray'
 *           description: Daily records ids associated with this project
 *       required:
 *         - id
 *         - name
 *         - userId
 *
 *
 *     # Project full model
 *     ProjectFull:
 *       allOff: '#/components/schemas/UserBase'
 *       type: object
 *       properties:
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskBase'
 *           description: List of tasks in this project
 *         dailyRecords:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DailyRecordBase'
 *           description: Daily records associated with this project
 *       required:
 *         - id
 *         - name
 *         - userId
 * 
 *     # Task base model
 *     TaskBase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Task ID
 *           example: 42
 *         name:
 *           type: string
 *           description: Task name/title
 *           example: Implement authentication
 *         description:
 *           type: string
 *           description: Detailed task description
 *           example: Add JWT-based authentication to the API
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Task start date
 *           example: 2024-03-20T10:00:00Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Task end date
 *           example: 2024-03-25T18:00:00Z
 *         projectId:
 *           type: integer
 *           description: ID of the project this task belongs to
 *           example: 1
 *         project:
 *           $ref: '#/components/schemas/ProjectBase'
 *         userId:
 *           type: integer
 *           description: ID of the user assigned to this task
 *           example: 5
 *         user:
 *            $ref: '#/components/schemas/UserBase'
 *         dailyTasks:
 *            $ref: '#/components/schemas/IdsArray'
 *            description: List of daily tasks of this task
 *       required:
 *         - id
 *         - name
 *         - status
 *         - projectId
 *         - userId
 *
 *     # Task full model
 *     TaskFull:
 *       allOff: '#/components/schemas/TaskBase'
 *       type: object
 *       properties:
 *         dailyTasks:
 *             $ref: '#/components/schemas/DailyTaskBase'
 *      
 *     # DailyRecord base model
 *     DailyRecordBase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Daily record ID
 *           example: 10
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the record
 *           example: 2024-03-23T00:00:00Z
 *         userId:
 *           type: integer
 *           description: ID of the user this record belongs to
 *           example: 5
 *         user:
 *           $ref: '#/components/schemas/UserBase'
 *         dailyTasks:
 *           $ref: '#/components/schemas/IdsArray'
 *           description: Tasks ids logged for this day
 *         projects:
 *           $ref: '#/components/schemas/IdsArray'
 *           description: Projects ids worked on this day
 *       required:
 *         - id
 *         - date
 *         - userId
 * 
 *     # DailyRecord full model
 *     DailyRecordFull:
 *       allOf: 
 *         - $ref: '#/components/schemas/DailyRecordBase'
 *         - type: object
 *           properties:
 *             dailyTasks:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DailyTaskBase'
 *               description: Tasks logged for this day
 *             projects:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectBase'
 *               description: Projects worked on this day
 *           required:
 *             - id
 *             - date
 *             - userId
 * 
 *     # DailyTask base model
 *     DailyTaskBase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Daily task entry ID
 *           example: 100
 *         dailyRecordId:
 *           type: integer
 *           description: ID of the parent daily record
 *           example: 10
 *         dailyRecord:
 *           $ref: '#/components/schemas/DailyRecordBase'
 *         taskId:
 *           type: integer
 *           description: ID of the task
 *           example: 42
 *         task:
 *           $ref: '#/components/schemas/TaskBase'
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         comment:
 *           type: string
 *           description: Additional comments about the task progress
 *           example: Implemented login and registration endpoints
 *       required:
 *         - id
 *         - dailyRecordId
 *         - taskId
 *         - status
 *
 *     # Request/Response helpers
 *     CreateUserRequest:
 *       type: object
 *       properties:
 *         id:
 *             type: integer
 *             example: 42
 *         payload: 
 *             type: object
 *             properties: 
 *                email:
 *                  type: string
 *                  format: email
 *                  example: newuser@example.com
 *             nickname:
 *                  type: string
 *                  example: newuser123
 *       required:
 *         - id
 *         - email
 *         - nickname
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: updated@example.com
 *         nickname:
 *           type: string
 *           example: updatednickname
 *
 *     CreateProjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: New Project
 *         userId:
 *           type: integer
 *           example: 5
 *       required:
 *         - name
 *         - userId
 *
 *     CreateTaskRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Implement feature X
 *         description:
 *           type: string
 *           example: Detailed description of the task
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         projectId:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           example: 5
 *       required:
 *         - name
 *         - projectId
 *         - userId
 *
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         projectId:
 *           type: integer
 *         userId:
 *           type: integer
 *
 *     CreateDailyRecordRequest:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2024-03-23T00:00:00Z
 *         userId:
 *           type: integer
 *           example: 5
 *         projectIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs of projects worked on
 *       required:
 *         - date
 *         - userId
 *
 *     CreateDailyTaskRequest:
 *       type: object
 *       properties:
 *         dailyRecordId:
 *           type: integer
 *         taskId:
 *           type: integer
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         comment:
 *           type: string
 *       required:
 *         - dailyRecordId
 *         - taskId
 *         - status
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: string
 *           description: Additional error details (optional)
 *       example:
 *         error: "User not found"
 *         details: "User with ID 999 does not exist"
 */
