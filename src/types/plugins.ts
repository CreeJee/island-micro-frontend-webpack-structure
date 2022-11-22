

import type { container, } from "webpack"
type ModuleFederationPluginOptions = ConstructorParameters<typeof container.ModuleFederationPlugin>[0]
type SharedObject = ModuleFederationPluginOptions['shared'];

export type RenderType = "react" | "webComponents"
interface PluginOptionsSet extends Record<RenderType, object> {
    "react": {
        hasEmotion?: boolean,
    }
    "webComponents": {
    }
}

export type ModuleFederationDepsRecord = {
    [K in RenderType]: (opts: PluginOptionsSet[K]) => SharedObject
}
export type MicrofrontendHostPluginOptions<Type extends RenderType> =
    PluginOptionsSet[Type] & {
        type: Type,
        moduleFederationOptions?: ModuleFederationPluginOptions
    }