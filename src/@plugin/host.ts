import { createUnplugin } from "unplugin";
import { IslandHostPluginOptions, RenderType } from "../types/plugins";
import { useIslandHost } from "./webpack/islandHost";

import millionCompiler from "million/compiler"

const millionOptions = {mode:"react"} as const;

const webpackMillion = millionCompiler.webpack(millionOptions);
export const hostPlugin = (islandOpts: IslandHostPluginOptions<RenderType>) => createUnplugin(() => {
    return {
        name : "@island/host",
        webpack(compiler) {
            webpackMillion.apply(compiler);
            useIslandHost(compiler,islandOpts)
        },
        rspack(compiler) {
            webpackMillion.apply(compiler);
            useIslandHost(compiler,islandOpts)
        },
        
    }
})