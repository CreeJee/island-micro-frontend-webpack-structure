import type { Configuration } from "webpack"
import type { MicrofrontendHostPluginOptions, RenderType } from "../types/plugins"
import { MicrofrontendHostPlugin } from "./microFrontendHostPlugin"
export const useMicroFrontendHost = (
    config: Configuration,
    microFrontendOpts: MicrofrontendHostPluginOptions<RenderType>
) => {
    if (!Array.isArray(config.plugins)) {
        config.plugins = []
    }
    const publicPath = config.output?.publicPath;
    if (publicPath === undefined || publicPath === 'auto') {
        throw new Error("[@island/host] mount is will error, you should set publicPath manually");
    }
    config.plugins.push(new MicrofrontendHostPlugin(microFrontendOpts));
}