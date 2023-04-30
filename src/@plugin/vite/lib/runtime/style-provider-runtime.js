/** 
 * 1. core-js polyfill 을 고려
 * 2. 번들링타임 transform
 **/

/**
 * 
 * @param {ShadowRoot | HTMLElement} containerDom 
 * 
 * @returns 
 */
const createMountFn = (
  moduleNamespace,
  moduleFederatonStyleKey
) => {
  /**
   * @typedef {Record<string, ShadowRoot | DOcument>} moduleStore
   * @type {moduleStore}
   */
  var moduleStore = window[moduleFederatonStyleKey][moduleNamespace];

  /**
   * @param {string} css 
   * @param {string} cssMedia 
   */
  var createStyleSheet = function(css,cssMedia) {
    var styleSheet = new CSSStyleSheet({
      media:cssMedia
    });
    styleSheet.insertRule(css);
  }
  /**
   * 
   * @param {string} css 
   * @param {string} media 
   * @param {{fontDisplay: string}} config
   */
  var styleTagToTransform = (
    css, 
    media,
    config
  ) => {
    /**
     * @typedef {{css: string,media:string,globalStyles: string[]}} StyleTransformContext
     * @type {(StyleTransformContext)}
     */
    const styleTagContext = {
      globalStyles:[]
    };
    //append fontStyle
    while (true) {
      var isFontFace = css.indexOf("@font-face") >= 0;
      var isCssImport = css.indexOf("@import") >= 0;
      // font-및 import 기능이 있는지 확인한다
      if (!(isFontFace || isCssImport)) {
        break;
      }
      var cssFontFaceContent = "";
      if (isFontFace) {
        var cursorStart = css.indexOf("@font-face");
        var cursorEnd = css.indexOf("}", cursorStart);
        cssFontFaceContent = css.substring(cursorStart, cursorEnd);
        if(!cssFontFaceContent.includes("font-display")) {
          cssFontFaceContent += `font-display: ${config.fontDisplay};`
        }
        cssFontFaceContent += "}";
        cursorEnd += 1;
        css = css.slice(0, cursorStart) + css.slice(cursorEnd);
        styleTagContext.globalStyles.push({css:cssFontFaceContent, media: "screen"})
      }
    }
    styleTagContext.css = css;
    styleTagContext.media = media;
    return styleTagContext;
  }
  return function createProvider($container,id) {
    /**
     * 마운트 되는곳의 stylesheet
     */
    var $mounted = (
      $container instanceof ShadowRoot ? 
        $container : 
        $container instanceof HTMLElement ? 
          document : 
          null
    );
    /**
     * @type {{
     *  styleSheet: null | CSSStyleSheet,
     *  fontCssStylesheet: null | CSSStyleSheet,
     * }}
     */
    var providerContext = {
      styleSheet: null,
      fontCssStylesheet: null
    };
    var provider =  {
      mount: () => {
        if (providerContext.styleSheet === null && providerContext.fontCssStylesheet === null) {
          providerContext.fontCssStylesheet = new CSSStyleSheet({media: "all"});
          document.adoptedStyleSheets = [].concat(
            ...document.adoptedStyleSheets,
            providerContext.fontCssStylesheet
          )
          provider.update();
        }
      },
      update: () => {
        const content = getStyle(id);
        if (typeof content !== 'string') {
          throw new Error(`Style not found: ${id}`);
        }
        const {css,globalStyles,media} = styleTagToTransform(content);

        //append FontStyle
        const fontCssStylesheet = globalStyles.map((v) => v).join(";");
        if( providerContext.fontCssStylesheet ) {
          providerContext.fontCssStylesheet.replace(fontCssStylesheet)
        }
        //if media is changed then it must cleanup
        if(providerContext.styleSheet !== null && providerContext.styleSheet.media !== media) {
          providerContext.styleSheet.replaceSync("");
          providerContext.styleSheet = null;

        }
        //append provider's shadow dom style
        if (providerContext.styleSheet === null) {
          providerContext.styleSheet = new CSSStyleSheet({media});
        }
        //set content
        providerContext.styleSheet.replace(css);
        // then mount it
        $mounted.adoptedStyleSheets = [].concat(
          ...$mounted.adoptedStyleSheets,
          globalStylesheet
        )
        
      },
      unmount: () => {
        if(providerContext.styleSheet !== null) {
          providerContext.styleSheet.replaceSync("");
          providerContext.styleSheet = null;
        }
        if(providerContext.fontCssStylesheet !== null) {
          providerContext.fontCssStylesheet.replaceSync("");
          providerContext.fontCssStylesheet = null;
        }
      },
      unload: () => {
        StylesProviderCache.dependencies.get(id).delete(provider);
      }
    }
    return provider;
  }
} 


const StylesProviderCache = window.StylesProviderCache ?? {
  /**
   * @typedef {string} CSSContent
   * @typedef {string} ViteModuleID
   * @type {Map<ViteModuleID,CSSContent>}
   */
  contents: new Map(),
  /**
   * @type {Map<ViteModuleID,Set<unknown>>}
   */
  dependencies: new Map(),
  providers: new Map()
};
/**
 * 
 * @param {RegExp} filter 
 * @param {HTMLElement} container 
 * @param {string} name 
 * @returns 
 */
const create = (filter, container, name) => () => Array.from(StylesProviderCache.contents.keys())
  .filter(id => filter.test(id))
  .forEach(id => {
    useStyle(id)(container)[name]()
  });

/**
 * 
 * @param {ViteModuleID} id 
 * @param {CSSContent} content 
 */
export function setStyle(id, content) {
  StylesProviderCache.contents.set(id, content);

  if (!StylesProviderCache.dependencies.has(id)) {
    StylesProviderCache.dependencies.set(id, new Set());
  }

  StylesProviderCache.dependencies.get(id).forEach(provider => {
    provider.update();
  });
}
/**
 * 
 * @param {ViteModuleID} id 
 * @returns 
 */
export function hasStyle(id) {
  return StylesProviderCache.contents.has(id);
}

/**
 * 
 * @param {ViteModuleID} id 
 * @returns 
 */
export function deleteStyle(id) {
  StylesProviderCache.dependencies.get(id)?.forEach(provider => {
    provider.unmount();
    provider.unload();
  });
  return StylesProviderCache.contents.delete(id);
}
/**
 * 
 * @param {ViteModuleID} id 
 * @returns 
 */
export function getStyle(id) {
  return StylesProviderCache.contents.get(id);
}


/**
 * base64로 담긴 css content
 * @param {string} query 
 * @returns 
 */
export function useQueryStyle(query) {
  const filter = new RegExp(`^(${query.replace(/\*+/g, '.*').split(',').join('|')})$`)
  return container => ({
    mount: create(filter, container, 'mount'),
    unmount: create(filter, container, 'unmount'),
    unload: create(filter, container, 'unload')
  })
}
/**
 * 
 * @param {ViteModuleID} id 
 * @returns 
 */
export function useStyle(id) {
  if (StylesProviderCache.providers.has(id)) {
    return StylesProviderCache.providers.get(id);
  }

  StylesProviderCache.providers.set(
    id, 
    function styleProvider(container = moduleStore[moduleNamespace]) {
      const provider = createProvider(container, id);
      StylesProviderCache.dependencies.get(id)?.add(provider);
      return provider;
    }
  );

  return StylesProviderCache.providers.get(id);
}

window.StylesProviderCache = StylesProviderCache;