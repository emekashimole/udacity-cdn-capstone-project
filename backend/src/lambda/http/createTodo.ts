import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../helpers/businessLogic'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const todo = await createTodo(newTodo, userId)

    logger.info(`Created todo item for User: ${userId} with data: ${newTodo}`)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todo
      })
    }
})

handler
  .use(httpErrorHandler())
  .use(
  cors({
    credentials: true
  })
)
