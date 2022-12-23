import fs from "fs"
import path from "path";
const appDirectory = fs.realpathSync(process.cwd());
export const readFromRoot = (filename:string) => {
    const filePath = path.resolve(appDirectory,filename);
    if(!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, "utf-8");
}

export const getJSONFromRoot = <T>(filename:string) => {
    const content = readFromRoot(filename);
    if(content) {
        return JSON.parse(content) as T;
    }
    return content;
}

