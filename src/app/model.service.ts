import { Injectable, OnDestroy } from '@angular/core';
import {Instance, Record, InstanceRef, DBModel} from './database';
import {sample} from './sample';
import * as neo4j from 'neo4j-driver';

@Injectable({
  providedIn: 'root'
})
export class ModelService implements OnDestroy {
  private driver: neo4j.Driver;

  constructor(
  ) {
    this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'admin'));
  }

  async buildSample(): Promise<{[key: string]: number}>{
    const r1 = await this.createOrUpdateDBModels(sample);
    const r2 = await this.clearUnusedObjects();
    const r = {};
    let hasUpdates = false;
    for (const key in r1) {
      if (Object.prototype.hasOwnProperty.call(r1, key)){
        let val = r1[key];
        if (Object.prototype.hasOwnProperty.call(r2, key)) {
          val += r2[key];
        }
        hasUpdates = hasUpdates || val > 0;
        if (val > 0){
          r[key] = val;
        }
      }
    }
    console.log({changes: hasUpdates ? r : 'No changes'});
    return r;
  }

  private async createOrUpdateDBModels(models: DBModel[]): Promise<{[key: string]: number}>{
    if (models){
      const session = this.driver.session();
      try{
        const query = 'UNWIND $models as model ' +
        'WITH collect(model) as models, collect(model.name) as names ' +
        'OPTIONAL MATCH (n:Model) WHERE NOT n.name IN names ' +
        'OPTIONAL MATCH (n)-[r1]-() ' +
        'OPTIONAL MATCH (n)<-[:IS_INSTANCE_OF]-(i:Instance)-[r2]-() ' +
        'DELETE r2, r1, n ' +
        'WITH models ' +
        'UNWIND models as model ' +
        'MERGE (m:Model{name:model.name}) ' +
        'WITH model, m ' +
        'OPTIONAL MATCH (m)-[r:IS_EQUIVALENT]->(em:Model) WHERE model.isEquivalentTo IS NULL OR  NOT em.name in model.isEquivalentTo ' +
        'DELETE r ' +
        'WITH DISTINCT model, m ' +
        'OPTIONAL MATCH (em:Model) WHERE em.name in model.isEquivalentTo ' +
        'MERGE (m)-[:IS_EQUIVALENT]->(em) ' +
        'WITH DISTINCT model, m ' +
        'UNWIND model.keys as key ' +
        'MERGE (k:Key{name:key.name, isArray: CASE WHEN key.isArray IS NOT NULL THEN key.isArray ELSE false END}) ' +
        'MERGE (t:Type{name:key.type}) ' +
        'WITH model, m,k,t, key ' +
        'OPTIONAL MATCH (k)-[r:IS_EQUIVALENT]->(mk:Key) WHERE key.isEquivalentTo IS NULL OR  mk.name <> key.isEquivalentTo ' +
        'DELETE r ' +
        'WITH DISTINCT model, m,k,t, key ' +
        'OPTIONAL MATCH (mk:Key) WHERE mk.name = key.isEquivalentTo ' +
        'MERGE (k)-[:IS_EQUIVALENT]->(mk) ' +
        'WITH DISTINCT model,m,k,t, key.model as modelType ' +
        'MERGE (m)-[:HAS_KEY]->(k) ' +
        'MERGE (k)-[:HAS_TYPE]->(t) ' +
        'WITH model,m,k, modelType, t ' +
        'OPTIONAL MATCH (k)-[r:HAS_TYPE]->(rt:Type) WHERE rt <> t ' +
        'DELETE r ' +
        'WITH DISTINCT model, m ,k, modelType ' +
        'OPTIONAL MATCH (mt:Model{name:modelType}) ' +
        'MERGE (k)-[:HAS_MODELTYPE]->(mt) ' +
        'WITH DISTINCT model,m, collect (k.name) as keys ' +
        'OPTIONAL MATCH (m)-[r:HAS_KEY]->(k:Key) WHERE NOT k.name in keys ' +
        'DELETE r ' +
        'WITH  DISTINCT model,m ' +
        'UNWIND model.instances as instance ' +
        'WITH DISTINCT model, m, collect(instance.id) as ids ' +
        'OPTIONAL MATCH (m)<-[r:IS_INSTANCE_OF]-(ri:Instance) WHERE NOT ri.id in ids ' +
        'DELETE r ' +
        'WITH  DISTINCT model ' +
        'UNWIND model.instances as instance ' +
        'MATCH (m:Model{name:model.name}) ' +
        'MERGE (i:Instance{id:instance.id}) ' +
        'MERGE (i)-[:IS_INSTANCE_OF]->(m) ' +
        'WITH DISTINCT model, instance, i, m ' +
        'UNWIND instance.properties as kvp ' +
        'WITH DISTINCT model, instance, i, m, collect(kvp.key) as keys ' +
        'OPTIONAL MATCH (i)-[r:HAS_KEYVALUE_PAIR]->(rkvp:KeyValuePair)-[:HAS_KEY]->(k:Key) WHERE NOT k.name IN keys ' +
        'DELETE r ' +
        'WITH DISTINCT instance, i, m, model ' +
        'OPTIONAL MATCH (m)-[r:EXTENDS]->(p:Model) WHERE model.extends IS NULL OR  NOT p.name in model.extends ' +
        'DELETE r ' +
        'WITH DISTINCT instance, i, m, model ' +
        'OPTIONAL MATCH (p:Model) WHERE p.name in model.extends ' +
        'MERGE (m)-[:EXTENDS]->(p) ' +
        'WITH DISTINCT instance, i, m, p ' +
        'UNWIND [m, p] as model ' +
        'WITH DISTINCT instance, i, model as m ' +
        'UNWIND instance.properties as kvp ' +
        'MATCH (k:Key{name:kvp.key})<-[:HAS_KEY]-(m) ' +
        'WITH DISTINCT i,k, kvp.values as values ' +
        'OPTIONAL MATCH (i)-[:HAS_KEYVALUE_PAIR]->(kvp:KeyValuePair)-[:HAS_KEY]->(k) ' +
        'OPTIONAL MATCH (kvp)-[r2:HAS_VALUE]->(v:Instance) WHERE NOT v.id IN values ' +
        'DELETE r2 ' +
        'WITH DISTINCT i,k, values ' +
        'UNWIND values as value ' +
        'MERGE (inst:Instance{id:value}) ' +
        'MERGE (k)<-[:HAS_KEY]-(kvp:KeyValuePair)-[:HAS_VALUE]->(inst) ' +
        'MERGE (i)-[:HAS_KEYVALUE_PAIR]->(kvp)';
        const result = await session.run(
          query,
          {name: 'models', models}
        );
        return result.summary.counters.updates();
      }
      finally{
        await session.close();
      }
    }
  }

  private async clearUnusedObjects(): Promise<{[key: string]: number}>{
    const session = this.driver.session();
    try{
      const query = 'OPTIONAL MATCH (n:KeyValuePair) WHERE NOT (n)<-[:HAS_KEYVALUE_PAIR]-(:Instance)-[:IS_INSTANCE_OF]->(:Model) ' +
      'OPTIONAL MATCH (n)-[r]-() ' +
      'DELETE r, n ' +
      'WITH {} as dummy ' +
      'OPTIONAL MATCH (n:Key) WHERE NOT (n)<-[:HAS_KEY]-() ' +
      'OPTIONAL MATCH (n)-[r]-() ' +
      'DELETE r, n ' +
      'WITH {} as dummy ' +
      'OPTIONAL MATCH (n:Type) WHERE NOT (n)<-[:HAS_TYPE]-(:Key) ' +
      'OPTIONAL MATCH (n)-[r]-() ' +
      'DELETE r, n ' +
      'WITH {} as dummy ' +
      'OPTIONAL MATCH (n:Instance) WHERE NOT (n)<-[:HAS_VALUE]-(:KeyValuePair) AND NOT (n)-[:IS_INSTANCE_OF]->(:Model) ' +
      'OPTIONAL MATCH (n)-[r]-() ' +
      'DELETE r, n';
      const result = await session.run(
        query
      );
      return result.summary.counters.updates();
    }
    finally{
      await session.close();
    }
  }

  async getInstances<T>(modelName: string,
                        filterInstances?: InstanceRef[],
                        recursiveDepth?: number,
                        currentDepth?: number): Promise<Instance<T>[]>{
    currentDepth = currentDepth || 0;
    const session = this.driver.session();
    try {
      const filter = (filterInstances && filterInstances.length) ? filterInstances.map(value => value.id) : [];
      const query = 'MATCH (m:Model{name:$name}) ' +
      'OPTIONAL MATCH (k:Key)<-[:HAS_KEY]-(m) ' +
      'OPTIONAL MATCH (pk:Key)<-[:HAS_KEY]-(:Model)<-[:EXTENDS*..]-(m) ' +
      'WITH m,k, pk ' +
      'UNWIND [k,pk] as key ' +
      'WITH DISTINCT m, key ' +
      'OPTIONAL MATCH (equivalent:Model)<-[:IS_EQUIVALENT]-(m) ' +
      'WITH m, equivalent, key ' +
      'UNWIND [m, equivalent] as mod ' +
      'OPTIONAL MATCH (child:Model)-[:EXTENDS*..]->(mod) ' +
      'WITH mod, child, key ' +
      'UNWIND [mod, child] as model ' +
      'MATCH (instance:Instance)-[:IS_INSTANCE_OF]->(model) ' +
      (filter.length ? 'WHERE instance.id in $filter ' : '') +
      'WITH DISTINCT model,instance, key ' +
      'OPTIONAL MATCH (key)<-[:HAS_KEY]-(kvp:KeyValuePair)<-[:HAS_KEYVALUE_PAIR]-(instance) ' +
      'OPTIONAL MATCH (key)-[:IS_EQUIVALENT*..]-(original_key:Key)<-[:HAS_KEY]-(mapped_kvp:KeyValuePair)<-[:HAS_KEYVALUE_PAIR]-(instance)' +
      'WITH kvp, mapped_kvp, key,original_key,instance, model ' +
      'UNWIND [kvp, mapped_kvp] as kvps ' +
      'WITH DISTINCT model, instance, kvps, key, original_key ' +
      'MATCH (kvps)-[:HAS_VALUE]->(v:Instance) ' +
      'OPTIONAL MATCH (v)-[:IS_INSTANCE_OF]->(vm:Model) ' +
      'WITH original_key,key, vm,{id:instance.id, model:model.name} as instanceInfo, collect (CASE WHEN vm IS NULL  THEN v.id ELSE {id:v.id} END) as values ' +
      'RETURN {instance:instanceInfo, properties: collect ({key:key.name, originalKey: original_key.name,  model:vm.name, values:values,isArray: CASE WHEN original_key IS NOT NULL THEN (original_key.isArray IS NOT NULL AND original_key.isArray) ELSE ((key.isArray IS NOT NULL) AND key.isArray) END})} as instances ' +
      'ORDER BY instances.instance.id';
      const result = await session.run(
        query,
        {name: modelName, filter}
      );
      const instances = result.records.map(async (value) =>
        {
            const i = value.get(0) as Record;
            const v = {};
            const r: Instance<T> = {instance: null, value: null};
            if (i){
              r.instance = i.instance;
              if (i.properties && i.properties.length){
                  for (const element of i.properties) {
                  if (typeof(recursiveDepth) === 'undefined' || recursiveDepth === null ||
                     recursiveDepth < 0 ||
                      (recursiveDepth > 0 && currentDepth >= recursiveDepth) ||
                       !element.model) {
                  v[element.key] = element.isArray ? element.values : element.values[0];
                  }
                  else{
                    const recursiveInstances = await this.getInstances<any>(element.model,
                       element.values,
                        recursiveDepth,
                         currentDepth + 1);
                    const recursiveValues = recursiveInstances.map(inst => inst.value);
                    v[element.key] = element.isArray ? recursiveValues : recursiveValues[0];

                  }
                }
              }
              r.value = v as T;
            }
            return  r;
        } );
      return Promise.all(instances);
    } finally {
      await session.close();
    }
  }

  async ngOnDestroy(): Promise<void>{
    await this.driver.close();
  }
}
