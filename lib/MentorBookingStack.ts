import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'node:path';

const ASSETS_PATH = '/../assets';

function buildLambdaPath(lambdaName: string) {
    return path.join(
        __dirname,
        `${ASSETS_PATH}/lambda/${lambdaName}/dist/index.zip`
    );
}

export class MentorBookingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const studentPool = new cognito.UserPool(this, 'StudentPool', {
            userPoolName: 'StudentPool',
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
        });
        new cognito.UserPoolClient(this, 'StudentPoolClient', {
            userPool: studentPool,
            generateSecret: false,
            authFlows: { userPassword: true },
        });
        const studentAuthorizer = new apigw.CognitoUserPoolsAuthorizer(
            this,
            'StudentAuthorizer',
            {
                cognitoUserPools: [studentPool],
                authorizerName: 'StudentAuthorizer',
            }
        );

        const bookingHandler = new lambda.Function(this, 'BookingHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 1024,
            timeout: cdk.Duration.seconds(5),
            handler: 'index.handler',
            code: lambda.Code.fromAsset(buildLambdaPath('BookingHandler')),
        });

        const bookingApi = new apigw.RestApi(this, 'BookingAPI', {
            restApiName: 'BookingAPI',
            description: 'Serves lambda function for Booking API',
        });
        const bookingIntegration = new apigw.LambdaIntegration(
            bookingHandler,
            {}
        );

        const mentorsResource = bookingApi.root.addResource('mentors');
        mentorsResource.addMethod('GET', bookingIntegration, {
            authorizer: studentAuthorizer,
            authorizationType: apigw.AuthorizationType.COGNITO,
        });
    }
}
