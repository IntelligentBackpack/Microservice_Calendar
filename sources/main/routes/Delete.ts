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


router.delete('/lesson', async (req: {body: proto.Lesson}, res) => {
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_HIGH').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for deleting a lesson."}).toObject())
        return;
    }

	const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body)

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
	if(!Lesson.isAssigned(lesson)) {
        res.status(400).send(new proto.BasicMessage({message: "Verify that all the values of the lessons are inserted."}).toObject())
        return;
	}

	const lessonID: number = await queryAsk.get_LessonID(Lesson.assignVals_JSON(req.body.lesson))

	if(await queryAsk.create_BookForLesson(lessonID, req.body.ISBN)) {
		res.status(200).send(new proto.BasicMessage({message: "Book successfully added for the lesson"}).toObject())
        return;
	}


	res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
});