
import { name } from '../../package.json';
import { Compiler, container, } from "webpack"
import { ModuleFederationDepsRecord, MicrofrontendHostPluginOptions, RenderType } from '../types/plugins';



const OptRecord: ModuleFederationDepsRecord = {
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
    constructor(opts: MicrofrontendHostPluginOptions<Type>) {
        const moduleFederationOptions = opts.moduleFederationOptions ?? {}
        super({
            ...moduleFederationOptions,
            name: moduleFederationOptions.name ?? name,
            shared: {
                ...OptRecord[opts.type](opts),
                ...moduleFederationOptions.shared
            },
        })
    }
}