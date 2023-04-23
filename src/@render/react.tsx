import ReactDOM from "react-dom/client";
import { requestMountPage } from "../lib/module";
import type { IslandHostPluginOptions, RenderType } from "../types/plugins";
import { MountPageProps } from "../types/structure";
import { RenderModule as RenderSuspense } from "./react/render";
import { useLayoutEffect, useRef } from "react";
import { ReactRenderModuleProps } from "../types/render/react";
type FederationProps = (
    Omit<MountPageProps,'mountDom'> & 
    Omit<IslandHostPluginOptions<"react">,'type'> & 
    {
        indecator?: React.ReactNode
        wrapper?: ReactRenderModuleProps['wrapper']
    }
)
export const Render = (
    props: FederationProps,
) => {
    const domRootRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        let reactMounted:ReactDOM.Root | null = null;
        const init = async () => {
            const mountDom = domRootRef.current
            if(!mountDom) {
                return;
            }
            const { loadingModule, root, module, scope } = await requestMountPage({
                ...props,
                mountDom
            });
            reactMounted = ReactDOM.createRoot(
                root,
                {
                    identifierPrefix: `${scope}/${module}`,
                }
            );
            reactMounted.render(
                <RenderSuspense  
                    container={root}
                    cacheKey={scope}
                    loadingModule={loadingModule}
                    wrapper={props.wrapper}
                    indecator={props.indecator}
                />
            );
        }
        init();
        return () => {
            if(reactMounted) {
                reactMounted.unmount();
            }
        }
    },[])
    return <div ref={domRootRef}/>
};
export default Render;