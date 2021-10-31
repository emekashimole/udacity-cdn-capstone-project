import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById, updateTodoById } from '../../helpers/businessLogic'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    
    if (!todoId) {
      logger.error('Invalid request, no Todo id provided')
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid parameters'
        })
      }
    }

    const userId = getUserId(event)

    const item = await getTodoById(todoId, userId)
    if (!item) {
      logger.error(`Todo item with id: ${todoId} not found`)
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `Todo item with id: ${todoId} not found`
        })
      }
    }

    if (item.userId !== userId) {
      logger.error(`Todo item with id: ${todoId} cannot be updated. User does not own todo item`)
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: `This action is not permitted.`
        })
      }
    }

    await updateTodoById(updatedTodo, todoId, userId)
    logger.info(`User ${userId} updated todo item with id: ${todoId} successfully`)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Item has been updated'
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
