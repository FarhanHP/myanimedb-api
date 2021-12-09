import { Handler } from 'express';
import { Db } from 'mongodb';
import { User } from '../../../../interfaces';

const handler: Handler = async (req, res, next) => {
  try {
    const loginUser: User = res.locals.loginUser;
    const db: Db = res.locals.db;
    const favoriteAnimeCollection = db.collection('favoriteAnime');
    const { id } = req.params;
    const animeId = req.params.id.toLowerCase();

    if(loginUser && id) {
      await favoriteAnimeCollection.deleteOne({
        userId: loginUser._id,
        animeId,
      });

      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch(err) {
    console.log(err);
    res.status(500).send();
  }

  next();
};

export default handler;
