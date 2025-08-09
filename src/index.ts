import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { Hono } from 'hono'
import authRouter from './controller/auth.controller.js'
import 'dotenv/config'
import fileRouter from './controller/file.controller.js'
const app = new Hono()

app.use(
  cors({
    origin: ['http://localhost:5173']
  })
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRouter)
app.route('/file', fileRouter)
serve(
  {
    fetch: app.fetch,
    port: 3000
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
