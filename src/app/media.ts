import {Role} from './role';
import { Person } from './person';

export interface Movie extends Media{
    roles: Role[];
}

export interface Media{
    title: string;
}

export interface Book extends Media{
    author: Person;
}
