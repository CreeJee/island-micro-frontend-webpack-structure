import {Plugin, mergeConfig as viteMergeConfig} from 'vite'
export const mergeConfigs = (plugins: Plugin[]) => {
    const baseViteRecord = Object.create(null) as Plugin;
    for (let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        viteMergeConfig(baseViteRecord,plugin);
    }
    return baseViteRecord
}