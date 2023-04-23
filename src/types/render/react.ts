import { ReactNode, ReactElement } from "react";
import { RenderModuleProps } from "../structure";

export interface ReactRenderModuleProps extends RenderModuleProps {
    indecator: ReactNode
    wrapper?: (props: {children: ReactNode}) => ReactElement;
  }