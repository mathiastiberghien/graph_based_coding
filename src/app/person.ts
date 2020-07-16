import { DBDate } from './dbDate';

export interface Person{
    firstName: string;
    surname: string;
    dob?: DBDate;
}
