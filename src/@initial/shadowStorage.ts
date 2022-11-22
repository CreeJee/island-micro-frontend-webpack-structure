const containerKey = Symbol.for("@shadow-dom/mount-root");
export interface WindowWithContainerStore extends Window {
    [containerKey]: Record<string, Node>;
}
declare let window: WindowWithContainerStore;

const useContainerStore = () => (window[containerKey] ?? (window[containerKey] = {}));
export const setContainerStore = (name: string, $mountShadow: Node) => {
    const container = useContainerStore();
    if (name in container) {
        console.warn(`${name} is already exist from container's store, it will be overrided `)
    }
    container[name] = $mountShadow;
}
export const getContainerStore = (name: string) => {
    const container = useContainerStore();
    return container[name];
}
