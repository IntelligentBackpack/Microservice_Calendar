import request from 'supertest';
import { Router } from 'express';

import * as queryAsk from '../queries';
import * as protoCalendar from '../generated/calendar'
import * as protoAccess from '../generated/access'
import proto = protoCalendar.calendar
import protoAccs = protoAccess.access

const router = Router();
export default router;

const AccessMicroserviceURL:string = "https://accessmicroservice.azurewebsites.net"

router.get('/getProfessorInformations', async (req, res) => {
    if(req.query.email == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify an email."}).toObject())
        return;
    }

    const classes = await queryAsk.get_Classes_OfProfessor(req.query.email.toString());
    const subjects = await queryAsk.get_Subjects_OfProfessor(req.query.email.toString());

    const institutes = await queryAsk.get_Institutes_OfProfessor(req.query.email.toString())
    var institutesName: string[] = []
    for(var val of institutes) {
        const serverResponse = await request(AccessMicroserviceURL).get('/utility/get_istituto').query({id: val})
        institutesName.push(serverResponse.body.IstitutoNome+" / "+serverResponse.body.IstitutoCitta)
    }
    
    res.status(200).send(new proto.UserInformations({email_user: req.query.email.toString(), classes: classes, subjects: subjects, insitutes: institutesName}).toObject())
});


router.get('/getStudentInformations', async (req, res) => {
    if(req.query.email == undefined || req.query.year == undefined ) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify an email and an year field."}).toObject())
        return;
    }
    var serverResponse = await request(AccessMicroserviceURL).get('/utility/emailExists').query({ email: req.query.email.toString()});
    if(serverResponse.statusCode != 200) {
        res.status(400).send(new proto.BasicMessage({message: "The student specified does not exists"}).toObject())
        return;
    }
    const classe = serverResponse.body.classe;
    const istitutoNameAndCitta = serverResponse.body.istituto.IstitutoNome+" / "+serverResponse.body.istituto.IstitutoCitta

    const istitutiList = await (await request(AccessMicroserviceURL).get('/utility/get_istituti')).body.istituti
    var istitutoID = -1;
    //need to identify which istitute is called and have the same city as student has
    for(var istituto of istitutiList) {
        if((istituto.IstitutoNome+" / "+istituto.IstitutoCitta) === istitutoNameAndCitta) {
            istitutoID = istituto.ID
            break;
        }
    }
    const calendarID = await queryAsk.get_Calendar_ID(req.query.year.toString(), istitutoID, classe)
    const materie = await queryAsk.get_Materie_OfStudent(calendarID);
    res.status(200).send(new proto.UserInformations({email_user: req.query.email.toString(), classes: classe, subjects: materie, insitutes: [istitutoNameAndCitta]}).toObject())

});