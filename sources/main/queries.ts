import sql, { config } from 'mssql';
import * as Lesson from './interfaces/Lesson';

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

export async function verify_InnerLesson(lesson: Lesson.Lesson, nuovaDataInizio: string, nuovaDataFine: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Select * from Lezione Where Data_Inizio > '" + nuovaDataInizio + "' AND Data_Fine < '" + nuovaDataFine + "' AND Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "'"); //execute the query
        poolConnection.close(); //close connection with database
        return resultSet.rowsAffected[0] > 0
        // ouput row contents from default record set
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

export async function create_Lesson(lesson: Lesson.Lesson): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Insert into Lezione values (" + lesson.ID_Calendario + ",'" + lesson.Nome_lezione + "'," + lesson.Materia + ",'" + lesson.Professore + "','" + lesson.Ora_inizio + "','" + lesson.Ora_fine + "','" + lesson.Giorno.toUpperCase() + "','" + lesson.Data_Inizio + "','" + lesson.Data_Fine + "')"); //execute the query
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
        var resultSet:sql.IResult<any> = await poolConnection.request().query("If Not Exists(select * from LibroPerLezione where ID_lezione=" + ID_Lezione + " AND ISBN='"+ ISBN + "') Begin Insert into LibroPerLezione values ("+ ID_Lezione + ", '" + ISBN + "') End"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return resultSet.rowsAffected[0] > 0;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function create_BooksForLesson(ID_Lezione: number, ISBNs: string[]): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        for(var ISBN of ISBNs) {
            await poolConnection.request().query("If Not Exists(select * from LibroPerLezione where ID_lezione=" + ID_Lezione + " AND ISBN='"+ ISBN + "') Begin Insert into LibroPerLezione values ("+ ID_Lezione + ", '" + ISBN + "') End"); //execute the query
        }
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return true
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}












export async function delete_Lesson(lesson: Lesson.Lesson): Promise<boolean> {
    try {
        const ID_Lezione = await get_LessonID_WithDate(lesson)
        var poolConnection = await sql.connect(conf); //connect to the database
        await poolConnection.request().query("Delete from Lezione where Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "' AND Data_Inizio='" + lesson.Data_Inizio + "' AND Data_Fine='" + lesson.Data_Fine + "'"); //execute the query
        await poolConnection.request().query("Delete from LibroPerLezione Where ID_lezione="+ID_Lezione); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return true;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function delete_BooksForLesson(ID_Lezione: number, ISBNs: string[]): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        for(var ISBN of ISBNs) {
            await poolConnection.request().query("Delete from LibroPerLezione where ID_lezione="+ ID_Lezione + " AND ISBN = '" + ISBN + "'"); //execute the query
        }
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return true;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function delete_Lessons_OfProfessor_Everywhere(Professore: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        await poolConnection.request().query("delete from LibroPerLezione where ID_lezione in (select ID from Lezione where Professore='" + Professore + "')"); //execute the query
        await poolConnection.request().query("Delete from Lezione Where Professore='"+Professore+"'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return true;
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function delete_Lessons_OfProfessor_Calendar(Professore: string, CalendarID: number): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        await poolConnection.request().query("delete from LibroPerLezione where ID_lezione in (select ID from Lezione where Professore='" + Professore + "' AND ID_Calendario='"+ CalendarID +"')"); //execute the query
        await poolConnection.request().query("Delete from Lezione Where Professore='"+Professore+"' AND ID_Calendario='"+ CalendarID +"'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        return true;
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

export async function get_LessonID_WithDate(lesson: Lesson.Lesson): Promise<number> {
    var ID = -1
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Lezione where Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "' AND Data_Inizio = '" + lesson.Data_Inizio + "' AND Data_Fine = '" + lesson.Data_Fine + "'"); //execute the query
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

export async function get_LessonsID_BetweenDate(lesson: Lesson.Lesson, dataInterest: string): Promise<number[]> {
    var ID: number[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Lezione where Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "' AND Data_Inizio < '" + dataInterest + "' AND Data_Fine > '" + dataInterest + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            ID.push(row.ID)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return ID;
}

export async function get_Classes_OfProfessor(Professore: string, Year: string): Promise<string[]> {
    var classes: string[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select DISTINCT Calendario.Classe from Lezione, Calendario where Lezione.Professore = '" + Professore + "' AND Calendario.Anno_Scolastico = '" + Year + "' AND Lezione.ID_Calendario = Calendario.ID"); //execute the query
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

export async function get_Subjects_OfProfessor(Professore: string, Year: string): Promise<string[]> {
    var subjects: string[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select DISTINCT Materia.Nome from Calendario, Lezione, Materia where Lezione.Professore = '" + Professore + "' AND Calendario.Anno_Scolastico = '" + Year + "' AND Lezione.Materia = Materia.ID AND Lezione.Materia > 0 AND Lezione.ID_Calendario = Calendario.ID"); //execute the query
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

export async function get_Institutes_OfProfessor(Professore: string, Year: string): Promise<number[]> {
    var institutes: number[] = [];
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select DISTINCT Calendario.Istituto from Lezione, Calendario where Lezione.Professore = '" + Professore + "' AND Calendario.Anno_Scolastico = '" + Year + "' AND Lezione.ID_Calendario = Calendario.ID"); //execute the query
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

export async function get_BooksISBN_OfLesson(lesson: Lesson.Lesson): Promise<string[]> {
    var ISBN: string[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select LibroPerLezione.ISBN from Lezione, LibroPerLezione where Professore='" + lesson.Professore + "' AND Ora_inizio='" + lesson.Ora_inizio + "' AND Ora_fine='" + lesson.Ora_fine + "' AND Giorno='" + lesson.Giorno.toUpperCase() + "' AND Data_Inizio='" + lesson.Data_Inizio + "' AND Data_Fine='" + lesson.Data_Fine + "' AND Lezione.ID = LibroPerLezione.ID_lezione"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            ISBN.push(row.ISBN)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return ISBN;
}

export async function get_Lesson_Information(ID: number): Promise<Lesson.Lesson> {
    var lesson: Lesson.Lesson = Lesson.defaultLesson();
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Lezione where ID = " + ID); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            const OraInizio: string[] = (new Date(row.Ora_inizio).toISOString().split('T')[1]).split(':')
            const OraFine: string[] = (new Date(row.Ora_fine).toISOString().split('T')[1]).split(':')
            
            row.Ora_inizio = OraInizio[0]+":"+OraInizio[1]
            row.Ora_fine = OraFine[0]+":"+OraFine[1]
            row.Data_Inizio = new Date(row.Data_Inizio).toISOString().split('T')[0]
            row.Data_Fine = new Date(row.Data_Fine).toISOString().split('T')[0]
            lesson = Lesson.assignVals_DB(row)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return lesson
}

export async function get_MateriaID_FromName(materia: string): Promise<number> {
    var ID: number = -1
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select ID from Materia where Name = '" + materia + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            ID = row.ID
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return ID
}

export async function get_Lessons_InDateWithDay(ID_Calendario: number, data: string, Giorno: string): Promise<Lesson.Lesson[]> {
    var lessons: Lesson.Lesson[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select * from Lezione where ID_Calendario="+ ID_Calendario+ " AND Data_Inizio <= '" + data + "' AND Data_fine > '" + data + "' AND Giorno = '" + Giorno.toUpperCase() + "'"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            const OraInizio: string[] = (new Date(row.Ora_inizio).toISOString().split('T')[1]).split(':')
            const OraFine: string[] = (new Date(row.Ora_fine).toISOString().split('T')[1]).split(':')
            
            row.Ora_inizio = OraInizio[0]+":"+OraInizio[1]
            row.Ora_fine = OraFine[0]+":"+OraFine[1]
            row.Data_Inizio = new Date(row.Data_Inizio).toISOString().split('T')[0]
            row.Data_Fine = new Date(row.Data_Fine).toISOString().split('T')[0]
            lessons.push(Lesson.assignVals_DB(row))
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return lessons;
}

export async function get_Books_InDate(ID_Calendario: number, data: string, Giorno: string): Promise<string[]> {
    var books: string[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("select LibroPerLezione.ISBN from Lezione, LibroPerLezione where ID_Calendario="+ ID_Calendario+ " AND Data_Inizio <= '" + data + "' AND Data_fine > '" + data + "' AND Giorno='" + Giorno.toUpperCase() + "' AND LibroPerLezione.ID_lezione=Lezione.ID"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            books.push(row.ISBN)
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return books;
}

export async function get_StudentLessons_InYear(ID_Calendario: string, Classe: string, IstitutoID: number): Promise<Lesson.Lesson[]> {
    var lessons: Lesson.Lesson[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
            .query("select * from Calendario, Lezione where Calendario.Classe = '" + Classe + "' AND Calendario.Istituto = " + IstitutoID + " AND Calendario.ID = '" + ID_Calendario + "' AND Calendario.ID = Lezione.ID_Calendario Order By Lezione.Data_Inizio"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            const OraInizio: string[] = (new Date(row.Ora_inizio).toISOString().split('T')[1]).split(':')
            const OraFine: string[] = (new Date(row.Ora_fine).toISOString().split('T')[1]).split(':')
            
            row.Ora_inizio = OraInizio[0]+":"+OraInizio[1]
            row.Ora_fine = OraFine[0]+":"+OraFine[1]
            row.Data_Inizio = new Date(row.Data_Inizio).toISOString().split('T')[0]
            row.Data_Fine = new Date(row.Data_Fine).toISOString().split('T')[0]
            lessons.push(Lesson.assignVals_DB(row))            
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return lessons;
}

export async function get_ProfessorLessons_InYear(annoCalendario: string, emailProfessore: string): Promise<Lesson.Lesson[]> {
    var lessons: Lesson.Lesson[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
            .query("select * from Calendario, Lezione where Lezione.Professore = '"+ emailProfessore +"' AND Calendario.Anno_Scolastico = '" + annoCalendario + "' AND Calendario.ID = Lezione.ID_Calendario Order By Lezione.Data_Inizio"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            const OraInizio: string[] = (new Date(row.Ora_inizio).toISOString().split('T')[1]).split(':')
            const OraFine: string[] = (new Date(row.Ora_fine).toISOString().split('T')[1]).split(':')
            
            row.Ora_inizio = OraInizio[0]+":"+OraInizio[1]
            row.Ora_fine = OraFine[0]+":"+OraFine[1]
            row.Data_Inizio = new Date(row.Data_Inizio).toISOString().split('T')[0]
            row.Data_Fine = new Date(row.Data_Fine).toISOString().split('T')[0]
            lessons.push(Lesson.assignVals_DB(row))            
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return lessons;
}

export async function get_AllYears_InCalendar(): Promise<string[]> {
    var years: string[] = []
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
            .query("select DISTINCT Anno_Scolastico from Calendario"); //execute the query
        poolConnection.close(); //close connection with database
        // ouput row contents from default record set
        resultSet.recordset.forEach(function(row: any) {
            years.push(row.Anno_Scolastico)            
        });
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return years;
}









export async function change_Lezione_DataPeriod(lesson: Lesson.Lesson, nuovaDataInizio: string, nuovaDataFine: string) {
    try {
        const lessonID = await get_LessonID_WithDate(lesson)
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Update Lezione Set Data_Inizio='" + nuovaDataInizio + "', Data_Fine='" + nuovaDataFine + "' Where ID=" + lessonID); //execute the query
        poolConnection.close(); //close connection with database
        return resultSet.rowsAffected[0] > 0
        // ouput row contents from default record set
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function change_LezioneSubject_DataPeriod(lesson: Lesson.Lesson, nuovaDataInizio: string, nuovaDataFine: string): Promise<boolean> {
    try {
        const lessonID = await get_LessonID_WithDate(lesson)
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Update Lezione Set Materia=" + lesson.Materia + " Where ID=" + lessonID); //execute the query
        poolConnection.close(); //close connection with database
        return resultSet.rowsAffected[0] > 0
        // ouput row contents from default record set
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function change_LezioneHours(lesson: Lesson.Lesson, OraInizio: string, OraFine: string): Promise<boolean> {
    try {
        const lessonID = await get_LessonID_WithDate(lesson)
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Update Lezione Set Ora_Inizio='" + OraInizio + "', Ora_Fine = '"+ OraFine +"' Where ID=" + lessonID); //execute the query
        poolConnection.close(); //close connection with database
        return resultSet.rowsAffected[0] > 0
        // ouput row contents from default record set
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function change_LezioneDay(lesson: Lesson.Lesson, nuovoGiorno: string): Promise<boolean> {
    try {
        const lessonID = await get_LessonID_WithDate(lesson)
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Update Lezione Set Giorno='" + nuovoGiorno.toUpperCase() + "' Where ID=" + lessonID); //execute the query
        poolConnection.close(); //close connection with database
        return resultSet.rowsAffected[0] > 0
        // ouput row contents from default record set
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}

export async function change_Email(oldEmail: string, newEmail: string): Promise<boolean> {
    try {
        var poolConnection = await sql.connect(conf); //connect to the database
        var resultSet:sql.IResult<any> = await poolConnection.request()
                                        .query("Update Lezione set Professore='" + newEmail + "' Where Professore='" + oldEmail + "'"); //execute the query
        poolConnection.close(); //close connection with database
        return true;
        // ouput row contents from default record set
    } catch (e: any) /* istanbul ignore next */ {
        console.error(e);
    }
    return false;
}