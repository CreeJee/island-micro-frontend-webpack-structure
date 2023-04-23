import { createUnplugin } from "unplugin";
import { ModuleFederationConfig, IslandPluginOptions } from "../lib/remote/@types";
import { useIslandRemote } from "./webpack/islandRemote";

import millionCompiler from "million/compiler"
import { mergeConfigs } from "./vite/lib/mergeConfigs";

const millionOptions = {mode:"react"} as const;

const webpackMillion = millionCompiler.webpack(millionOptions);
const viteMillion = millionCompiler.vite(millionOptions);

interface RemotePluginOptions {
    modulefederationConfig: ModuleFederationConfig,
    config: IslandPluginOptions,
}

export const remotePlugin = createUnplugin((
    {config,modulefederationConfig}: RemotePluginOptions
) => {
    return [
        millionCompiler.raw,
        {
            name : "@island/remote",
            webpack(compiler) {
                useIslandRemote(
                    compiler,
                    modulefederationConfig,
                    config
                );
            },
            rspack(compiler) {
                useIslandRemote(
                    compiler,
                    modulefederationConfig,
                    config
                );
            },
            vite: mergeConfigs([
                ...(Array.isArray(viteMillion) ? viteMillion :[viteMillion]),
            ]),
            
            writeBundle(...args) {
                console.log(    )
            }
        }
    ]
})
