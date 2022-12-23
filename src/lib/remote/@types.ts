import type webpack from "webpack"
export type { Configuration as WebpackConfig } from 'webpack';

export type ModuleFederationConfig = ConstructorParameters<
    typeof webpack.container.ModuleFederationPlugin
>[0];

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