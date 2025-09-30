import { DynamoDBClient, ReturnValue } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
    ScanCommandInput,
    ScanCommandOutput,
    GetCommandOutput,
    PutCommandInput,
    PutCommandOutput,
    UpdateCommandInput,
    UpdateCommandOutput,
    DeleteCommandOutput,
} from '@aws-sdk/lib-dynamodb';

import type { IDynamoStore } from '../types/dynamo';

export class DynamoStore implements IDynamoStore {
    private readonly _dynamoClient: DynamoDBDocumentClient;

    constructor() {
        this._dynamoClient = DynamoDBDocumentClient.from(
            new DynamoDBClient({})
        );
    }

    async getAll(tableName: string): Promise<ScanCommandOutput> {
        try {
            const command = new ScanCommand({
                TableName: tableName,
            });
            const result = await this._dynamoClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getItemsWithFilter(
        tableName: string,
        filter: ScanCommandInput['FilterExpression'],
        filterValues: ScanCommandInput['ExpressionAttributeValues'],
        projection: ScanCommandInput['ProjectionExpression']
    ): Promise<ScanCommandOutput> {
        try {
            const params: ScanCommandInput = {
                TableName: tableName,
                FilterExpression: filter,
                ExpressionAttributeValues: filterValues,
            };

            if (projection) {
                params.ProjectionExpression = projection;
            }

            const command = new ScanCommand(params);
            const result = await this._dynamoClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getItem(
        tableName: string,
        pkName: string,
        pk: string
    ): Promise<GetCommandOutput> {
        try {
            const command = new GetCommand({
                TableName: tableName,
                Key: {
                    [pkName]: pk,
                },
            });
            const result = await this._dynamoClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async createItem(
        tableName: string,
        item: PutCommandInput['Item']
    ): Promise<PutCommandOutput> {
        try {
            const command = new PutCommand({
                TableName: tableName,
                Item: item,
            });
            const result = await this._dynamoClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async updateItem(
        tableName: string,
        pkName: string,
        pk: string,
        updateExpression: UpdateCommandInput['UpdateExpression'],
        updateValues: UpdateCommandInput['ExpressionAttributeValues']
    ): Promise<UpdateCommandOutput> {
        try {
            const command = new UpdateCommand({
                TableName: tableName,
                Key: {
                    [pkName]: pk,
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: updateValues,
                ReturnValues: ReturnValue.ALL_NEW,
            });
            const result = await this._dynamoClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async deleteItem(
        tableName: string,
        pkName: string,
        pk: string
    ): Promise<DeleteCommandOutput> {
        try {
            const command = new DeleteCommand({
                TableName: tableName,
                Key: {
                    [pkName]: pk,
                },
            });
            const result = await this._dynamoClient.send(command);

            return result;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}
