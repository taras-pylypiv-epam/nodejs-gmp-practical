import type {
    ScanCommandInput,
    ScanCommandOutput,
    GetCommandOutput,
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
}
