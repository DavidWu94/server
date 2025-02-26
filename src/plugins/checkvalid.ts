export function valid(data: { [key: string]: any }, keys: string[]): boolean{
    // If data is null or undefined, return false since it can't have keys
    if (data == null) {
        return false;
    }
    for (let key of keys) {
        if (data[key] === undefined) {
            return false; // Key is missing or its value is undefined
        }
    }
    return true; // All keys exist with defined values
}