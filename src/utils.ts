import { FieldDefinition } from "@astronautlabs/bitstream";

export function applyFlag(value: number, flag: number, enabled: boolean) {
    if (enabled)
        return value | flag;
    else
        return value & ~flag;
}

export function discoverFieldName(field: (value: any) => any) {
    let capturedFields: (string | symbol)[] = [];
    field(new Proxy({}, {
        get: (_, p, __) => capturedFields.push(p)
    }));

    if (capturedFields.length > 1)
        throw new Error(`Multiple fields accessed during field specifier: ${JSON.stringify(capturedFields)}`);

    return capturedFields[0];
}

export function FlagAccess<T, K extends keyof T>(field: (instance: T) => any, flag: number) {
    let fieldName = discoverFieldName(field);

    return (target: T, propertyKey: K) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                return (this[fieldName] & flag) !== 0;
            },
            set(v) {
                this[fieldName] = applyFlag(this[fieldName] ?? 0, flag, v);
            },
        })
    }
}

/**
 * When the field is assigned, runs the given side effect function.
 * @param sideEffect 
 * @returns 
 */
export function SideEffect<T, K extends keyof T, V = T[K]>(sideEffect: (value: V, previousValue: V, instance: T) => void) {
    return (target: T, propertyKey: K) => {
        let actualKey = Symbol(String(propertyKey));

        Object.defineProperty(target, actualKey, { enumerable: false });
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[actualKey];
            },
            set(value) {
                let previousValue = this[actualKey];
                this[actualKey] = value;
                sideEffect(value, previousValue, this);
            },
        })
    }
}

export function summarizeField(field: FieldDefinition) {
    return `[${field.options.serializer.constructor.name || '<unknown serializer>'}] ${field.containingType?.name || '<unknown>'}#${String(field.name)}`;
}