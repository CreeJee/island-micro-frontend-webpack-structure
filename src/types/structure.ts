

export interface IslandManifest {
    origin: string;
    url: string;
    scope: string;
    modules: string[];
    useShadowDom?: boolean
};


export interface RenderModuleProps {
    cacheKey: string;
    container: Node
    loadingModule: Promise<any>,
}

export interface MountPageProps {
    origin: string,
    module: string,
    mountDom: HTMLElement
}