const UPDATED_CALLBACK = "$updatedCallback";
export function hasUpdatedCallback(target, prop, receiver, handler) {
    const callback = Reflect.get(target, UPDATED_CALLBACK);
    return (typeof callback === "function");
}
