import {Role} from './role';
import { Person } from './person';
import { DBDate} from './dbDate';

export interface Movie extends Media{
    roles: Role[];
}

export interface Media{
    title: string;
    releaseDate?: DBDate;
}

export interface Book extends Media{
    author: Person;
}
