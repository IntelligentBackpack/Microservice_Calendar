import sql, { config } from 'mssql';
import { Lesson } from './interfaces/Lesson';

const conf: config = {
    user: 'intelligentSystem', // better stored in an app setting such as process.env.DB_USER
    password: 'LSS#2022', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'intelligent-system.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'IntelligentBackpack', // better stored in an app setting such as process.env.DB_NAME
    options: {
        encrypt: true
    }
}

export async function verify_CalendarExists_DATA(Anno_Scolastico: string, Istituto: number, Classe: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Calendario where Anno_Scolastico = '" + Anno_Scolastico + "' AND Istituto = " + Istituto + " AND Classe = '" + Classe + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return true;
}

export async function verify_CalendarExists_ID(ID: number): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Calendario where ID=" + ID); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return true;
}

export async function verify_MateriaExists(ID: number): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Materia where ID=" + ID); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return true;
}













export async function create_Calendar(Anno_Scolastico: string, Istituto: number, Classe: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Calendario values ('" + Anno_Scolastico + "'," + Istituto + ",'" + Classe + "')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return true;
}

export async function create_Lesson(lesson: Lesson): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Lezione values (" + lesson.ID_Calendario + ",'" + lesson.Nome_lezione + "'," + lesson.Materia + ",'" + lesson.Professore + "','" + lesson.Ora_inizio + "','" + lesson.Ora_fine + "','" + lesson.Giorno.toUpperCase() + "')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function create_BookForLesson(ID_Lezione: number, ISBN: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into LibroPerLezione values ("+ ID_Lezione + ", '" + ISBN + "')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}












export async function delete_Lesson(lesson: Lesson): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Delete from Lezione where Nome_lezione='" + lesson.Nome_lezione + "' AND Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return true;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function delete_BookForLesson(ID_Lezione: number, ISBN: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Delete from LibroPerLezione where ID_lezione="+ ID_Lezione + " AND ID_Libro = '" + ISBN + "')"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}












export async function get_Calendar_ID(Anno_Scolastico: string, Istituto: number, Classe: string): Promise<number> {
    var ID = -1
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request().query("select * from Calendario where Anno_Scolastico = '" + Anno_Scolastico + "' AND Istituto = " + Istituto + " AND Classe = '" + Classe + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            ID = row.ID
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return ID;
}

export async function get_Calendar_Info(ID: number): Promise<object> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Calendario where ID = " + ID); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            return row
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return {};
}

export async function get_Materia(ID: number): Promise<object> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Materia where ID = " + ID); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            return row
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return {};
}

export async function get_LessonID(lesson: Lesson): Promise<number> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Lezione where Nome_lezione='" + lesson.Nome_lezione + "' AND Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            return row
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return -1;
}

export async function get_Classes_OfProfessor(Professore: string): Promise<string[]> {
    var classes: string[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select Calendario.Classe from Lezione, Calendario where Lezione.Professore = '" + Professore + "' AND Lezione.ID_Calendario = Calendario.ID"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            classes.push(row.Classe)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return classes;
}

export async function get_Subjects_OfProfessor(Professore: string): Promise<string[]> {
    var subjects: string[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select Materia.Nome from Lezione, Materia where Lezione.Professore = '" + Professore + "' AND Lezione.Materia = Materia.ID"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            subjects.push(row.Nome)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return subjects;
}

export async function get_Institutes_OfProfessor(Professore: string): Promise<number[]> {
    var institutes: number[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select Calendario.Istituto from Lezione, Calendario where Lezione.Professore = '" + Professore + "' AND Lezione.ID_Calendario = Calendario.ID"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            institutes.push(+row.Istituto)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return institutes;
}

export async function get_Materie_OfStudent(ID_Calendario: number): Promise<string[]> {
    var subjects: string[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select Materia.Nome from Lezione, Materia where Lezione.ID_Calendario = " + ID_Calendario + " AND Lezione.Materia = Materia.ID"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            subjects.push(row.Nome)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return subjects;
}