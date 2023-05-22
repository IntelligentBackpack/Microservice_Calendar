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


router.delete('/lesson', async (req: {body: proto.LessonActions}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting a lesson."}).toObject())
        return;
    }

	const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body.lesson)

	if(!Lesson.isAssigned_WithDate(lesson)) {
        res.status(400).send(new proto.BasicMessage({message: "Verify that values professore, ora inizio, ora fine, data inizio, data fine and giorno are inserted."}).toObject())
        return;
	}

	if(await queryAsk.delete_Lesson(lesson)) {
        res.status(200).send(new proto.BasicMessage({message: "Lesson deleted successfully"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});

router.delete('/bookForLesson', async (req: {body: proto.BooksForLesson}, res) => {
    if(req.body.ISBNs.length == 0 || req.body.ISBNs == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "No ISBNs passed"}).toObject())
        return;
	}

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_LOW').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for removing a book of a lesson."}).toObject())
        return;
    }

	const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body.lesson)
	if(!Lesson.isAssigned_WithDate(lesson)) {
        res.status(400).send(new proto.BasicMessage({message: "Verify that values professore, ora inizio, ora fine, data inizio, data fine and giorno are inserted."}).toObject())
        return;
	}

	const lessonID: number = await queryAsk.get_LessonID_WithDate(lesson)

	if(await queryAsk.delete_BooksForLesson(lessonID, req.body.ISBNs)) {
		res.status(200).send(new proto.BasicMessage({message: "Book successfully removed from the lesson"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});

router.delete('/lessonsOfProfessor/everywhere', async (req, res) => {
    if(req.query.professor == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify a professor."}).toObject())
        return;
    }

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.query.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting a lesson."}).toObject())
        return;
    }

	if(await queryAsk.delete_Lessons_OfProfessor_Everywhere(req.query.professor.toString())) {
        res.status(200).send(new proto.BasicMessage({message: "Lessons deleted successfully"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});

router.delete('/lessonsOfProfessor/calendar/ID', async (req: {body: proto.DeleteLessonsOfProfessor}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting a lesson."}).toObject())
        return;
    }

    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarID.anno, req.body.CalendarID.istituto, req.body.CalendarID.classe)

	if(await queryAsk.delete_Lessons_OfProfessor_Calendar(req.body.professor, calendarID)) {
        res.status(200).send(new proto.BasicMessage({message: "Lessons deleted successfully"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});

router.delete('/lessonsOfProfessor/calendar/reference', async (req: {body: proto.DeleteLessonsOfProfessor}, res) => {
    if(req.body.professor == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify a professor."}).toObject())
        return;
    }

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting a lesson."}).toObject())
        return;
    }

    var serverResponse2 = await request(AccessMicroserviceURL).get('/utility/get_istitutoID').query({ istitutoNome: req.body.CalendarExplicit.nomeIstituto, istitutoCitta: req.body.CalendarExplicit.nomeCitta});
    const calendarID = await queryAsk.get_Calendar_ID(req.body.CalendarExplicit.anno, serverResponse2.body.message, req.body.CalendarExplicit.classe)
	if(await queryAsk.delete_Lessons_OfProfessor_Calendar(req.body.professor, calendarID)) {
        res.status(200).send(new proto.BasicMessage({message: "Lessons deleted successfully"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});