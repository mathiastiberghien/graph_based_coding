import {DBModel} from './database';

export const sample: DBModel[] = [
    {
        name: 'Date',
        keys: [{name: 'year', type: 'number'}, {name: 'month', type: 'number'}, {name: 'day', type: 'number'}],
        instances: [
          {id: '1964-9-2', properties: [{key: 'year', values: [1964]}, {key: 'month', values: [9]}, {key: 'day', values: [2]}]},
          {id: '1964-8-27', properties: [{key: 'year', values: [1964]}, {key: 'month', values: [8]}, {key: 'day', values: [27]}]}
        ]
    },
    {
        name: 'Person',
        keys: [{name: 'firstName', type: 'string'}, {name: 'surname', type: 'string'}, {name: 'dob', type: 'object', model: 'Date'}],
        instances: [
          {id: 'p1', properties: [{key: 'firstName', values: ['Keanu']}, {key: 'surname', values: ['Reeves']}, {key: 'dob', values: ['1964-9-2']}]},
          {id: 'p2', properties: [{key: 'firstName', values: ['Emma']}, {key: 'surname', values: ['Watson']}]},
          {id: 'p3', properties: [{key: 'firstName', values: ['Daniel']}, {key: 'surname', values: ['Radcliffe']}]},
          {id: 'p4', properties: [{key: 'firstName', values: ['Carie-Anne']}, {key: 'surname', values: ['Moss']}]},
          {id: 'p5', properties: [{key: 'firstName', values: ['Herman']}, {key: 'surname', values: ['Melville']}]},
          {id: 'p6', properties: [{key: 'firstName', values: ['Julie']}, {key: 'surname', values: ['Andrews']}]}
        ]
      },
      {
        name: 'Role',
        keys: [{name: 'character', type: 'string'}, {name: 'actor', type: 'object', model: 'Person'}],
        instances: [
          {id: 'r1', properties: [{key: 'character', values: ['Neo']}, {key: 'actor', values: ['p1']}]},
          {id: 'r2', properties: [{key: 'character', values: ['Hermione Granger']}, {key: 'actor', values: ['p2']}]},
          {id: 'r3', properties: [{key: 'character', values: ['Harry Potter']}, {key: 'actor', values: ['p3']}]},
          {id: 'r4', properties: [{key: 'character', values: ['Trinity']}, {key: 'actor', values: ['p4']}]},
          {id: 'r5', properties: [{key: 'character', values: ['Kevin Lomax']}, {key: 'actor', values: ['p1']}]},
          {id: 'r6', properties: [{key: 'character', values: ['Mary Poppins']}, {key: 'actor', values: ['p6']}]}
        ]
      },
      {
        name: 'Media',
        keys: [{name: 'title', type: 'string'}, {name: 'releaseDate', type: 'object', model: 'Date'}]
      },
      {
        name: 'Movie',
        extends: ['Media'],
        keys: [{name: 'roles', isArray: true, type: 'object', model: 'Role'}],
        instances: [
          {id: 'm1', properties: [{key: 'title', values: ['The Matrix']}, {key: 'roles', values: ['r1', 'r4']}]},
          {id: 'm2', properties: [{key: 'title', values: ['Harry Potter']}, {key: 'roles', values: ['r2', 'r3']}]},
          {id: 'm3', properties: [{key: 'title', values: ['The Devil"s Advocate']}, {key: 'roles', values: ['r5']}]},
          {id: 'm4', properties: [{key: 'title', values: ['Mary Poppins']}, {key: 'roles', values: ['r6']}, {key: 'releaseDate', values: ['1964-8-27']}]}
        ]
      },
      {
        name: 'Book',
        extends: ['Media'],
        keys: [{name: 'author', type: 'object', model: 'Person'}],
        instances: [
          {id: 'b1', properties: [{key: 'title', values: ['Moby Dick']}, {key: 'author', values: ['p5']}]}
        ]
      },
      {
        name: 'Item',
        isEquivalentTo: ['Media'],
        keys: [{name: 'name', isEquivalentTo: 'title', type: 'string'}],
        instances: [
          {id: 'i1', properties: [{key: 'name', values: ['Item 1']}]}
        ]
      }
    ];
