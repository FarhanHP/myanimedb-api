import { Router } from 'express';
import addAnimeScoreHandler from './handlers/addAnimeScore';
import updateAnimeScoreHandler from './handlers/updateAnimeScore';

const router = Router();

router.post('/add/:id', addAnimeScoreHandler);
router.put('/update/:id', updateAnimeScoreHandler);

export default router;
