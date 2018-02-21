const Koa = require('koa')
const cors = require('koa-cors')
const send = require('koa-send')
const logger = require('koa-logger')
const route = require('koa-route')
const body = require('koa-body')
// const debug = require('debug')('bridge')
const debugHTTP = require('debug')('bridge:http')

const process = require('./server/process')

const main = async () => {
  const app = new Koa()

  app.on('error', function (err) {
    console.log(err)
  })

  app.use(cors())
  app.use(logger())
  app.use(body())
  app.use(async (ctx, next) => {
    ctx.id = Math.floor(Math.random() * Math.floor(1000000))
    debugHTTP('path: %s', ctx.path)
    debugHTTP('query: %O', ctx.query)
    debugHTTP('body: %O', ctx.request.body)
    debugHTTP('body: %O', ctx.request.body.changelog)
    await next()
  })

  app.use(route.head('/', async(ctx) => {
    console.log('test')
    ctx.status = 200
    ctx.body = {
      msg: 'ok'
    }
  }))

  app.use(route.post('/', async(ctx) => {
    console.log(ctx.request.body)
    ctx.status = 200
    ctx.body = {
      msg: 'ok'
    }
  }))

  app.use(route.get('/callback', async(ctx) => {
    // oauth()
  }))

  app.use(route.get('/manifest.json', async(ctx) => {
    await send(ctx, 'public/manifest.json')
  }))

  app.use(route.get('/public/:folder/:file', async(ctx) => {
    await send(ctx, ctx.path)
  }))

  app.use(route.get('/launchCard', async(ctx) => {
    process.setupBoard(ctx.query.boardId, ctx.query.boardName)
  }))

  app.use(route.post('/loadIssue', async(ctx) => {
    process.loadIssue(JSON.parse(ctx.request.body))
  }))

  app.use(route.post('/saveIssue', async(ctx) => {
    process.saveIssue(ctx.query)
  }))

  app.use(route.put('/updateIssue', async(ctx) => {
    process.updateIssue(ctx.request.body)
  }))

  app.listen(3000)
  return 'web server started on port 3000'
}

main().then(
  (res) => console.log(res),
  (err) => {
    console.error(err)
    process.exit(1)
  })
