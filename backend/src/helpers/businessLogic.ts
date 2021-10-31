import 'source-map-support/register'

import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

import { ConnectionItem } from '../models/ConnectionItem';

import TodoDBAccess from './todosAccess'
import ConnectionsDBAccess from './connectionsAccess'

const uuid = require('uuid/v4')
const todosAccess = new TodoDBAccess()
const connectionsAccess = new ConnectionsDBAccess()

export async function getUserTodos(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getUserTodos(userId)
}

export async function createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid()
    const createdAt = new Date().toISOString()

    const item = {
        userId,
        todoId,
        createdAt,
        done: false,
        ...request
    } as TodoItem

    return await todosAccess.createTodo(item)
}

export async function getTodoById(todoId: string, userId: string): Promise<TodoItem> {
    return await todosAccess.getTodoById(todoId, userId)
}

export async function updateTodoById(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {
    await todosAccess.updateTodoById(updatedTodo, todoId, userId)
}

export async function deleteTodoById(todoId: string, userId: string) {
    await todosAccess.deleteTodoById(todoId, userId)
}

export async function getConnections(): Promise<ConnectionItem[]> {
    return await connectionsAccess.getConnections()
}

export async function addConnection(connectionId: string): Promise<ConnectionItem> {
    const timestamp = new Date().toISOString()

    const item = {
        id: connectionId,
        timestamp
    } as ConnectionItem

    return await connectionsAccess.addConnection(item)
}

export async function getConnectionById(connectionId: string): Promise<ConnectionItem> {
    return await connectionsAccess.getConnectionById(connectionId)
}

export async function deleteConnectionById(connectionId: string) {
    await connectionsAccess.deleteConnectionById(connectionId)
}