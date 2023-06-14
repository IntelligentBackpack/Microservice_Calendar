import request from 'supertest';
import app from '../main/app';

import * as protoCalendar from '../main/generated/calendar'
import proto = protoCalendar.calendar

jest.setTimeout(45000);



const lesson = new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "11:30", Ora_fine: "12:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})



describe('Testing creation route', function() {
    describe('Testing creating a lesson', function() {
        it('Should return an error 400 for bad message format', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "", Materia: 1, Professore: "", Ora_inizio: "10:30", Ora_fine: "11:30", Giorno: "Giovedì", ID_Calendario: 3})}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Verify that values professore, ora inizio, ora fine, data inizio, data fine and giorno are inserted.")
        });

        it('Should return an error 401 for no privileges', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "10:30", Ora_fine: "11:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());
    
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for creating a lesson.")
        });

        it('Should return an error 400 for no subject', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1665489163, Professore: "admin", Ora_inizio: "10:30", Ora_fine: "11:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("The ID of the materia passed does not exists.")
        });
        
        it('Should return an error 400 for no calendar', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "10:30", Ora_fine: "11:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 9844651318})}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("The ID of the calendar passed does not exists.")
        });

        it('Should return success 200 for adding the calendar', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: lesson}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Lesson created successfully")
        });
    });

    describe('Testing creating a book for a lesson', function() {
        it('Should return an error 400 for bad message format', async() => {
            const serverResponse = await request(app).put('/create/bookForLesson').send(new proto.BooksForLesson({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Giorno: "Giovedì", ID_Calendario: 3}), ISBNs: ["12345678901234567"]}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Verify that values professore, ora inizio, ora fine, data inizio, data fine and giorno are inserted.")
        });

        it('Should return an error 401 for no privileges', async() => {
            const serverResponse = await request(app).put('/create/bookForLesson').send(new proto.BooksForLesson({email_executor: "", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "professorNotExisstigd", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3}), ISBNs: ["12345678901234567"]}).toObject());
    
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for adding a book to a lesson.")
        });

        it('Should return success 200 for adding the book', async() => {
            const serverResponse = await request(app).put('/create/bookForLesson').send(new proto.BooksForLesson({email_executor: "admin", lesson: lesson, ISBNs: ["12345678901234567", "3456789"]}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Books successfully added for the lesson")
        });
    });
});



describe('Testing utility route', function() {
    describe('Testing get informations of professor and student', function() {
        it('getting professor informations', async() => {
            const serverResponse = await request(app).get('/utility/getProfessorInformations').query({email: "admin", year: "1000/1001"})
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('getting student informations', async() => {
            const serverResponse = await request(app).get('/utility/getStudentInformations').query({email: "admin", year: "1000/1001"})
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('get all the lessons of a student in a year', async() => {
            const serverResponse = await request(app).get('/utility/lessons/Student').query({email: "admin", year: "1000/1001"})
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });
        it('get all the lessons of a professor in a year', async() => {
            const serverResponse = await request(app).get('/utility/lessons/Professor').query({email: "admin", year: "1000/1001"})
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('get all books for a lesson', async() => {
            const serverResponse = await request(app).post('/utility/booksforLesson').send(lesson.toObject())
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('get all the subjects', async() => {
            const serverResponse = await request(app).get('/utility/getAllSubjects')
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('get all the lessons of a calendar', async() => {
            const serverResponse = await request(app).get('/utility/lessons').query({classe: "5C", year: "1000/1001", istitutoNome: "Istituto 1", istitutoCitta: "Città 1"})
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });
    });
});




describe('Testing delete route', function() {
    describe('Testing deletion of a book', function() {
        it('cannot remove a book because of no ISBN', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BooksForLesson({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "11:30", Ora_fine: "12:30", Giorno: "Giovedì", ID_Calendario: 3})}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("No ISBNs passed")
        });

        it('cannot remove a book because it does not have privileges', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BooksForLesson({email_executor: "somebodywhocantdoit", ISBNs: ["dfdffdfgfg"]}).toObject())
            expect(serverResponse.statusCode).toBe(401)
        });

        it('cannot remove a book because of wrong syntax', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BooksForLesson({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "", Ora_inizio: "11:30", Ora_fine: "12:30", Giorno: "Giovedì", ID_Calendario: 3}), ISBNs: ["fsjdjbgidsfgsdu"]}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Verify that values professore, ora inizio, ora fine, data inizio, data fine and giorno are inserted.")
        });

        it('delete a book', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BooksForLesson({email_executor: "admin", lesson: lesson, ISBNs:["12345678901234567"]}).toObject())
            expect(serverResponse.statusCode).toBe(200)
        });
    });

    describe('Testing deletion of lesson', function() {
        it('cannot remove a lesson because it does not have privileges', async() => {
            const serverResponse = await request(app).delete('/remove/lesson').send(new proto.LessonActions({email_executor: "somebodywhocantdoit"}).toObject())
            expect(serverResponse.statusCode).toBe(401)
        });

        it('cannot remove a lesson because of wrong syntax', async() => {
            const serverResponse = await request(app).delete('/remove/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "", Ora_inizio: "11:30", Ora_fine: "12:30", Giorno: "Giovedì", ID_Calendario: 3})}).toObject())
            expect(serverResponse.statusCode).toBe(400)
        });

        it('delete a lesson', async() => {
            const serverResponse = await request(app).delete('/remove/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: lesson}).toObject())
            expect(serverResponse.statusCode).toBe(200)
        });
    });

    describe('Testing deletion of all professor lessons', function() {
        it('cannot remove a lesson because of wrong syntax', async() => {
            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/everywhere').query({email_executor: "admin"})
            expect(serverResponse.statusCode).toBe(400)
        });

        it('cannot remove a lesson because of no privileges', async() => {
            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/everywhere').query({email_executor: "sdfvdsv", professor: "admin"})
            expect(serverResponse.statusCode).toBe(401)
        });

        it('delete all lessons', async() => {
            await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "DeleteAllOfProfessorEverywhere1", Materia: 1, Professore: "admin", Ora_inizio: "1:30", Ora_fine: "2:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());
            await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "DeleteAllOfProfessorEverywhere2", Materia: 1, Professore: "admin", Ora_inizio: "5:30", Ora_fine: "9:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());

            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/everywhere').query({email_executor: "admin", professor: "admin"})
            expect(serverResponse.statusCode).toBe(200)
        });
    });

    describe('Testing deletion lesson of professor in a calendar, passed with IDs', function() {
        it('cannot remove a lesson because of no privileges', async() => {
            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/calendar/ID').send(new proto.DeleteLessonsOfProfessor({email_executor: "fvfdvd"}).toObject())
            expect(serverResponse.statusCode).toBe(401)
        });

        it('delete a lesson', async() => {
            await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "DeleteLessonsWithCalendarID1", Materia: 1, Professore: "admin", Ora_inizio: "1:30", Ora_fine: "2:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());
            await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "DeleteLessonsWithCalendarID2", Materia: 1, Professore: "admin", Ora_inizio: "5:30", Ora_fine: "9:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());

            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/calendar/ID').send(new proto.DeleteLessonsOfProfessor({email_executor: "admin", professor: "admin", CalendarID: new proto.CalendarID({anno: "1000/1001", istituto: 1, classe: "5C"})}).toObject())
            expect(serverResponse.statusCode).toBe(200)
        });
    });

    describe('Testing deletion lesson of professor in a calendar, passed with names', function() {
        it('cannot remove a lesson because of no privileges', async() => {
            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/calendar/reference').send(new proto.DeleteLessonsOfProfessor({email_executor: "fvfdvd"}).toObject())
            expect(serverResponse.statusCode).toBe(401)
        });

        it('delete a lesson', async() => {
            await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "DeleteLessonsWithCalendarReference1", Materia: 1, Professore: "admin", Ora_inizio: "1:30", Ora_fine: "2:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());
            await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "DeleteLessonsWithCalendarReference2", Materia: 1, Professore: "admin", Ora_inizio: "5:30", Ora_fine: "9:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})}).toObject());

            const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/calendar/reference').send(new proto.DeleteLessonsOfProfessor({email_executor: "admin", professor: "admin", CalendarExplicit: new proto.CalendarExplicit({anno: "1000/1001", nomeIstituto: "Istituto 1", nomeCitta: "Città 1", classe: "5C"})}).toObject())
            expect(serverResponse.statusCode).toBe(200)
        });
    });
});



describe('Testing modify route', function() {
    const myLesson = new proto.Lesson({Nome_lezione: "BasicLessonOfModifyRouteTests", Materia: 1, Professore: "admin", Ora_inizio: "5:00", Ora_fine: "7:00", Data_Inizio:'7000-1-1', Data_Fine:'9500-1-1', Giorno: "Lunedì", ID_Calendario: 3})
    const myLesson2 = new proto.Lesson({Nome_lezione: "BasicLessonOfModifyRouteTests", Materia: 1, Professore: "admin", Ora_inizio: "8:00", Ora_fine: "12:00", Data_Inizio:'7000-1-1', Data_Fine:'9500-1-1', Giorno: "Lunedì", ID_Calendario: 3})
    
    describe('Testing creating a lesson', function() {
        it('Should return success 200 for adding a lesson', async() => {
            var serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: myLesson}).toObject());
            serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: myLesson2}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
        });
    });

    describe('Testing modify methods', function() {
        it('Should return 200 for changing lesson ending date', async() => {
            const serverResponse = await request(app).post('/modify/lessonTimePeriod').send(new proto.ChangeLessonPeriodDate({email_executor: "admin", lesson: myLesson2, nuovaInizioData: '8000-01-01', nuovaFineData: '9000-1-1'}).toObject());
            expect(serverResponse.statusCode).toBe(200)
        });

        it('Should return 200 for changing books to a lesson', async() => {
            const serverResponse = await request(app).post('/modify/bookForTimePeriod').send(new proto.ChangeLessonBookPeriodDate({email_executor: "admin", lesson: myLesson, ISBN: ["0542","9537"], nuovaInizioData: '8200-1-1', nuovaFineData: '8300-1-1'}).toObject());
            console.log(serverResponse.body)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('Should return 200 for setting a lesson as absence', async() => {
            const serverResponse = await request(app).post('/modify/lessonAbsense').send(new proto.ChangeLessonPeriodDate({email_executor: "admin", lesson: myLesson, nuovaInizioData: '8400-1-1', nuovaFineData: '8450-1-1'}).toObject());
            console.log(serverResponse.body.message)
            expect(serverResponse.statusCode).toBe(200)
        });

        it('Should return 200 for changing the lesson day', async() => {
            const serverResponse = await request(app).post('/modify/dayOfLesson').send(new proto.ChangeLessonDay({email_executor: "admin", lesson: myLesson, nuovaInizioData: '8500-1-1', nuovaFineData: '8550-1-1', nuovoGiorno: "Venerdì"}).toObject());
            console.log(serverResponse.body.message)
            expect(serverResponse.statusCode).toBe(200)
            
        });

        it('Should return 200 for changing the lesson hours', async() => {
            const serverResponse = await request(app).post('/modify/hoursOfLesson').send(new proto.ChangeLessonHours({email_executor: "admin", lesson: myLesson, nuovaInizioData: '8600-1-1', nuovaFineData: '8650-1-1', nuovaOraInizio: "15:30", nuovaOraFine: "17:20"}).toObject());
            console.log(serverResponse.body.message)
            expect(serverResponse.statusCode).toBe(200)
            
        });
    })

    it('delete all lessons created', async() => {
        const serverResponse = await request(app).delete('/remove/lessonsOfProfessor/everywhere').query({email_executor: "admin", professor: "admin"})
        expect(serverResponse.statusCode).toBe(200)
    });
});
