export interface ServiceResult<TServiceData> {
    error: boolean;
    data?: TServiceData;
    code?: number;
    errorMsg?: string;
}

export interface ControllerResult<TControllerBody> {
    body: { message: string } | TControllerBody;
    statusCode: number;
}

export type ServiceResultPromise<TServiceData> = Promise<
    ServiceResult<TServiceData>
>;

export type ControllerResultPromise<TControllerBody> = Promise<
    ControllerResult<TControllerBody>
>;
