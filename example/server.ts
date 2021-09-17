import fastify from 'fastify'

const app = fastify({ logger: true })

app.get('/', (_, reply) => {
  void reply.send({ hello: 'world' })
})

void app
  .listen(3000)
  .then((address) => app.log.info(`server listening on ${address}`))
