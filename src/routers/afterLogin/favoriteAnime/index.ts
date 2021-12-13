import { Router } from 'express';
import getFavoriteAnime from './handlers/getFavoriteAnime';
import addFavoriteAnime from './handlers/addFavoriteAnime';
import deleteFavoriteAnime from './handlers/deleteFavoriteAnime';

const router = Router();

router.get('/', getFavoriteAnime)
router.post('/add/:id', addFavoriteAnime);
router.delete('/delete/:id', deleteFavoriteAnime)

export default router;
