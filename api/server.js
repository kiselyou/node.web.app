import multer from 'multer'
import express from 'express'
import expressSession from 'express-session'
import redisStore from 'connect-redis'
import { defaultHeaders, initHeadersValue } from './middleware/headers'
import * as core from './core/index'
import bodyParser from 'body-parser'
import routes from './routes/index'
import { eachRout } from './lib/init-routes'

const app = express()
let RedisStore = redisStore(expressSession)
let session = expressSession({
  store: new RedisStore({}),
  secret: '8ae49100-ec0c-4a2f-9e4c-e7b39dae61c5',
  resave: false,
  saveUninitialized: false
});

app.use(session);
app.use(defaultHeaders)
app.use(initHeadersValue)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 50000, extended: true }))
app.use(express.static(core.config.buildPath))
app.use(express.static('web'))

eachRout(routes, (route) => {
  const method = route.method.toLowerCase()
  switch (method) {
    case 'get':
      app.get(route.path, (req, res) => {
        route.action(Object.assign({ req, res }, core))
      })
      break
    case 'post':
      app.post(route.path, multer().array(), (req, res) => {
        route.action(Object.assign({ req, res }, core))
      })
      break;
    case 'put':
      app.put(route.path, multer().array(), (req, res) => {
        route.action(Object.assign({ req, res }, core))
      })
      break;
    case 'delete':
      app.delete(route.path, multer().array(), (req, res) => {
        route.action(Object.assign({ req, res }, core))
      })
      break;
    default:
      app[method](route.path, (req, res) => {
        route.action(Object.assign({ req, res }, core))
      })
  }
})

app.listen(core.config.server.port, core.config.server.host, () => {
  console.log(`Server http://${core.config.server.host}:${core.config.server.port}`)
})