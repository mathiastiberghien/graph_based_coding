import {Role} from './role';
import { Person } from './person';
import { DBDate} from './dbDate';

export class Media{
    title: string;
    releaseDate?: DBDate;
}

export class Movie extends Media{
    roles: Role[];
}

export class Book extends Media{
    author: Person;
}
