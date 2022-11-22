import ReactDOM from "react-dom/client";
import { requestMountPage } from "../lib/module";
import type { MicrofrontendHostPluginOptions, RenderType } from "../types/plugins";
import { MountPageProps } from "../types/structure";
import { RenderModule as RenderEmotion } from "./react/renderWithEmotion";
import { RenderModule as RenderSuspense } from "./react/render";
type FederationProps = MountPageProps &  MicrofrontendHostPluginOptions<"react"> & {
    indecator?: React.ReactNode
}
export const Render = async (
    props: FederationProps,
) => {
    const { loadingModule, root, module, scope } = await requestMountPage(props);
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
};
export default Render;