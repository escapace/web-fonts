import { createApp } from './create-app'

void createApp().then(async (app) =>
  app
    .listen(process.env.PORT ?? 3000)
    .then((address) => app.log.info(`server listening on ${address}`))
)
