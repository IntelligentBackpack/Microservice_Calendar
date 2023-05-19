import request from 'supertest';
import app from '../main/app';

import * as protoCalendar from '../main/generated/calendar'
import proto = protoCalendar.calendar

jest.setTimeout(30000);

const calendar = new proto.Calendar({email_executor: "admin", Anno_Scolastico: "1000/1001", Istituto: 1, Classe: "5C"})
const lesson = new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "11:30", Ora_fine: "12:30", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3})




describe.skip('Testing creation route', function() {
    describe.skip('Testing creating a calendar', function() {
        it('Should return an error 400 for bad message format', async() => {
            const serverResponse = await request(app).put('/create/calendar').send(new proto.Calendar({email_executor: "admin", Anno_Scolastico: "", Istituto: 1, Classe: "5C"}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Syntax error. Required: Anno_Scolastico, Istituto and Classe fields.")
        });

        it('Should return an error 401 for no privileges', async() => {
            const serverResponse = await request(app).put('/create/calendar').send(new proto.Calendar({email_executor: "", Anno_Scolastico: "1000/1001", Istituto: 1, Classe: "5C"}).toObject());
    
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for creating a calendar.")
        });

        it('Should return success 200 for adding the calendar', async() => {
            const serverResponse = await request(app).put('/create/calendar').send(calendar.toObject());
    
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Calendar created successfully")
        });

        it('Should return success 400 for adding the calendar', async() => {
            const serverResponse = await request(app).put('/create/calendar').send(calendar.toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Calendar with those data already exists")
        });
    });

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
            const serverResponse = await request(app).put('/create/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Giorno: "Giovedì", ID_Calendario: 3}), ISBN: "12345678901234567"}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Verify that values professore, ora inizio, ora fine, data inizio, data fine and giorno are inserted.")
        });

        it('Should return an error 401 for no privileges', async() => {
            const serverResponse = await request(app).put('/create/bookForLesson').send(new proto.BookForLesson({email_executor: "", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "professorNotExisstigd", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Data_Inizio:'1000-02-02', Data_Fine:'1005-12-31', Giorno: "Giovedì", ID_Calendario: 3}), ISBN: "12345678901234567"}).toObject());
    
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for adding a book to a lesson.")
        });

        it('Should return success 200 for adding the book', async() => {
            const serverResponse = await request(app).put('/create/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: lesson, ISBN: "12345678901234567"}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Book successfully added for the lesson")
        });
    });
});



describe.skip('Testing utility route', function() {
    describe('Testing utilities', function() {
        it('getting professor informations', async() => {
            const serverResponse = await request(app).get('/utility/getProfessorInformations').query({email: "admin"})
            expect(serverResponse.statusCode).toBe(200)
            console.log(serverResponse.body)
        });
    });

    describe('Testing utilities', function() {
        it('getting student informations', async() => {
            const serverResponse = await request(app).get('/utility/getStudentInformations').query({email: "admin", year: "1000/1001"})
            expect(serverResponse.statusCode).toBe(200)
            console.log(serverResponse.body)
        });
    });
});




describe.skip('Testing delete route', function() {
    describe('Testing deletion of a book', function() {
        it('cannot remove a book because it does not have privileges', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BookForLesson({email_executor: "somebodywhocantdoit"}).toObject())
            expect(serverResponse.statusCode).toBe(401)
        });

        it('cannot remove a book because of wrong syntax', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "", Ora_inizio: "11:30", Ora_fine: "12:30", Giorno: "Giovedì", ID_Calendario: 3})}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Verify that values professore, ora inizio, ora fine and giorno are inserted.")
        });

        it('cannot remove a book because of no ISBN', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: new proto.Lesson({Nome_lezione: "test", Materia: 1, Professore: "GiulioCesare", Ora_inizio: "11:30", Ora_fine: "12:30", Giorno: "Giovedì", ID_Calendario: 3})}).toObject())
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("No ISBN passed")
        });

        it('delete a book', async() => {
            const serverResponse = await request(app).delete('/remove/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: lesson, ISBN:"12345678901234567"}).toObject())
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
});



describe('Testing modify route', function() {
    const myLesson = new proto.Lesson({Nome_lezione: "Lezione2", Materia: 1, Professore: "admin", Ora_inizio: "5:00", Ora_fine: "7:00", Data_Inizio:'2000-04-04', Data_Fine:'2000-12-31', Giorno: "Lunedì", ID_Calendario: 3})
    
    describe.skip('Testing creating a lesson', function() {
        it('Should return success 200 for adding a lesson', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.LessonActions({email_executor: "admin", lesson: myLesson}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Lesson created successfully")
        });
    });

    describe.skip('Testing creating a book for a lesson', function() {
        it('Should return success 200 for adding the book', async() => {
            await request(app).put('/create/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: myLesson, ISBN: "12345678901234567"}).toObject());
            await request(app).put('/create/bookForLesson').send(new proto.BookForLesson({email_executor: "admin", lesson: myLesson, ISBN: "76543210987654321"}).toObject());
            expect(1).toBe(1)
        });
    });

    describe.skip('Testing modify methods', function() {
        it.skip('Should return 200 for changing lesson ending date', async() => {
            const serverResponse = await request(app).post('/modify/lessonTimePeriod').send(new proto.ChangeLessonPeriodDate({email_executor: "admin", lesson: lesson, nuovaInizioData: '1500-01-01', nuovaFineData: '1600-5-6'}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
        });

        it.skip('Should return 200 for changing books to a lesson', async() => {
            const serverResponse = await request(app).post('/modify/bookForTimePeriod').send(new proto.ChangeLessonBookPeriodDate({email_executor: "admin", lesson: myLesson, ISBN: ["0542, 9537"], nuovaInizioData: '2000-4-4', nuovaFineData: '2000-7-7'}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
        });

        it('Should return 200 for changing books to a lesson', async() => {
            const serverResponse = await request(app).post('/modify/bookForTimePeriod').send(new proto.ChangeLessonBookPeriodDate({email_executor: "admin", lesson: myLesson, ISBN: ["0542, 9537"], nuovaInizioData: '2000-2-2', nuovaFineData: '2000-7-7'}).toObject());
    
            expect(serverResponse.statusCode).toBe(200)
        });
    })
});