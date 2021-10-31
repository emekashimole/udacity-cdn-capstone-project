import { TodoItem } from "../models/TodoItem"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export default class TodosAccess {
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    async getUserTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        
        return result.Items as TodoItem[]
    }

    async createTodo(item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }

    async getTodoById(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()

        return result.Item as TodoItem
    }

    async updateTodoById(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :n, dueDate = :date, done = :done',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':date': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        }).promise()
    }

    async deleteTodoById(todoId: string, userId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
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