import { Injectable, OnDestroy } from '@angular/core';
import {Instance, Record, InstanceRef, DBModel} from './database';
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

  async buildSample(): Promise<void>{
    const  models: DBModel[] = [
      {
        name: 'Person',
        keys: [{name: 'firstName', type: 'string'}, {name: 'surname', type: 'string'}],
        instances: [
          {id: 'p1', properties: [{key: 'firstName', values: ['Keanu']}, {key: 'surname', values: ['Reeves']}]},
          {id: 'p2', properties: [{key: 'firstName', values: ['Emma']}, {key: 'surname', values: ['Watson']}]},
          {id: 'p3', properties: [{key: 'firstName', values: ['Daniel']}, {key: 'surname', values: ['Radcliffe']}]},
          {id: 'p4', properties: [{key: 'firstName', values: ['Carie-Anne']}, {key: 'surname', values: ['Moss']}]},
          {id: 'p5', properties: [{key: 'firstName', values: ['Herman']}, {key: 'surname', values: ['Melville']}]},
        ]
      },
      {
        name: 'Role',
        keys: [{name: 'character', type: 'string'}, {name: 'actor', type: 'object', model: 'Person'}],
        instances: [
          {id: 'r1', properties: [{key: 'character', values: ['Neo']}, {key: 'actor', values: ['p1']}]},
          {id: 'r2', properties: [{key: 'character', values: ['Hermione Granger']}, {key: 'actor', values: ['p2']}]},
          {id: 'r3', properties: [{key: 'character', values: ['Harry Potter']}, {key: 'actor', values: ['p3']}]},
          {id: 'r4', properties: [{key: 'character', values: ['Trinity']}, {key: 'actor', values: ['p4']}]}
        ]
      },
      {
        name: 'Media',
        keys: [{name: 'title', type: 'string'}]
      },
      {
        name: 'Movie',
        extends: ['Media'],
        keys: [{name: 'roles', isArray: true, type: 'object', model: 'Person'}],
        instances: [
          {id: 'm1', properties: [{key: 'title', values: ['The Matrix']}, {key: 'roles', values: ['r1', 'r4']}]},
          {id: 'm2', properties: [{key: 'title', values: ['Harry Potter']}, {key: 'roles', values: ['r2', 'r3']}]}
        ]
      },
      {
        name: 'Book',
        extends: ['Media'],
        keys: [{name: 'author', type: 'object', model: 'Person'}],
        instances: [
          {id: 'b1', properties: [{key: 'title', values: ['Moby Dick']}, {key: 'author', values: ['p4']}]}
        ]
      },
      {
        name: 'Item',
        isEquivalentTo: ['Media'],
        keys: [{name: 'name', isMappedTo: 'title', type: 'string'}],
        instances: [
          {id: 'i1', properties: [{key: 'name', values: ['Item 1']}]}
        ]
      }
      ];

    await this.createDBModels(models);
    await this.clearUnusedObjects();
  }

  async clearUnusedObjects(): Promise<void>{
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
      console.log({'clear db changes': result.summary.counters.containsUpdates() ? result.summary.counters.updates() : 'No change'});
    }
    finally{
      await session.close();
    }
  }

  async createDBModels(models: DBModel[]): Promise<void>{
    if (models && models.length){
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
        'OPTIONAL MATCH (k)-[r:IS_MAPPED]->(mk:Key) WHERE key.isMappedTo IS NULL OR  mk.name <> key.isMappedTo ' +
        'DELETE r ' +
        'WITH DISTINCT model, m,k,t, key ' +
        'OPTIONAL MATCH (mk:Key) WHERE mk.name = key.isMappedTo ' +
        'MERGE (k)-[:IS_MAPPED]->(mk) ' +
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
        'MERGE (k)<-[:HAS_KEY]-(kvp:KeyValuePair)<-[:HAS_KEYVALUE_PAIR]-(i) ' +
        'MERGE (kvp)-[:HAS_VALUE]->(inst)';
        const result = await session.run(
          query,
          {name: 'models', models}
        );
        console.log({'update db model changes' : result.summary.counters.containsUpdates() ?
         result.summary.counters.updates() : 'No change'});
      }
      finally{
        await session.close();
      }
    }
  }

  async ngOnDestroy(): Promise<void>{
    await this.driver.close();
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
      'WITH m, mod, child, key ' +
      'UNWIND [mod, child] as model ' +
      'MATCH (instance:Instance)-[:IS_INSTANCE_OF]->(model) ' +
      (filter.length ? 'WHERE instance.id in $filter ' : '') +
      'WITH DISTINCT model,instance, key ' +
      'OPTIONAL MATCH (key)<-[:HAS_KEY]-(kvp:KeyValuePair)<-[:HAS_KEYVALUE_PAIR]-(instance) ' +
      'OPTIONAL MATCH (key)-[:IS_MAPPED*..]-(original_key:Key)<-[:HAS_KEY]-(mapped_kvp:KeyValuePair)<-[:HAS_KEYVALUE_PAIR]-(instance) ' +
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
    return [];
  }
}
