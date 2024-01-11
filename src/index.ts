import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import mongoose from 'mongoose'
import router from './routes'

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

dotenv.config({ debug: true })

const PORT = 8000

app.use('/insights',router)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world')
})

app.get('*', (req: Request, res: Response) => {
  res.status(403).send('Sorry, the page you requested was not found.')
})

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})

mongoose
  .connect(process.env.MONGO_URI ?? '', {
    dbName: 'emotorad',
  })
  .then(() => {
    console.log('connected Succesfully!!')
  })
  .catch((err) => {
    console.log('Error in connecting', err)
  })

process.on('uncaughtException', (err: any) => {
  console.error(err)
  process.exit(1)
})

process.on('unhandledRejection', (err: any) => {
  console.error(err)
  process.exit(1)
})

export default server