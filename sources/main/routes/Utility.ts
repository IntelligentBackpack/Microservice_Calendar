import request from 'supertest';
import { Router } from 'express';

import * as queryAsk from '../queries';
import * as protoCalendar from '../generated/calendar'
import proto = protoCalendar.calendar
import * as Lesson from '../interfaces/Lesson';
import * as Subject from '../interfaces/Subject'

const router = Router();
export default router;

const AccessMicroserviceURL:string = "https://accessmicroservice.azurewebsites.net"

router.get('/getProfessorInformations', async (req, res) => {
    if(req.query.email == undefined || req.query.year == undefined)  {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify an emai and year."}).toObject())
        return;
    }

    var serverResponse = await request(AccessMicroserviceURL).get('/utility/emailExists').query({ email: req.query.email.toString()});
    if(serverResponse.statusCode != 200) {
        res.status(400).send(new proto.BasicMessage({message: "The professor specified does not exists"}).toObject())
        return;
    }

    const classes = await queryAsk.get_Classes_OfProfessor(req.query.email.toString(), req.query.year.toString());
    const subjects = await queryAsk.get_Subjects_OfProfessor(req.query.email.toString(), req.query.year.toString());

    const institutes = await queryAsk.get_Institutes_OfProfessor(req.query.email.toString(), req.query.year.toString())
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

router.post('/lessons/date/ID', async (req: {body: proto.LessonInDate}, res) => {
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarID.anno, req.body.CalendarID.istituto, req.body.CalendarID.classe)

    var lessons: proto.Lesson[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_Lessons_InDateWithDay(calendarID, req.body.date, req.body.giorno)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
        lessons.push(Lesson.generate_protoLesson(allLessonsOfDate[i]))
    }

    res.status(200).send(new proto.Lessons({Lessons: lessons}).toObject())

});

router.post('/lessons/date/Reference', async (req: {body: proto.LessonInDate}, res) => {
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

router.post('/lessons/booksForDate/ID', async (req: {body: proto.LessonInDate}, res) => {
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarID.anno, req.body.CalendarID.istituto, req.body.CalendarID.classe)

    var ISBNs: string[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_Books_InDate(calendarID, req.body.date, req.body.giorno)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
       ISBNs.push(allLessonsOfDate[i])
    }

    res.status(200).send(new proto.BasicMessage({message2: ISBNs}).toObject())

});

router.post('/lessons/booksForDate/Reference', async (req: {body: proto.LessonInDate}, res) => {
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



router.get('/lessons/Student', async (req, res) => {
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

    var lessons: proto.Lesson[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_StudentLessons_InYear(calendarID.toString(), classe, +serverResponse.body.istituto.ID)
    for(var i = 0; i < allLessonsOfDate.length; i++) {
        lessons.push(Lesson.generate_protoLesson(allLessonsOfDate[i]))
    }

    res.status(200).send(new proto.Lessons({Lessons: lessons}).toObject())
});

router.get('/lessons/Professor', async (req, res) => {
    if(req.query.email == undefined || req.query.year == undefined ) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify an email and an year field."}).toObject())
        return;
    }

    var serverResponse = await request(AccessMicroserviceURL).get('/utility/emailExists').query({ email: req.query.email.toString()});
    if(serverResponse.statusCode != 200) {
        res.status(400).send(new proto.BasicMessage({message: "The professor specified does not exists"}).toObject())
        return;
    }
    var lessons: proto.Lesson[] = [];
    //generate all the proto required
    const allLessonsOfDate = await queryAsk.get_ProfessorLessons_InYear(req.query.year.toString(), req.query.email.toString())
    for(var i = 0; i < allLessonsOfDate.length; i++) {
        lessons.push(Lesson.generate_protoLesson(allLessonsOfDate[i]))
    }

    res.status(200).send(new proto.Lessons({Lessons: lessons}).toObject())
});

router.post('/booksforLesson', async (req: {body: proto.Lesson}, res) => {
    const ISBNs: string[] = await queryAsk.get_BooksISBN_OfLesson(Lesson.assignVals_JSON(req.body))
    res.status(200).send(new proto.BasicMessage({message2:ISBNs}).toObject())
});

router.get('/getAllYears', async (req, res) => {
    const years: string[] = await queryAsk.get_AllYears_InCalendar()
    res.status(200).send(new proto.BasicMessage({message2:years}).toObject())
});

router.get('/getAllSubjects', async (req, res) => {
    const materie: Subject.Subject[] = await queryAsk.get_AllMaterie()


    var subjectsDB: proto.Subject[] = [];
    //generate all the proto required
    for(var i = 0; i < materie.length; i++) {
        subjectsDB.push(Subject.generate_protoSubject(materie[i]))
    }

    res.status(200).send(new proto.Subjects({subjects: subjectsDB}).toObject())
});

router.post('/getClass_ByLesson', async (req: {body: proto.Lesson}, res) => {
    const classe: string = await queryAsk.getClass_ByLesson(req.body)
    res.status(200).send(new proto.BasicMessage({message: classe}).toObject())
});

router.get('/lessons', async (req, res) => {
    if(req.query.classe == undefined || req.query.year == undefined || req.query.istitutoNome == undefined || req.query.istitutoCitta == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify an istitute, an year, an istitutoNome and an istitutoCitta field."}).toObject())
        return;
    }

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/get_istitutoID').query({istitutoNome: req.query.istitutoNome, istitutoCitta: req.query.istitutoCitta})
    if(serverResponse.statusCode != 200) {
        res.status(400).send(new proto.BasicMessage({message: "Cannot find the specified institute"}).toObject())
        return;
    }
    const istitutoID = serverResponse.body.message

    const calendarID = await queryAsk.get_Calendar_ID(req.query.year.toString(), +istitutoID, req.query.classe.toString())

    var lessons: proto.Lesson[] = [];
    //generate all the proto required
    const allLessons = await queryAsk.get_AllLessons(calendarID)
    for(var i = 0; i < allLessons.length; i++) {
        lessons.push(Lesson.generate_protoLesson(allLessons[i]))
    }

    res.status(200).send(new proto.Lessons({Lessons: lessons}).toObject())
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