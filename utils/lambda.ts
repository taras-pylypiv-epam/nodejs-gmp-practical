import * as path from 'node:path';

const ASSETS_PATH = '/../assets';

export function buildLambdaPath(lambdaName: string) {
    return path.join(
        __dirname,
        `${ASSETS_PATH}/lambda/${lambdaName}/dist/index.zip`
    );
}
