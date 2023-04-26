import type { container } from "webpack";

export type ModuleFederationConfig = ConstructorParameters<
    typeof container.ModuleFederationPlugin
>[0];