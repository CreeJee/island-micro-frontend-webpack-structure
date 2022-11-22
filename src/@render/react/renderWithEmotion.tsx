
import { EmotionRenderModuleProps } from "../../types/structure";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { PropsWithChildren, lazy, Suspense } from "react";

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
    const LazyModule = lazy(() => loadingModule);
    return (
      <CacheProvider value={cache}>
        <Suspense fallback={<>{children}</>}>
          <LazyModule />
        </Suspense>
      </CacheProvider>
    );
};