import { Configuration, library } from "webpack"
import type { IslandHostPluginOptions, RenderType } from "../types/plugins"
import { MicrofrontendHostPlugin } from "./plugin/microFrontendHostPlugin"
import compiler from "million/compiler"
export const useIslandHost = (
    config: Configuration,
    islandHostOpts: IslandHostPluginOptions<RenderType>
) => {
    if (!Array.isArray(config.plugins)) {
        config.plugins = []
    }
    const publicPath = config.output?.publicPath;
    if (publicPath === undefined || publicPath === 'auto') {
        throw new Error("[@island/host] mount is will error, you should set publicPath manually");
    }
    config.plugins.push(new MicrofrontendHostPlugin(islandHostOpts));
    config.plugins.push(compiler.webpack({ 
        mode: 'react', 
    }));
    config.output = {
        ...config.output, 
        publicPath,
        filename: '[name].js',
        library: "islandRender",
        uniqueName: "islandRender"
    };
}