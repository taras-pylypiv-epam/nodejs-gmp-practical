export interface ServiceResponse<TServiceData> {
    error: boolean;
    data?: TServiceData;
    code?: number;
    errorMsg?: string;
}

export interface ControllerResponse<TControllerBody> {
    body: { message: string } | TControllerBody;
    statusCode: number;
}

export type ServiceResponsePromise<TServiceData> = Promise<
    ServiceResponse<TServiceData>
>;

export type ControllerResponsePromise<TControllerBody> = Promise<
    ControllerResponse<TControllerBody>
>;
