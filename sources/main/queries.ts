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
                                        .query("Insert into Lezione values (" + lesson.ID_Calendario + ",'" + lesson.Nome_lezione + "'," + lesson.Materia + ",'" + lesson.Professore + "'," + lesson.Ora_inizio + "," + lesson.Ora_fine + ",'" + lesson.Giorno.toUpperCase() + "')"); //execute the query
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
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select ID from Calendario where Anno_Scolastico = '" + Anno_Scolastico + "' AND Istituto = " + Istituto + " AND Classe = '" + Classe + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            return row.ID
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return -1;
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