import request from 'supertest';
import app from '../main/app';


jest.setTimeout(20000);



describe('Testing register routing', function() {
    it('Should return an error 400 for bad message format', async() => {

        const serverResponse = await request(app).put('/register/').send();

        expect(serverResponse.statusCode).toBe(400)
        expect(serverResponse.body.message).toBe("Message wrong formatted. Require Email, Password, Nome, Cognome fields.")
    });
});


