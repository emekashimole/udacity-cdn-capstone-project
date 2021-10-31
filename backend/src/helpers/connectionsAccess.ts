import { ConnectionItem } from "../models/ConnectionItem"

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export default class ConnectionsAccess {
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = createDynamoDBClient(),
        private readonly connectionsTable = process.env.CONNECTIONS_TABLE
    ) { }

    async getConnections(): Promise<ConnectionItem[]> {
        const result = await this.docClient.scan({
            TableName: this.connectionsTable
        }).promise()
        
        return result.Items as ConnectionItem[]
    }

    async addConnection(item: ConnectionItem): Promise<ConnectionItem> {
        await this.docClient.put({
            TableName: this.connectionsTable,
            Item: item
        }).promise()

        return item
    }

    async getConnectionById(connectionId: string): Promise<ConnectionItem> {
        const result = await this.docClient.get({
            TableName: this.connectionsTable,
            Key: {
                id: connectionId
            }
        }).promise()

        return result.Item as ConnectionItem
    }

    async deleteConnectionById(connectionId: string) {
        await this.docClient.delete({
            TableName: this.connectionsTable,
            Key: {
                id: connectionId
            }
        }).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }

    return new XAWS.DynamoDB.DocumentClient()
}