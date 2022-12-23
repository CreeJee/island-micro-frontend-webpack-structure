
import { name } from '../../../package.json';
import { Compiler, container, } from "webpack"
import { IslandHostDepsRecord, IslandHostPluginOptions, RenderType } from '../../types/plugins';
import { getJSONFromRoot, readFromRoot } from '../../lib/fromRootFile';



const OptRecord: IslandHostDepsRecord = {
    react({ hasEmotion }) {
        return {
            'react-dom': {
                eager: true,
                requiredVersion: false,
                singleton: true,
            },
            react: {
                eager: true,
                requiredVersion: false,
                singleton: true,
            },
            ...(hasEmotion ? {
                "@emotion/cache": {
                    eager: true,
                    requiredVersion: false,
                    singleton: true,
                },
                "@emotion/react": {
                    eager: true,
                    requiredVersion: false,
                    singleton: true,
                },
                "@emotion/styled": {
                    eager: true,
                    requiredVersion: false,
                    singleton: true,
                },
            } : {

            })
        }
    },
    webComponents() {
        return {}
    }
}

export class MicrofrontendHostPlugin<Type extends RenderType> extends container.ModuleFederationPlugin {
    constructor(opts: IslandHostPluginOptions<Type>) {
        const { exposes,shared} = opts;
        const json = getJSONFromRoot<{name: string}>("package.json");
        if(!json) {
            throw new Error(`package.json not found from your project`);
        }
        super({
            name,
            shared: {
                ...OptRecord[opts.type](opts),
                ...shared
            },
            exposes
        })
    }
}