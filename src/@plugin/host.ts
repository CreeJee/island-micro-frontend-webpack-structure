import { createUnplugin } from "unplugin";
import { IslandHostPluginOptions, RenderType } from "../types/plugins";
import { useIslandHost } from "./webpack/islandHost";

import millionCompiler from "million/compiler"
import federation from "@originjs/vite-plugin-federation"
import { createIslandHostOption } from "../lib/createIslandHostOption";
import { mergeConfigs } from "./vite/lib/mergeConfigs";
import { Compiler } from "webpack";
export const hostPlugin = (islandOpts: IslandHostPluginOptions<RenderType>) => createUnplugin(() => {
    
    const viteAlies = mergeConfigs([
        federation(createIslandHostOption(islandOpts)),
        {
            name:'@island/host',
    
        }
    ]);
    const compileWebpack = (webpackCompiler: Compiler) => {
        useIslandHost(webpackCompiler,islandOpts)
    };
    return [
        millionCompiler.raw,
        {
            name : "@island/host",
            webpack:compileWebpack,
            rspack:compileWebpack,
            vite:viteAlies,
            rollup:viteAlies,
        }
    ]
})