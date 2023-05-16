import request from 'supertest';
import app from '../main/app';

import * as protoCalendar from '../main/generated/calendar'
import proto = protoCalendar.calendar

jest.setTimeout(30000);

const calendar = new proto.Calendar({email_executor: "admin", Anno_Scolastico: "1000/1001", Istituto: 1, Classe: "5C"})
const lesson = new proto.Lesson({email_executor: "admin", Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "10:30", Ora_fine: "11:30", Giorno: "Giovedì", ID_Calendario: 3})

describe('Testing creation route', function() {
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

    describe.skip('Testing creating a lesson', function() {
        it('Should return an error 400 for bad message format', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.Lesson({email_executor: "admin", Nome_lezione: "test", Materia: 1, Professore: "", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Giorno: "Giovedì", ID_Calendario: 3}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("Verify that all the values of the lessons are inserted.")
        });

        it('Should return an error 401 for no privileges', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.Lesson({email_executor: "", Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Giorno: "Giovedì", ID_Calendario: 3}).toObject());
    
            expect(serverResponse.statusCode).toBe(401)
            expect(serverResponse.body.message).toBe("No privileges for creating a lesson.")
        });

        it('Should return an error 400 for no subject', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.Lesson({email_executor: "", Nome_lezione: "test", Materia: 500000, Professore: "admin", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Giorno: "Giovedì", ID_Calendario: 3}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("The ID of the materia passed does not exists.")
        });
        
        it('Should return an error 400 for no calendar', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(new proto.Lesson({email_executor: "", Nome_lezione: "test", Materia: 1, Professore: "admin", Ora_inizio: "10:30:00", Ora_fine: "11:30:00", Giorno: "Giovedì", ID_Calendario: 30000000}).toObject());
    
            expect(serverResponse.statusCode).toBe(400)
            expect(serverResponse.body.message).toBe("The ID of the calendar passed does not exists.")
        });

        it('Should return success 200 for adding the calendar', async() => {
            const serverResponse = await request(app).put('/create/lesson').send(lesson.toObject());
    
            expect(serverResponse.statusCode).toBe(200)
            expect(serverResponse.body.message).toBe("Lesson created successfully")
        });
    });
});









describe('Testing utility route', function() {
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


