import { Configuration, library } from "webpack"
import type { IslandHostPluginOptions, RenderType } from "../types/plugins"
import { MicrofrontendHostPlugin } from "./plugin/microFrontendHostPlugin"
export const useMicroFrontendHost = (
    config: Configuration,
    microFrontendOpts: IslandHostPluginOptions<RenderType>
) => {
    if (!Array.isArray(config.plugins)) {
        config.plugins = []
    }
    const publicPath = config.output?.publicPath;
    if (publicPath === undefined || publicPath === 'auto') {
        throw new Error("[@island/host] mount is will error, you should set publicPath manually");
    }
    config.plugins.push(new MicrofrontendHostPlugin(microFrontendOpts));
    config.output = {
        ...config.output, 
        publicPath,
        filename: '[name].js',
        library: "islandRender",
        uniqueName: "islandRender"
    };
}