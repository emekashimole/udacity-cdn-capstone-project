import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById, deleteTodoById } from '../../helpers/businessLogic'
import { s3Utils } from '../../helpers/s3Utils'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const attachmentBucketS3 = new s3Utils(process.env.ATTACHMENT_S3_BUCKET)
const thumbnailsBucketS3 = new s3Utils(process.env.THUMBNAILS_S3_BUCKET)
const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
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
      logger.error(`Todo item with id: ${todoId} cannot be deleted. User does not own todo item`)
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: `This action is not permitted.`
        })
      }
    }

    await deleteTodoById(todoId, userId)
    const objectExists = await attachmentBucketS3.objectExists(todoId)
    if (objectExists) {
      logger.info(`Deleting images for todo item: ${todoId}`)
      attachmentBucketS3.deleteObject(todoId)
      thumbnailsBucketS3.deleteObject(todoId)
    }

    logger.info(`User ${userId} deleted todo item with id: ${todoId} successfully`)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Item has been deleted'
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
