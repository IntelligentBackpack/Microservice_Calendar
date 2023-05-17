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


router.delete('/bookForLesson', async (req: {body: proto.BookForLesson}, res) => {
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

    if(req.body.ISBN == "" || req.body.ISBN == undefined) {
        res.status(400).send(new proto.BasicMessage({message: "No ISBN passed"}).toObject())
        return;
	}

	const lessonID: number = await queryAsk.get_LessonID_WithDate(lesson)

	if(await queryAsk.delete_BookForLesson(lessonID, req.body.ISBN)) {
		res.status(200).send(new proto.BasicMessage({message: "Book successfully removed from the lesson"}).toObject())
        return;
	}

	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});