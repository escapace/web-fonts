import { Handler } from '@netlify/functions'
import awsLambdaFastify from 'aws-lambda-fastify'
import { createApp } from './create-app'

const app = createApp()

const handler: Handler = awsLambdaFastify(app)
// async (event, context) => {
//   awsLambdaFastify(app)
//   app.server.emit('request', req, res)

//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: 'Hello World' })
//   }
// }

export { handler }
