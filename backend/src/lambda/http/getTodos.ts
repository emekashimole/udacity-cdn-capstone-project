import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserTodos } from '../../helpers/businessLogic'
import { s3Utils } from '../../helpers/s3Utils'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const thumbnailBucketS3 = new s3Utils(process.env.THUMBNAILS_S3_BUCKET)
const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todos = await getUserTodos(userId)
    logger.info(`Fetched Todo items for user: ${userId}`)

    for (const todo of todos) {
      todo.attachmentUrl = await thumbnailBucketS3.generateGetSignedUrl(todo.todoId)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
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
