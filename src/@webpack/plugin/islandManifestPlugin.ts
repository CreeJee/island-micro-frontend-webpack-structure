import webpack, { WebpackPluginInstance } from "webpack";
import { IslandManifestContent } from "../../lib/remote/@types";
import { defaultOptions } from "../../lib/remote/defaultOptions";

const { RawSource } = webpack.sources;
export class IslandManifestPlugin implements WebpackPluginInstance {
    options: IslandManifestContent;
    constructor(config: IslandManifestContent) {
        this.options = Object.assign(config, defaultOptions)
    }
    createManifest(compilation: webpack.Compilation) {
        const contentSize = JSON.stringify(this.options);
        const name = 'island-manifest.json';
        compilation.emitAsset(
            name,
            new RawSource(contentSize),
            {
                immutable: true,
                size: Buffer.from(contentSize).length,
                name,
                
            }
        )
    }

    apply(compiler: webpack.Compiler) {
        compiler.hooks.thisCompilation.tap('CreateIslandManifestPlugin', compilation => {
            compilation.hooks.processAdditionalAssets.tap(
                {
                    name: 'CreateIslandManifestPlugin',
                }, () => {
                    this.createManifest(compilation)
                }
            )
        });
    }
}