import request from 'supertest';
import { Router } from 'express';

import * as queryAsk from '../queries';
import * as protoCalendar from '../generated/calendar'
import * as protoAccess from '../generated/access'
import proto = protoCalendar.calendar
import * as Lesson from '../interfaces/Lesson';

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
    
    const calendarID = await queryAsk.get_Calendar_ID(req.query.year.toString(), +serverResponse.body.istituto.ID, classe)
    const materie = await queryAsk.get_Materie_OfStudent(calendarID);
    res.status(200).send(new proto.UserInformations({email_user: req.query.email.toString(), classes: classe, subjects: materie}).toObject())

});

router.get('/lessons/today/ID', async (req: {body: proto.LessonInDate}, res) => {
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarID.anno, req.body.CalendarID.istituto, req.body.CalendarID.classe)

    var lessons: proto.Lesson[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_Lessons_InDateWithDay(calendarID, req.body.date, req.body.giorno)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
        lessons.push(Lesson.generate_protoLesson(allLessonsOfDate[i]))
    }

    res.status(200).send(new proto.Lessons({Lessons: lessons}).toObject())

});

router.get('/lessons/today/Reference', async (req: {body: proto.LessonInDate}, res) => {
    var serverResponse = await request(AccessMicroserviceURL).get('/utility/get_istitutoID').query({ istitutoNome: req.body.CalendarExplicit.nomeIstituto, istitutoCitta: req.body.CalendarExplicit.nomeCitta});
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarExplicit.anno, serverResponse.body.message, req.body.CalendarExplicit.classe)
    var lessons: proto.Lesson[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_Lessons_InDateWithDay(calendarID, req.body.date, req.body.giorno)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
        lessons.push(Lesson.generate_protoLesson(allLessonsOfDate[i]))
    }

    res.status(200).send(new proto.Lessons({Lessons: lessons}).toObject())

});

router.get('/lessons/booksForDate/ID', async (req: {body: proto.LessonInDate}, res) => {
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarID.anno, req.body.CalendarID.istituto, req.body.CalendarID.classe)

    var ISBNs: string[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_Books_InDate(calendarID, req.body.date, req.body.giorno)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
       ISBNs.push(allLessonsOfDate[i])
    }

    res.status(200).send(new proto.BasicMessage({message2: ISBNs}).toObject())

});

router.get('/lessons/booksForDate/Reference', async (req: {body: proto.LessonInDate}, res) => {
    var serverResponse = await request(AccessMicroserviceURL).get('/utility/get_istitutoID').query({ istitutoNome: req.body.CalendarExplicit.nomeIstituto, istitutoCitta: req.body.CalendarExplicit.nomeCitta});
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarExplicit.anno, serverResponse.body.message, req.body.CalendarExplicit.classe)
    
    var ISBNs: string[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_Books_InDate(calendarID, req.body.date, req.body.giorno)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
       ISBNs.push(allLessonsOfDate[i])
    }

    res.status(200).send(new proto.BasicMessage({message2: ISBNs}).toObject())

});




router.post('/changeEmail', async (req, res) => {
    if(req.query.oldEmail == undefined || req.query.nuovaEmail == undefined ) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify the old and new email."}).toObject())
        return;
    }

    if(await queryAsk.change_Email(req.query.oldEmail.toString(), req.query.nuovaEmail.toString())) {
        res.status(200).send(new proto.BasicMessage({message: "Email changed successfully"}).toObject())
        return;
    }

    res.status(500).send(new proto.BasicMessage({message: "Internal server error."}).toObject())
});