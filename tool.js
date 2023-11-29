export function mergeObject(target, ...rest) {
    rest.forEach((item) => {
        for (let k in item) {
            target[k] = item[k];
        }
    });
    return target;
}
export function isEmptyObject(obj) {
    return !!Object.keys(obj || {}).length;
}
