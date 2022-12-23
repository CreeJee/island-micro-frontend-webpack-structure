/**
 * Owned by @craco/craco
 * source: @craco/craco/lib/loaders.js
 * 
 * types by : https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/craco__craco/index.d.ts
 */
import type { Configuration as WebpackConfig,  RuleSetRule, RuleSetUseItem } from 'webpack';
export type LoaderUnion = RuleSetRule | RuleSetUseItem;
export type LoaderMatcher = (rule: LoaderUnion) => boolean;
export type LoaderMatched = {
    loader: LoaderUnion,
    parent: LoaderUnion[],
    index: number
}
export type PositionAdapter = (x: number) => number; 
import path from "path";


function isString(val:unknown): val is string {
    return typeof val === 'string';
}
function isArray<T>(val: T):val is (T extends unknown[] ? T : never) {
    return Array.isArray(val);
}
export function loaderByName(targetLoaderName:string): LoaderMatcher {
    return rule => {
        if (isString(rule)) {
            return (
                rule.indexOf(`${path.sep}${targetLoaderName}${path.sep}`) !== -1 ||
                rule.indexOf(`@${targetLoaderName}${path.sep}`) !== -1
            );
        } else if (typeof rule === "object" && isString(rule.loader)) {
        return (
            rule.loader.indexOf(`${path.sep}${targetLoaderName}${path.sep}`) !== -1 ||
            rule.loader.indexOf(`@${targetLoaderName}${path.sep}`) !== -1
        );
    }

        return false;
    };
}

function toMatchingLoader(
    loader:LoaderMatched['loader'],
    parent:LoaderMatched['parent'], 
    index:LoaderMatched['index']
):LoaderMatched {
    return {
        loader,
        parent,
        index
    };
}

function getLoaderRecursively(rules: LoaderUnion[], matcher:LoaderMatcher) : LoaderMatched{
    let loader:LoaderMatched | null = null;
    rules.some((rule, index) => {
        if (rule) {
            if (matcher(rule)) {
                loader = toMatchingLoader(rule, rules, index);
            } else if(typeof rule === 'object') {
                const ruleSet = rule as RuleSetRule;
                if (isArray(rule.loader)) {
                    loader = getLoaderRecursively(rule.loader, matcher);
                } else if (isArray(ruleSet.use)) {
                    loader = getLoaderRecursively(ruleSet.use, matcher);
                } else if (isArray(ruleSet.oneOf)) {
                    loader = getLoaderRecursively(ruleSet.oneOf, matcher);
                } else {
                    throw new Error(`Invalid rule`);   
                }
            }
        }
        return loader !== undefined;
    });
    if(loader === null) {
        throw new Error("loader is not found!");
    }

    return loader;
}

export function getLoader(webpackConfig:WebpackConfig, matcher:LoaderMatcher) {
    const matchingLoader = getLoaderRecursively(
        webpackConfig?.module?.rules ?? [],
        matcher
    );

    return {
        isFound: matchingLoader !== undefined,
        match: matchingLoader
    };
}

function getLoadersRecursively(
    rules:LoaderUnion[],
    matcher:LoaderMatcher, 
    matchingLoaders:LoaderMatched[]
) {
    if (!isArray(rules)) {
        rules = [rules];
    }

    rules.forEach((rule, index) => {
        if (rule) {
            if (matcher(rule)) {
                matchingLoaders.push(toMatchingLoader(rule, rules, index));
            } else if(typeof rule === 'object') {
                const ruleSet = rule as RuleSetRule;
                if (isArray(rule.loader)) {
                    getLoadersRecursively(rule.loader, matcher, matchingLoaders);
                } else if (isArray(ruleSet.use)) {
                    getLoadersRecursively(ruleSet.use, matcher, matchingLoaders);
                } else if (isArray(ruleSet.oneOf)) {
                    getLoadersRecursively(ruleSet.oneOf, matcher, matchingLoaders);
                } else {
                    throw new Error(`Invalid rule`);   
                }
            }
        }
    });
}

export function getLoaders(
    webpackConfig:WebpackConfig,
    matcher:LoaderMatcher
) {
    const matchingLoaders:LoaderMatched[] = [];

    getLoadersRecursively(webpackConfig?.module?.rules ?? [], matcher, matchingLoaders);

    return {
        hasFoundAny: matchingLoaders.length !== 0,
        matches: matchingLoaders
    };
}

function removeLoadersRecursively(
    rules:LoaderUnion[],
    matcher: LoaderMatcher
) {
    const toRemove = [];
    let removedCount = 0;
    for (let i = 0, max = rules.length; i < max; i += 1) {
        const rule = rules[i];
        if (rule) {
            if (matcher(rule)) {
                toRemove.push(i);
            }  else if(typeof rule === 'object') {
                const ruleSet = rule as RuleSetRule;
                if (typeof ruleSet.use ==='object' && typeof ruleSet.use !== 'function' ) {
                    const result = removeLoadersRecursively(ruleSet.use as any, matcher);
                    removedCount += result.removedCount;
                    ruleSet.use = result.rules;
                } else if (ruleSet.oneOf) {
                    const result = removeLoadersRecursively(ruleSet.oneOf, matcher);
                    removedCount += result.removedCount;
                    ruleSet.oneOf = result.rules as RuleSetRule[];
                }
            }
        }
    }

    toRemove.forEach((ruleIndex, i) => {
        rules.splice(ruleIndex - i, 1);
    });

    return {
        rules,
        removedCount: removedCount + toRemove.length
    };
}

export function removeLoaders(
    webpackConfig:WebpackConfig, 
    matcher:LoaderMatcher
) {
    const result = removeLoadersRecursively(webpackConfig?.module?.rules ?? [], matcher);

    return {
        hasRemovedAny: result.removedCount > 0,
        removedCount: result.removedCount
    };
}

function addLoader(
    webpackConfig:WebpackConfig, 
    matcher:LoaderMatcher,
    newLoader:LoaderUnion, 
    positionAdapter:PositionAdapter
) {
    const result = (isAdded:boolean) => ({
        isAdded
    });

    const { isFound, match } = getLoader(webpackConfig, matcher);

    if (isFound) {
        match.parent.splice(positionAdapter(match.index), 0, newLoader);

        return result(true);
    }

    return result(false);
}

export const addBeforeLoader = (
    webpackConfig:WebpackConfig,
    matcher:LoaderMatcher, 
    newLoader:LoaderUnion
) => addLoader(webpackConfig, matcher, newLoader, x => x);
export const addAfterLoader = (
    webpackConfig:WebpackConfig,
    matcher:LoaderMatcher, 
    newLoader:LoaderUnion
) => addLoader(webpackConfig, matcher, newLoader, x => x + 1);

export function addLoaders(    
    webpackConfig:WebpackConfig,
    matcher:LoaderMatcher, 
    newLoader:LoaderUnion,
    positionAdapter:PositionAdapter
) {
    const result = (isAdded:boolean, addedCount = 0) => ({
        isAdded,
        addedCount
    });

    const { hasFoundAny, matches } = getLoaders(webpackConfig, matcher);

    if (hasFoundAny) {
        matches.forEach(match => {
            match.parent.splice(positionAdapter(match.index), 0, newLoader);
        });

        return result(true, matches.length);
    }

    return result(false);
}

export const addBeforeLoaders = (
    webpackConfig:WebpackConfig,
    matcher:LoaderMatcher, 
    newLoader:LoaderUnion,
) => addLoaders(webpackConfig, matcher, newLoader, x => x);
export const addAfterLoaders = (
    webpackConfig:WebpackConfig,
    matcher:LoaderMatcher, 
    newLoader:LoaderUnion,
) => addLoaders(webpackConfig, matcher, newLoader, (x:number) => x + 1);
