
import { PropsWithChildren, lazy, Suspense, ReactNode } from "react";
import { ReactRenderModuleProps } from "../../types/render/react";

const DefaultWrapper = ({children}: {children:ReactNode}) => <>{children}</>
export const RenderModule = ({
    loadingModule,
    indecator,
    children,
    wrapper: Wrapper = DefaultWrapper
  }: PropsWithChildren<ReactRenderModuleProps>) => {
    const LazyModule = lazy(() => loadingModule);
    return (
      <Wrapper>
        <Suspense fallback={indecator}>
          <LazyModule>
            {children}
          </LazyModule>
        </Suspense>
      </Wrapper>
    );
};