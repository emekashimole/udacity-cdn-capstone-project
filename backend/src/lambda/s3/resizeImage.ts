import 'source-map-support/register'

import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { s3Utils } from '../../helpers/s3Utils'
import Jimp from 'jimp/es'

const logger = createLogger('s3')
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET
const attachmentBucketS3 = new s3Utils(process.env.ATTACHMENT_S3_BUCKET)
const thumbnailsBucketS3 = new s3Utils(thumbnailBucketName)

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info('Processing SNS event: ' + JSON.stringify(event))

  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    logger.info(`Processing S3 event: ${s3EventStr}`)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

async function processImage(record: S3EventRecord) {
  const key = record.s3.object.key
  logger.info(`Processing S3 item with key: ${key}`)

  const response = await attachmentBucketS3.getObject(key)

  const body = response.Body
  const image = await Jimp.read(body)

  logger.info('Resizing image')
  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

  logger.info(`Writing resized image to S3 bucket: ${thumbnailBucketName}`)
  await thumbnailsBucketS3.putObject(key, convertedBuffer)
}
