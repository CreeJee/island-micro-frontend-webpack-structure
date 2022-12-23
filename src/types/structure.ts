
export interface IslandManifest {
    origin: string;
    url: string;
    scope: string;
    modules: string[];
    useShadowDom?: boolean
};

export interface RenderModuleProps {
    loadingModule: Promise<any>,
}
export interface EmotionRenderModuleProps extends RenderModuleProps {
    cacheKey: string;
    container: Node
}

export interface MountPageProps {
    origin: string,
    module: string,
    mountDom: HTMLElement
}