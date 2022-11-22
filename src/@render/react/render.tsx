
import { RenderModuleProps } from "../../types/structure";
import { PropsWithChildren, lazy, Suspense } from "react";

export const RenderModule = ({
    loadingModule,
    children,
  }: PropsWithChildren<RenderModuleProps>) => {
    const LazyModule = lazy(() => loadingModule);
    return (
        <Suspense fallback={<>{children}</>}>
          <LazyModule />
        </Suspense>
    );
};