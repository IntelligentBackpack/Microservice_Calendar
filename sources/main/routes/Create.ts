import { Router } from 'express';

import * as queryAsk from '../queries';
const router = Router();
export default router;


//this route manage the login a user
router.get('', async (req: {body: string}, res) => {
	//res.status(401).send(new proto.X({ Y: "STILL NEED TO BE DEFINED" }).toObject())
});

