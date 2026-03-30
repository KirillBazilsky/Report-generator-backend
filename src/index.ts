import express from 'express'
import cors from 'cors'
import { route } from './routes/route'
import { specs } from './swagger'
import swaggerUi from 'swagger-ui-express'

const app = express()

async function startBackend() {
  try {
    app.use(express.json())

    app.use(
      cors({
        origin: process.env.CLIENT_ORIGIN,
      })
    )

    app.use(route)

    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs))

    app.listen(3000, () => {
      console.log(`Backend listening on port ${process.env.BACKEND_PORT}`)
    })
  } catch (error) {
    console.warn(error)
    process.exit(1)
  }
}

startBackend()

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})
