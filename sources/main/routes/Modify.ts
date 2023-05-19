import request from 'supertest';
import { Router, query } from 'express';

import * as queryAsk from '../queries';
import * as Lesson from '../interfaces/Lesson'
import * as protoCalendar from '../generated/calendar'
import * as protoAccess from '../generated/access'
import proto = protoCalendar.calendar

const router = Router();
export default router;

const AccessMicroserviceURL:string = "https://accessmicroservice.azurewebsites.net"

router.post('/lessonTimePeriod', async (req:{body: proto.ChangeLessonPeriodDate}, res) => {
    if(req.body.nuovaFineData == "" || req.body.nuovaInizioData == "") {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify the new starting and ending date."}).toObject())
        return;
    }

    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_LOW').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for adding a book to a lesson."}).toObject())
        return;
    }

    const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body.lesson)
    if(await queryAsk.change_Lezione_DataPeriod(lesson, req.body.nuovaInizioData, req.body.nuovaFineData)) {
        res.status(200).send(new proto.BasicMessage({message: "Lesson dates changed successfully."}).toObject())
        return;
    }

    res.status(400).send(new proto.BasicMessage({message: "Unable to change the date of the lesson"}).toObject())
});

router.post('/bookForTimePeriod', async (req:{body: proto.ChangeLessonBookPeriodDate}, res) => {
    if(req.body.nuovaFineData == "" || req.body.nuovaInizioData == "") {
        res.status(400).send(new proto.BasicMessage({message: "You need to specify the new starting and ending date."}).toObject())
        return;
    }
    const serverResponse = await request(AccessMicroserviceURL).get('/utility/verifyPrivileges_LOW').query({ email: req.body.email_executor});
    if(serverResponse.statusCode != 200) {
        res.status(401).send(new proto.BasicMessage({message: "No privileges for adding a book to a lesson."}).toObject())
        return;
    }

    const lesson: Lesson.Lesson = Lesson.assignVals_JSON(req.body.lesson)
    //controlla che ci sia già una lezione che comprende quel periodo di date. se c'è, aggiungo semplicemente un libro
    const existingLessonID = await queryAsk.get_LessonID_WithDate(Lesson.assignVals_JSON({Nome_lezione: lesson.Nome_lezione, Materia: lesson.Materia, Professore: lesson.Professore,
                                                                    Ora_inizio: lesson.Ora_inizio, Ora_fine: lesson.Ora_fine, Data_Inizio: req.body.nuovaInizioData, Data_Fine: req.body.nuovaFineData, Giorno: lesson.Giorno, ID_Calendario: lesson.ID_Calendario}));
    if(existingLessonID != -1) {
        if(await queryAsk.create_BooksForLesson(existingLessonID, req.body.ISBN)) {
            res.status(200).send(new proto.BasicMessage({message: "Book successfully added for the lesson"}).toObject())
            return;
        }
        res.status(500).send(new proto.BasicMessage({ message: "Internal server error" }).toObject())
        return;
    }

    //se non c'è, devo prendere le lezioni che comprendono il periodo
    //se è presente una lezione all'interno del periodo specificato, do errore perchè le inner lessons non sono gestite
    if(await queryAsk.verify_InnerLesson(lesson, req.body.nuovaInizioData.toString(), req.body.nuovaFineData.toString())) {
        res.status(400).send(new proto.BasicMessage({message: "There is already a lesson contained in the period you specified. Please change or remove it"}).toObject())
        return;
    }

    //ottengo tutte le lezioni che hanno quella data di inizio e fine dentro il loro periodo
    const IDLessons1: number[] = await queryAsk.get_LessonsID_BetweenDate(lesson, req.body.nuovaInizioData.toString())
    const IDLessons2: number[] =  await queryAsk.get_LessonsID_BetweenDate(lesson, req.body.nuovaFineData.toString())

    const IDTotal = IDLessons1.concat(IDLessons2)

    //remove duplicates from array
    const result: number[] = [];
    IDTotal.forEach((item) => {
        if (!result.includes(item)) {
            result.push(item);
        }
    })

    //se la lunghezza è invariata, la lezione è creata iteramente dentro 1 lezione singola
    if(result.length == IDLessons1.length) {
        //se la lunghezza è 1, ho solo 1 lezione nel periodo selezionato.
        const ISBNsOfLessonsToBeChanged: string[] = await queryAsk.get_BooksISBN_OfLesson(lesson)
        //modifico la data e la metto che termina il giorno che inizia quella nuova
        if(!await queryAsk.change_Lezione_DataPeriod(lesson, lesson.Data_Inizio, req.body.nuovaInizioData)) {
            res.status(500).send(new proto.BasicMessage({message: "There was an error while adding the books."}).toObject())
            return;
        }
        

        //creo la nuova lezione intermedia, utilizzando le date passate, con gli ISBN
        const les: Lesson.Lesson = Lesson.assignVals_JSON({Nome_lezione: lesson.Nome_lezione, Materia: lesson.Materia, Professore: lesson.Professore,
                                    Ora_inizio: lesson.Ora_inizio, Ora_fine: lesson.Ora_fine, Data_Inizio: req.body.nuovaInizioData, Data_Fine: req.body.nuovaFineData, Giorno: lesson.Giorno, ID_Calendario: lesson.ID_Calendario})
        const ISBN_ToAdd: string[] = ISBNsOfLessonsToBeChanged.concat(req.body.ISBN)
        await queryAsk.create_Lesson(les)
        const lesID = await queryAsk.get_LessonID_WithDate(les);
        await queryAsk.create_BooksForLesson(lesID, ISBN_ToAdd) //aggiungo tutti gli ISBN


        //creo l'ultima lezione, che sarebbe come la prima lezione, ma con le date finali
        const les2: Lesson.Lesson = Lesson.assignVals_JSON({Nome_lezione: lesson.Nome_lezione, Materia: lesson.Materia, Professore: lesson.Professore,
                    Ora_inizio: lesson.Ora_inizio, Ora_fine: lesson.Ora_fine, Data_Inizio: req.body.nuovaFineData, Data_Fine: lesson.Data_Fine, Giorno: lesson.Giorno, ID_Calendario: lesson.ID_Calendario})
        await queryAsk.create_Lesson(les2)
        const lesID2 = await queryAsk.get_LessonID_WithDate(les2);
        await queryAsk.create_BooksForLesson(lesID2, ISBNsOfLessonsToBeChanged) //aggiungo tutti gli ISBN


        res.status(200).send()
        return;
    }

    //ci si ritrova che la lezione da inserire si trova a cavallo tra 2 lezioni.
    //sposto la 1° lezione
    if(!await queryAsk.change_Lezione_DataPeriod(lesson, lesson.Data_Inizio, req.body.nuovaInizioData)) {
        res.status(500).send(new proto.BasicMessage({message: "There was an error while adding the books."}).toObject())
        return;
    }
    //sposto la 2° lezione
    const lesson2: Lesson.Lesson = await queryAsk.get_Lesson_Information(IDLessons2[0])
    if(!await queryAsk.change_Lezione_DataPeriod(lesson2, req.body.nuovaFineData, lesson2.Data_Fine)) {
        res.status(500).send(new proto.BasicMessage({message: "There was an error while adding the books."}).toObject())
        return;
    }

    //a questo punto devo creare 2 lezioni. la 1° che va da req.body.nuovaInizioData a lesson.Data_Fine, la 2° da lesson.Data_Fine a req.body.nuovaFineData

    const ISBNsOfLessonsToBeChanged: string[] = await queryAsk.get_BooksISBN_OfLesson(lesson)
    const les: Lesson.Lesson = Lesson.assignVals_JSON({Nome_lezione: lesson.Nome_lezione, Materia: lesson.Materia, Professore: lesson.Professore,
                                Ora_inizio: lesson.Ora_inizio, Ora_fine: lesson.Ora_fine, Data_Inizio: req.body.nuovaInizioData, Data_Fine: lesson.Data_Fine, Giorno: lesson.Giorno, ID_Calendario: lesson.ID_Calendario})
    const ISBN_ToAdd: string[] = ISBNsOfLessonsToBeChanged.concat(req.body.ISBN)
    await queryAsk.create_Lesson(les)
    const lesID = await queryAsk.get_LessonID_WithDate(les);
    await queryAsk.create_BooksForLesson(lesID, ISBN_ToAdd) //aggiungo tutti gli ISBN



    const ISBNsOfLessonsToBeChanged2: string[] = await queryAsk.get_BooksISBN_OfLesson(lesson2)
    const les2: Lesson.Lesson = Lesson.assignVals_JSON({Nome_lezione: lesson.Nome_lezione, Materia: lesson.Materia, Professore: lesson.Professore,
                                Ora_inizio: lesson.Ora_inizio, Ora_fine: lesson.Ora_fine, Data_Inizio: lesson.Data_Fine, Data_Fine: req.body.nuovaFineData, Giorno: lesson.Giorno, ID_Calendario: lesson.ID_Calendario})
    const ISBN_ToAdd2: string[] = ISBNsOfLessonsToBeChanged2.concat(req.body.ISBN)
    await queryAsk.create_Lesson(les2)
    const lesID2 = await queryAsk.get_LessonID_WithDate(les);
    await queryAsk.create_BooksForLesson(lesID2, ISBN_ToAdd2) //aggiungo tutti gli ISBN
    return;
});