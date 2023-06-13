import * as protoGen from '../generated/calendar'
import proto = protoGen.calendar

export interface Subject {
    ID: number
    Nome: string                 
}

export function defaultSubject(): Subject {
    const data: Subject = {ID: -1, Nome: ""}
    return data;
}

export function assignVals_JSON(json: any): Subject {
    var data: Subject = defaultSubject()
    data = {ID: json.ID, Nome: json.Nome}
    return data;
}

export function assignVals_DB(json: any): Subject {
    const data: Subject = {ID: json.ID, Nome: json.Nome}
    return data;
}

export function generate_protoSubject(json: Subject): proto.Subject {
    return new proto.Subject({ID: json.ID.toString(), Name: json.Nome})
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.ID && json.Nome)
}

export function toString(json: Subject): string {    
    return "ID: " + json.ID + " NOME: " + json.Nome;
}

export function isAssigned_WithDate(json: Subject): boolean {
    return json.ID != -1 && json.Nome != "";
}

export function IsAssigned_Base(json: Subject): boolean {
    return json.ID != -1 && json.Nome != "";
}