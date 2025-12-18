export class TableDto{
    constructor(name: string, columns: string[]){
        this.name = name;
        this.columns = columns;
    }
    columns: string[];
    name: string;
}