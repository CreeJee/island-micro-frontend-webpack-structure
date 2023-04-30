/**
 *  1. vite에서 shadow dom 관련 로더 처리 
 *      - 플랜 선택
 *      1. inline css loader 구현 후 부분 로딩
 *      2. postcss 에코시스템에 합류 
 *  2. 
 *  
 **/


import { normalizeDevPath, injectQuery, isRelativePath } from './lib/pathUtils';
import fs from 'fs';
import path from 'path';
import type { ConfigEnv, PluginOption } from 'vite';
import { normalizePath as normalizePathOS,isCSSRequest } from 'vite';

export interface Options {
  exclude?: string | RegExp | Array<string | RegExp>;
  packageName?: string;
}

// const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`;
// const cssLangRE = new RegExp(cssLangs);
const runtimeTemplate = fs.readFileSync(
  path.join(__dirname, 'lib/runtime/style-provider-runtime.js'),
  'utf-8'
);

export default (options: Options = {}): PluginOption[] => {
  const loader = 'style-provider';
  const ignore = `from-style-provider`;

  const updateEventName = `${loader}:update` as const;
  const resolvedPrefix = `\0/`as const;
  const runtimeId = `${resolvedPrefix}${loader}/:runtime` as const;

  let command: ConfigEnv['command'];
  let packageName = options.packageName;
  let projectRoot = process.cwd();

  return [
    {
      name: '@island/remote',
      enforce: 'pre',
      // enforce: 'post',
      config(config, env) {
        command = env.command;
      },
      configResolved(config) {
        projectRoot = config.root;
        if (!packageName) {
          try {
            packageName = JSON.parse(
              fs.readFileSync(
                path.join(projectRoot, 'package.json'),
                'utf-8'
              )
            ).name;
          } catch (e) {
            throw new Error(`Requires "packageName" option`);
          }
        }
      },
      async handleHotUpdate({ server, file, modules, timestamp, read }) {
        if (isCSSRequest(file)) {
          server.ws.send({
            type: 'custom',
            event: updateEventName,
            data: {
              path: normalizeDevPath(projectRoot, file),
              modules,
              timestamp,
              content: await read(),
            },
          });
          return [];
        }
      },
      async resolveId(id, importer,options) {
        if (id === runtimeId) {
          return id;
        }
        // https://github.com/web-widget/vite-plugin-shadow-dom-css/blob/main/src/index.ts
        // css 리퀘스트일때에는 캡처완료
        if(isCSSRequest(id)) {
          const bundleIDSearch = id.slice(id.indexOf("?")+1);
          if (bundleIDSearch.length > 0) {
            const searchParams = new URLSearchParams(bundleIDSearch);
            const params = Object.create(null);

            Array.from(searchParams.entries()).forEach(([name, value]) => {
              const type = typeof params[name];
              if (type === 'undefined') {
                params[name] = value;
              } else if (type === 'object') {
                params[name].push(value);
              } else if (type === 'string') {
                params[name] = [params[name], value];
              }
            });

            if (params.query) {
              params.query = params.query.replace(/^~/, `${packageName}`).replace(`,~`, `,${packageName}`);
            }

            const data = JSON.stringify({ params, id: null });
            const encodeData = Buffer.from(data).toString('base64');
            const resolvedId = `${resolvedPrefix}${loader}/${encodeData}`;
            return resolvedId;
          }
          const paramsRE = /^[^\?]*|\?.*$/g;
          const [filename, query] = id.match(paramsRE) || [''];
          const normalizedPath = normalizeDevPath(
            projectRoot,
            isRelativePath(filename) ? 
              path.join(
                path.dirname(importer || ''),
                filename
              ) :
              filename
          );
          
          const data = JSON.stringify({ params: null, id: normalizedPath });
          const encodeData = Buffer.from(data).toString('base64');
          const resolvedId = `${resolvedPrefix}${loader}/${encodeData}`;
          return resolvedId;
        }
        // 나만의 module resolve 전략
      },
      async load(id,options) {
        // runtime
        if (id === runtimeId) {
          return runtimeTemplate;
        }

        const encodeData = id.replace(
          `${resolvedPrefix}${loader}/`,
          ''
        );
        const decodeData = Buffer.from(
          encodeData,
          'base64'
        ).toString('ascii');
        const data = JSON.parse(decodeData);


        // `\0/style-provider/${encodeData}`
        const normalizeId = data.id;
        const resolvedPath = /^\//.test(normalizeId)
          ? path.join(projectRoot, normalizeId)
          : normalizeId;
        const resolvedId = /^\//.test(normalizeId)
          ? `${packageName}${normalizeId}`
          : normalizeId;
        const cssId = injectQuery(
          injectQuery(resolvedPath, ignore),
          'inline'
        );
        const runtimeIdStringify = JSON.stringify(runtimeId);
        const idStringify = JSON.stringify(resolvedId);
        const cssIdStringify = JSON.stringify(cssId);
        const updateEventNameStringify = JSON.stringify(updateEventName);
        const normalizeIdStringify = JSON.stringify(normalizeId);

        if (command === 'serve') {
          return [
            `import css from ${cssIdStringify}`,
            `import { setStyle, useStyle } from ${runtimeIdStringify}`,
            `const id = ${idStringify}`,
            `setStyle(id, css)`,
            `const provider = useStyle(id)`,
            /**
             * @todo should we just do automatic mount?
             */
            `provider.mount()`,
            `export default provider`,
            `if (import.meta.hot) {`,
            ` import.meta.hot.on(${updateEventNameStringify}, ({ path, content }) => {`,
            `   if (path === ${normalizeIdStringify}) {`,
            `     console.log("[vite] hot updated:", path)`,
            `     setStyle(id, content)`,
            `   }`,
            ` })`,
            `}`,
          ].join('\n');
        } else {
          return [
            `import css from ${cssIdStringify}`,
            `import { setStyle, useStyle } from ${runtimeIdStringify}`,
            `const id = ${idStringify}`,
            `setStyle(id, css)`,
            `const provider = useStyle(id)`,
            /**
             * @todo should we just do automatic mount?
             */
            `provider.mount()`,
            `export default provider`,
          ].join('\n');
        }
      },
    },
  ];
};