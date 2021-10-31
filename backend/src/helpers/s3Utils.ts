import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('s3')

export class s3Utils {
    constructor(
        private readonly bucketName: string,
        private readonly s3: AWS.S3 = getS3(bucketName),
        private readonly signedUrlExpireSeconds = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ) { }
    
    async generateGetSignedUrl(todoId: string): Promise<string> {
        try {
            await this.s3.headObject({
                Bucket: this.bucketName,
                Key: `${todoId}.jpeg`
            }).promise();

            logger.info(`Generating download signed URL for key: ${todoId}`)

            return this.s3.getSignedUrl('getObject', {
                Bucket: this.bucketName,
                Key: `${todoId}.jpeg`,
                Expires: this.signedUrlExpireSeconds
            }) as string;
        } catch (err) {
            logger.error(`Error generating download signed URL for key: ${todoId}`, JSON.stringify(err))
        }
    }

    generatePutSignedUrl(todoId: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: `${todoId}.jpeg`,
            Expires: this.signedUrlExpireSeconds
        }) as string;
    }

    async objectExists(todoId: string): Promise<boolean> {
        try {
            await this.s3.headObject({
                Bucket: this.bucketName,
                Key: `${todoId}.jpeg`
            }).promise();

            return true;
        } catch (err) {
            return false;
        }
    }

    async putObject(key: string, body): Promise<any> {
        return await this.s3.putObject({
            Bucket: this.bucketName,
            Key: key,
            Body: body
        }).promise()
    }

    async getObject(key: string): Promise<any> {
        return await this.s3.getObject({
            Bucket: this.bucketName,
            Key: key
        }).promise()
    }

    async deleteObject(todoId: string): Promise<any> {
        return await this.s3.deleteObject({
            Bucket:this.bucketName,
            Key: `${todoId}.jpeg`
        }).promise()
    }
}

function getS3(bucketName: string): AWS.S3 {
    return new XAWS.S3({
        signatureVersion: 'v4',
        region: process.env.region,
        params: { Bucket: bucketName }
    })
}