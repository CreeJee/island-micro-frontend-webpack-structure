import {Plugin, ResolvedConfig} from "vite"
import federation from "@originjs/vite-plugin-federation";
import { IslandHostPluginOptions, RenderType } from "../../types/plugins";
import { createIslandHostOption } from "../../lib/createIslandHostOption";
export const viteHostPlugin = (
    islandHostOpt: IslandHostPluginOptions<RenderType>
) :Plugin[] => {
    const moduleName = '@island/host';
    const resolvedPrefix = `\0/`;
    const virtualModuleId = `virtual:${moduleName}`
    const resolvedVirtualModuleId = `${resolvedPrefix}${virtualModuleId}`

    let viteConfig:ResolvedConfig;
    return [
        federation(createIslandHostOption(islandHostOpt)),
        {
            name:moduleName,
            configResolved(config) {
              viteConfig = config;
            },
            resolveId(id) {
              if (id === virtualModuleId) {
                return resolvedVirtualModuleId
              }
            },
            load(id) {
              if (id === resolvedVirtualModuleId) {
                return `export const msg = "from virtual module"`
              }
            },
        }
    ]
}