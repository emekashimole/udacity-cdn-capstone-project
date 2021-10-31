import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById } from '../../helpers/businessLogic'
import { getUserId } from '../utils'
import { s3Utils } from '../../helpers/s3Utils'
import { createLogger } from '../../utils/logger'

const attachmentBucketS3 = new s3Utils(process.env.ATTACHMENT_S3_BUCKET)
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
      logger.error(`Url for todo item with id: ${todoId} cannot be generated. User does not own todo item`)
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: `This action is not permitted.`
        })
      }
    }

    const uploadUrl = attachmentBucketS3.generatePutSignedUrl(todoId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
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
