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

