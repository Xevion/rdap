export function truthy(value: string | null | undefined) {
    if (value == undefined) return false;
    return value.toLowerCase() == 'true' || value == '1';
}

