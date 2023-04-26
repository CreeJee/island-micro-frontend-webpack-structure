export interface PageModuleStructure {
    url: string;
    scope: string;
    modules: string[];
};
export interface IslandPluginOptions {
    useNamedChunkIds?: boolean
    useShadowDom?: boolean,
    fontDisplay?: "swap" | "fallback" | "block" | "auto" | "optional"
};
export interface IslandManifestContent extends PageModuleStructure, IslandPluginOptions {
}