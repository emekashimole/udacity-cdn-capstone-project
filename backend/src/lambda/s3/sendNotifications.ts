import 'source-map-support/register'

import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
import { getConnections, deleteConnectionById } from '../../helpers/businessLogic'
import { createLogger } from '../../utils/logger'
import * as AWS  from 'aws-sdk'

const logger = createLogger('notifications')
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info('Processing SNS event: ' + JSON.stringify(event))

  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    logger.info(`Processing S3 event: ${s3EventStr}`)
    const s3Event = JSON.parse(s3EventStr)

    await processS3Event(s3Event)
  }
}

async function processS3Event(s3Event: S3Event) {
  for (const record of s3Event.Records) {
    const key = record.s3.object.key
    logger.info(`Processing S3 item with key: ${key}`)

    const connections = await getConnections()
    const payload = {
        msg: `Notification: New image ${key} has been uploaded to the s3 attachment bucket.`
    }

    for (const connection of connections) {
        const connectionId = connection.id
        await sendMessageToClient(connectionId, payload)
    }
  }
}

async function sendMessageToClient(connectionId: string, payload) {
  try {
    logger.info(`Sending message to connection: ${connectionId}`)

    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload),
    }).promise()

  } catch (e) {
    logger.error('Failed to send message: ' + JSON.stringify(e))

    if (e.statusCode === 410) {
      logger.info(`Deleting stale connection: ${connectionId}`)
      await deleteConnectionById(connectionId)
    }
  }
}