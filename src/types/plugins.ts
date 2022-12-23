

import type { container, } from "webpack"
type ModuleFederationPluginOptions = ConstructorParameters<typeof container.ModuleFederationPlugin>[0]
type SharedObject = ModuleFederationPluginOptions['shared'];

export type RenderType = "react" | "webComponents"
interface RemoteOptionsSet extends Record<RenderType, object> {
    "react": {
        hasEmotion?: boolean,
    }
    "webComponents": {
    }
}

export type IslandHostDepsRecord = {
    [K in RenderType]: (opts: RemoteOptionsSet[K]) => SharedObject
}
export type IslandHostPluginOptions<Type extends RenderType> =
    RemoteOptionsSet[Type] & {
        type: Type,
        exposes?: ModuleFederationPluginOptions['exposes']
        shared?: ModuleFederationPluginOptions['shared']
    }
export type IslandRemotePluginOptions<Type extends RenderType> = RemoteOptionsSet[Type]