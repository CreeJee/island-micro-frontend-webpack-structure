import { createUnplugin } from "unplugin";
import { IslandPluginOptions } from "../lib/remote/@types";
import { useIslandRemote } from "./webpack/islandRemote";

import millionCompiler from "million/compiler"
import federation from "@originjs/vite-plugin-federation"
import { PluginFederationOptions } from "../types/moduleFederation";
import { mergeConfigs } from "./vite/lib/mergeConfigs";
import { Compiler } from "webpack";

interface RemotePluginOptions {
    modulefederationConfig: PluginFederationOptions,
    config: IslandPluginOptions,
}
export const remotePlugin = createUnplugin((
    { 
        config,
        modulefederationConfig
    }: RemotePluginOptions
) => {
    const viteAlies = mergeConfigs([
        federation(modulefederationConfig),
        {
            name:'@island/remote',
            apply:'build',
            
        }
    ]);
    const compileWebpack = (webpackCompiler: Compiler) => {
        useIslandRemote(
            webpackCompiler,
            modulefederationConfig,
            config
        )
    };
    return [
        millionCompiler.raw,
        {
            name : "@island/remote",
            webpack:compileWebpack,
            rspack:compileWebpack,
            vite:viteAlies,
            rollup:viteAlies,
            load(id) {
                const islandConfig = JSON.stringify(config);
                this.emitFile({
                    type:'asset',
                    fileName:'island-manifest.json',
                    source:islandConfig
                })
                return null;
            },
        }
    ]
})
