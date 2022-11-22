
import { setContainerStore } from '../@initial/shadowStorage.js';
import type { IslandManifest, MountPageProps } from '../types/structure.js';
import { getXHRJSON } from './getXHRJSON.js';
import { loadModule } from './webpack-loader.js';

const islandDefaultData = {
  useShadowDom: false,
};
const getIslandManifest = async (origin:string): Promise<IslandManifest> => {
  const data = (await getXHRJSON(`${origin}/island-manifest.json`) ?? islandDefaultData) as Promise<IslandManifest>;
  return data;
}
export const requestMountPage = async ({mountDom,origin,module}:MountPageProps) => {
  if(!(mountDom instanceof HTMLElement)) {
    throw new Error("mount zone is not HTMLElement");
  }
  const islandManifest = await getIslandManifest(origin);
  const { 
    modules = null,
    scope = null,
    url = null,
    useShadowDom
  } = islandManifest;
  const mountRoot = useShadowDom ? mountDom.attachShadow({mode: 'open'}) : mountDom;

  if(modules === null || scope === null || url === null) {
    throw new Error(`Error: not vaild island-manifest / path: ${origin}/island-manifest.json `);
  }
  if(modules.length < 1) {
    throw new Error(`loadable module is empty! / manifestInfo: ${JSON.stringify(islandManifest)} `)
  }
  let usedModule: string;
  if(modules.length > 1) {
    if(!module) {
      throw new Error(`module is not found in manifest's modules! / manifestInfo: ${JSON.stringify(islandManifest)} `)
    }
    if(Object.hasOwn(modules,module)) {
      throw new Error(`Error loading module on ${module} in ${origin} / manifestInfo: ${JSON.stringify(islandManifest)} `)
    }
    usedModule = module;
  } else {
    usedModule = modules[0]
  }
  setContainerStore(scope, mountRoot);
  return {
    root: mountRoot,
    scope,
    module: usedModule,
    loadingModule: loadModule(
      url, 
      scope, 
      usedModule
    ),
  }
};
