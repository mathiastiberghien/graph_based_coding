export interface InstanceRef{
    id: string;
}

export interface Instance<T>{
    instance: InstanceRef;
    value: T;
}

export interface Record{
    instance: InstanceRef;
    properties: KeyValuePair[];
}

export interface KeyValuePair{
    key: string;
    isArray?: boolean;
    model?: string;
    values: any[];
}

export interface DBModel{
    name: string;
    keys: Key[];
    instances?: DBInstance[];
}

export interface DBKeyValuePair{
    key: string;
    values: any[];
}

export interface DBInstance{
    id: string;
    properties: DBKeyValuePair[];
}

export interface Key{
    name: string;
    type: string;
    isArray?: boolean;
    model?: string;
}

