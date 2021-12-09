import { Router } from 'express';
import { User } from '../../interfaces';

const router = Router();

router.get('/profile', (req, res, next) => {
  try {
    const loginUser: User = res.locals.loginUser;
    if(loginUser) {
      const { email, fullname, imageUri } = loginUser;

      res.status(200).send({
        email, fullname, imageUri,
      });
    }
  } catch(err) {
    console.log(err);
    res.status(500).send();
  }

  next();
})

export default router;
