
import { EmotionRenderModuleProps } from "../../types/structure";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { PropsWithChildren } from "react";
import { RenderModule as RenderPureReact } from "./render.js";

export const RenderModule = ({
    loadingModule,
    cacheKey,
    children,
    container
  }: PropsWithChildren<EmotionRenderModuleProps>) => {
    const cache = createCache({
      key:cacheKey,  
      container,
    })
    return (
      <CacheProvider value={cache}>
        <RenderPureReact loadingModule={loadingModule}>
          {children}
        </RenderPureReact>
      </CacheProvider>
    );
};