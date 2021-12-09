import { Router } from 'express';
import userRouter from './userRouter';
import favoriteAnimeRouter from './favoriteAnime';
import animeScoreByUserRouter from './animeScoreByUser';
import { isValidAndDecodeToken } from '../../utils/jwt';

const router = Router();

router.use( async (req, res, next) => {
  try {
    const { logintoken }  = req.headers;
    if(logintoken) {
      const loginUser = await isValidAndDecodeToken(logintoken as string);

      if(loginUser) {
        res.locals.loginUser = loginUser;
        next();
        return;
      }
    }

    res.status(401).send();

  } catch(err) {
    console.log(err);
    res.status(500).send();
  }
  
  next();
});

router.use('/user', userRouter);
router.use('/anime/favorite', favoriteAnimeRouter);
router.use('/anime/score', animeScoreByUserRouter)

export default router;
