import { Compiler, container } from "webpack"
import type { IslandHostPluginOptions, RenderType } from "../../types/plugins"
import { createIslandHostOption } from "../../lib/createIslandHostOption"
const ISLAND_HOST_WEBPACK_PUBLIC_ERROR = `[@island/host] mount is will error, you should set publicPath manually,
We recommand publicPath set different value for [Development,Production] Environment`;


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
        throw new Error(ISLAND_HOST_WEBPACK_PUBLIC_ERROR);
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