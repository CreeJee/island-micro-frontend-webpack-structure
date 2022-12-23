import ReactDOM from "react-dom/client";
import { requestMountPage } from "../lib/module";
import type { IslandHostPluginOptions, RenderType } from "../types/plugins";
import { MountPageProps } from "../types/structure";
import { RenderModule as RenderEmotion } from "./react/renderWithEmotion";
import { RenderModule as RenderSuspense } from "./react/render";
import { useLayoutEffect, useRef } from "react";
type FederationProps = Omit<MountPageProps,'mountDom'> & IslandHostPluginOptions<"react"> & {
    indecator?: React.ReactNode
}
export const Render = async (
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
            const RenderNode = props.hasEmotion ? RenderEmotion : RenderSuspense;
            const reactRoot = ReactDOM.createRoot(
                root,
                {
                    identifierPrefix: `${scope}/${module}`,
                }
            );
            reactRoot.render(
                <RenderNode  
                    container={root}
                    loadingModule={loadingModule}
                    cacheKey={scope}
                >
                    {props.indecator}
                </RenderNode >,
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