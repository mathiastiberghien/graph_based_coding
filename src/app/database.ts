export class Instance<T>{
    instance: InstanceRef; // Instance reference
    value: T; // Instance client object
}

export class InstanceRef{
    id: string; // Database instance id
}

export class Record{ // Db query result record
    instance: InstanceRef; // Instance reference
    properties: KeyValuePair[]; // Instance properties as keyvaluepair collection
}

export class KeyValuePair{ // Db query result keyvaluepair
    key: string; // Key name
    isArray?: boolean; // Stores the informations that defines if the key is a collection or a single object
    model?: string; // Model name if values are instances references
    values: any[]; // The values which should be number or string representing primitives or instance id
    originalKey?: string; // The original key name if the instance came from on an equivalent model with an equivalent key
}

export class DBModel{
    name: string; // Name of the model
    extends?: string[]; // Name of the models extended by the model
    isEquivalentTo?: string[]; // Name of the models that are equivalent to the model
    keys: DBKey[]; // Keys of the model
    instances?: DBInstance[]; // Instances of the model
}

export class DBKey{
    name: string; // Name of the key
    type: string; // Type of the key (should be on one of 'string', 'number', or 'object')
    isEquivalentTo?: string; // Name of a equivalent key
    isArray?: boolean; // Stores the informations that defines if the key is a collection or a single object
    model?: string; // The name of the Model when the key represents instance of another Model
}

export class DBKeyValuePair{
    key: string; // The key name
    values: any[]; // The values which should be number or string representing primitives or instance id
}

export class DBInstance{
    id: string; // The id of the instance
    properties: DBKeyValuePair[]; // The properties of the instance as a collection of keyvaluepair
}

