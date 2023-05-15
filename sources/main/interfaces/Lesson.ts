import * as protoGen from '../generated/calendar'
import proto = protoGen.calendar

export interface Lesson {
    Nome_lezione: string;
    Materia: number;
    Professore: string;
    Ora_inizio: string;
    Ora_fine: string;
    Giorno: string
    ID_Calendario: number;
}

export function defaultLesson(): Lesson {
    const data: Lesson = {Nome_lezione: "", Materia: -1, Professore: "", Ora_inizio: "", Ora_fine: "", Giorno: "", ID_Calendario: -1}
    return data;
}

export function assignVals_JSON(json: any): Lesson {
    const data: Lesson = {Nome_lezione: json.Nome_lezione, Materia: json.Materia, Professore: json.Professore, Ora_inizio: json.Ora_inizio, Ora_fine: json.Ora_fine, Giorno: json.Giorno, ID_Calendario: json.ID_Calendario}
    return data;
}

export function assignVals_DB(json: any): Lesson {
    const data: Lesson = {Nome_lezione: json.Nome_lezione, Materia: json.Materia, Professore: json.Professore, Ora_inizio: json.Ora_inizio.toString(), Ora_fine: json.Ora_fine.toString(), Giorno: json.Giorno, ID_Calendario: json.ID_Calendario}
    return data;
}

export function generate_protoLesson(json: Lesson): proto.Lesson {
    return new proto.Lesson({email_executor: "", Nome_lezione: json.Nome_lezione, Materia: json.Materia, Professore: json.Professore, Ora_inizio: json.Ora_inizio, Ora_fine: json.Ora_fine, Giorno: json.Giorno, ID_Calendario: json.ID_Calendario})
}

export function verify_Basic_DataPresence(json: any): boolean {    
    return (json.Nome_lezione && json.Materia && json.Professore && json.Ora_inizio && json.Ora_fine && json.Giorno && json.ID_Calendario)
}

export function toString(json: Lesson): string {    
    return "NOME LEZIONE: " + json.Nome_lezione + " MATERIA: " + json.Materia + " PROFESSORE: " + json.Professore + " ORARIO INIZIO: " +  json.Ora_inizio + " ORARIO FINE: " +  json.Ora_fine + " GIORGNO: " + json.Giorno + " CALENDARIO ID: " + json.ID_Calendario;
}

export function isAssigned(json: Lesson): boolean {
    return json.Nome_lezione != "" && json.Materia != -1 && json.Professore != "" && json.Ora_inizio != "" && json.Ora_fine != "" && json.Giorno != "" && json.ID_Calendario != -1;
}