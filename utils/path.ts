import * as path from 'node:path';

const ASSETS_PATH = '/../assets';
const RESOURCES_PATH = '/../resources';

export function buildLambdaPath(lambdaName: string) {
    return path.join(
        __dirname,
        `${ASSETS_PATH}/lambda/${lambdaName}/dist/index.zip`
    );
}

export function buildEmailTemplatePath(templateName: string) {
    return path.join(__dirname, `${RESOURCES_PATH}/${templateName}.html`);
}
