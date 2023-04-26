import { Compiler, container } from "webpack"
import type { IslandHostPluginOptions, RenderType } from "../../types/plugins"
import { createIslandHostOption } from "../../lib/createIslandHostOption"
import millionCompiler from "million/compiler"

export const useIslandHost = (
    compiler: Compiler,
    islandHostOpts: IslandHostPluginOptions<RenderType>
) => {
    const config = compiler.options;
    if (!Array.isArray(config.plugins)) {
        config.plugins = []
    }
    const publicPath = config.output?.publicPath;
    if (publicPath === undefined || publicPath === 'auto') {
        throw new Error("[@island/host] mount is will error, you should set publicPath manually");
    }
    config.plugins.push(new container.ModuleFederationPlugin(createIslandHostOption(islandHostOpts)));
    config.output = {
        ...config.output, 
        publicPath,
        filename: '[name].js',
        library: {
            name:"islandRender",
            type:"var",
        },
        uniqueName: "@island/host"
    };
}