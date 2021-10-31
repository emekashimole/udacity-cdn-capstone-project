import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { addConnection } from '../../helpers/businessLogic'

const logger = createLogger('connections')

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        logger.info('Websocket connect: ' + JSON.stringify(event))

        const connectionId = event.requestContext.connectionId
        const connection = await addConnection(connectionId)

        logger.info('Added connection: ' + JSON.stringify(connection))

        return {
            statusCode: 200,
            body: JSON.stringify({
                item: connection
            })
        }
    }
)

handler.use(
    cors({
      credentials: true
    })
)