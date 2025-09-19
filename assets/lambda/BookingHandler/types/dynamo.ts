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

export interface IDynamoStore {
    getAll(tableName: string): Promise<ScanCommandOutput>;
    getItemsWithFilter(
        tableName: string,
        filter: ScanCommandInput['FilterExpression'],
        filterValues: ScanCommandInput['ExpressionAttributeValues'],
        projection?: ScanCommandInput['ProjectionExpression']
    ): Promise<ScanCommandOutput>;
    getItem(
        tableName: string,
        pkName: string,
        pk: string
    ): Promise<GetCommandOutput>;
    createItem(
        tableName: string,
        item: PutCommandInput['Item']
    ): Promise<PutCommandOutput>;
    updateItem(
        tableName: string,
        pkName: string,
        pk: string,
        updateExpression: UpdateCommandInput['UpdateExpression'],
        updateValues: UpdateCommandInput['ExpressionAttributeValues']
    ): Promise<UpdateCommandOutput>;
    deleteItem(
        tableName: string,
        pkName: string,
        pk: string
    ): Promise<DeleteCommandOutput>;
}
