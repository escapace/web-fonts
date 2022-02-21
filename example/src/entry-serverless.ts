import awsLambdaFastify from 'aws-lambda-fastify'
import { createApp } from './create-app'

const app = createApp()

const handler = awsLambdaFastify(app)

export { handler }
