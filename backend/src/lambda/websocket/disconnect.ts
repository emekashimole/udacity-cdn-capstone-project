import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getConnectionById, deleteConnectionById } from '../../helpers/businessLogic'

const logger = createLogger('connections')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Websocket disconnect: ' + JSON.stringify(event))

        const connectionId = event.requestContext.connectionId
        const connection = await getConnectionById(connectionId)
        if (!connection) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    error: `Not found`
                })
            }
        }

        deleteConnectionById(connectionId)

        logger.info(`Removed connection: ${connectionId}`)

        return {
            statusCode: 200,
            body: ''
        }
    }
)

handler.use(
    cors({
      credentials: true
    })
)