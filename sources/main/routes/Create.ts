import request from 'supertest';
import { Router } from 'express';

import * as queryAsk from '../queries';
import * as protoCalendar from '../generated/calendar'
import * as protoAccess from '../generated/access'
import proto = protoCalendar.calendar
import protoAccs = protoAccess.access
import * as Lesson from '../interfaces/Lesson';

const router = Router();
export default router;

const AccessMicroserviceURL:string = "https://accessmicroservice.azurewebsites.net"



router.put('/calendar', async (req: {body: proto.Calendar}, res) => {
	if(req.body.Anno_Scolastico == "" || req.body.Istituto == 0 || req.body.Classe == "") {
		res.status(400).send(new proto.BasicMessage({ message: "Syntax error. Required: Anno_Scolastico, Istituto and Classe fields." }).toObject())
		return;
	}

	if(await queryAsk.verify_CalendarExists_DATA(req.body.Anno_Scolastico, req.body.Istituto, req.body.Classe)) {
		res.status(400).send(new proto.BasicMessage({ message: "Calendar with those data already exists" }).toObject())
		return;
	}

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for creating a calendar."}).toObject())
        return;
    }

	if(await queryAsk.create_Calendar(req.body.Anno_Scolastico, req.body.Istituto, req.body.Classe)) {
		res.status(200).send(new proto.BasicMessage({ message: "Calendar created successfully" }).toObject())
		return;
	}
	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});

router.put('/lesson', async (req: {body: proto.LessonActions}, res) => {
	const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body.lesson)
	if(!Lesson.isAssigned(lesson)) {
        res.status(400).send(new proto.BasicMessage({message: "Verify that all the values of the lessons are inserted."}).toObject())
        return;
	}

	if(!await queryAsk.verify_CalendarExists_ID(lesson.ID_Calendario)) {
        res.status(400).send(new proto.BasicMessage({message: "The ID of the calendar passed does not exists."}).toObject())
        return;
	}

	if(!await queryAsk.verify_MateriaExists(lesson.Materia)) {
        res.status(400).send(new proto.BasicMessage({message: "The ID of the materia passed does not exists."}).toObject())
        return;
	}

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for creating a lesson."}).toObject())
        return;
    }

	if(await queryAsk.create_Lesson(lesson)) {
        res.status(200).send(new proto.BasicMessage({message: "Lesson created successfully"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});

router.put('/bookForLesson', async (req: {body: proto.BookForLesson}, res) => {
	const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body.lesson)
	if(lesson.Professore == "" || lesson.Ora_inizio == "" || lesson.Ora_fine == "" || lesson.Giorno == "") {
        res.status(400).send(new proto.BasicMessage({message: "Verify that values professore, ora inizio, ora fine and giorno are inserted."}).toObject())
        return;
	}

	const lessonID: number = await queryAsk.get_LessonID(lesson)
	console.log("lesson id found: " + lessonID)
	const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_LOW').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for adding a book to a lesson."}).toObject())
        return;
    }

	if(await queryAsk.create_BookForLesson(lessonID, req.body.ISBN)) {
		res.status(200).send(new proto.BasicMessage({message: "Book successfully added for the lesson"}).toObject())
        return;
	}


	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});