import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
const bodyParser = require('body-parser');

dotenv.config();

const app: Express = express();
app.use(bodyParser.json());

app.get('/', async (req: Request, res: Response) => {
  	res.send('Access control microservice');
});

import loginRouter from './routes/Create';
app.use('/login', loginRouter)

export = app;