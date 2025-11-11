const UPDATED_CALLBACK = "$updatedCallback";
export async function updatedCallback(target, refs, receiver, handler) {
    const callback = Reflect.get(target, UPDATED_CALLBACK);
    if (typeof callback === "function") {
        const paths = new Set();
        const indexesByPath = {};
        for (const ref of refs) {
            const path = ref.info.pattern;
            paths.add(path);
            if (ref.info.wildcardCount > 0) {
                const index = ref.listIndex.index;
                let indexes = indexesByPath[path];
                if (typeof indexes === "undefined") {
                    indexesByPath[path] = [index];
                }
                else {
                    indexes.push(index);
                }
            }
        }
        await callback.call(receiver, Array.from(paths), indexesByPath);
    }
}
