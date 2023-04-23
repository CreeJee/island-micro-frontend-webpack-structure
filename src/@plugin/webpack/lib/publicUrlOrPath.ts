import fs from 'fs'
import path from 'path'
import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath';
// inject from react-scripts/config/paths


// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);


export const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    require(resolveApp('package.json')).homepage,
    process.env.PUBLIC_URL
)

export default publicUrlOrPath