


import type {Shared, SharedObject, Exposes} from './moduleFederation'
export type RenderType = "react" | "webComponents"
interface RemoteOptionsSet extends Record<RenderType, object> {
    "react": {}
    "webComponents": {}
}

export type IslandHostDepsRecord = {
    [K in RenderType]: (opts: RemoteOptionsSet[K]) => SharedObject
}
export type IslandHostPluginOptions<Type extends RenderType> =
    RemoteOptionsSet[Type] & {
        type: Type,
        exposes?: Exposes
        shared?: Shared
    }
export type IslandRemotePluginOptions<Type extends RenderType> = RemoteOptionsSet[Type]