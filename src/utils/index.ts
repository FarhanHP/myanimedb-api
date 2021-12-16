import { ObjectId } from 'bson';
import { Db } from 'mongodb';
import { Anime, AnimeData } from '../interfaces';
import { getAnimeDataById } from './kitsuApi';

export const animeDataArrToAnimeArr = async (animeDataArr: AnimeData[], db: Db, userId?: ObjectId): Promise<Anime[]> => {
  const animeScoreCollection = db.collection('animeScore');
  const favoriteAnimeCollection = db.collection('favoriteAnime');
  const animeScoreByUserCollection = db.collection('animeScoreByUser');

  const animeIds: string[] = [];

  const animeArr: Anime[] = animeDataArr.map((value) => {
    const anime = animeDataToRawAnime(value)
    animeIds.push(anime.id);

    return anime
  });

  const promisesOutput = {}
  const promises = [
    animeScoreCollection.find({
      animeId: {
        '$in': animeIds,
      }
    }).toArray(),
  ];

  if(userId) {
    promises.push(...[
      animeScoreByUserCollection.find({
        userId,
        animeId: {
          '$in': animeIds,
        }
      }).toArray(),
      favoriteAnimeCollection.find({
        userId,
        animeId: {
          '$in': animeIds,
        }
      }).toArray()
    ])
  }

  const [animeScoresArr, animeScoresByUserArr, favoriteAnimeArr] = await Promise.all(promises);
  
  animeScoresArr.forEach(({ animeId, averageScore, userCount }) => {
    if(!(animeId in promisesOutput)) {
      promisesOutput[animeId] = {}
    }
    const currentObject = promisesOutput[animeId]
    currentObject.score = averageScore;
    currentObject.userCount = userCount;
  });

  animeScoresByUserArr?.forEach(({ animeId, score }) => {
    if(!(animeId in promisesOutput)) {
      promisesOutput[animeId] = {}
    }
    const currentObject = promisesOutput[animeId]
    currentObject.scoreGiven = score;
  });


  favoriteAnimeArr?.forEach(({ animeId }) => {
    if(!(animeId in promisesOutput)) {
      promisesOutput[animeId] = {}
    }
    const currentObject = promisesOutput[animeId]
    currentObject.isFavorite = true;
  });

  if(Object.keys(promisesOutput).length) {
    animeArr.forEach((value, index, array) => {
      const { id } = value;
      if(id in promisesOutput) {
        const currentObject = promisesOutput[id];
        array[index] = { ...value, ...currentObject }
      }
    })
  }

  return animeArr;
}

export const animeDataToAnime = async (animeData: AnimeData, db: Db, userId?: ObjectId): Promise<Anime> => {
  const animeScoreCollection = db.collection('animeScore');
  const favoriteAnimeCollection = db.collection('favoriteAnime');
  const animeScoreByUserCollection = db.collection('animeScoreByUser');

  const anime = animeDataToRawAnime(animeData);
  const animeId = anime.id;
  const promises = [animeScoreCollection.findOne({animeId: animeId})];

  if(userId) {
    promises.push(...[
      favoriteAnimeCollection.findOne({
        userId,
        animeId
      }),
      animeScoreByUserCollection.findOne({
        userId,
        animeId,
      })
    ]);
  };

  const [animeScoreRes, favoriteAnimeRes, animeScoreByUserRes] = await Promise.all(promises);
  
  if(animeScoreRes) {
    const { averageScore, userCount } = animeScoreRes;
    anime.score = averageScore;
    anime.userCount = userCount;
  }

  if(favoriteAnimeRes) {
    anime.isFavorite = true;
  }

  if(animeScoreByUserRes) {
    anime.scoreGiven = animeScoreByUserRes.score;
  }
  
  return anime;
};

export const getAnimeById = async (animeId: string, db: Db, userId?:ObjectId): Promise<Anime> => {
  const animeData = await getAnimeDataById(animeId);
  
  if(animeData) {
    return animeDataToAnime(animeData, db, userId)
  }
};

// return Anime without checking score, scoreGiven, isFavorite, and userCount in database
const animeDataToRawAnime = (animeData: AnimeData): Anime => {
  const { id, attributes } = animeData;
  const { description, titles, posterImage, episodeCount, youtubeVideoId } = attributes;
  
  let title: string = titles.en_jp
  if(!title) {
    const titleValues = Object.values(titles)

    if(titleValues.length > 0) {
      title = titleValues[0] as string
    } else {
      title = ''
    }
  }

  return {
    id,
    title,
    description: description,
    imageUrl: posterImage.small,
    videoUrl: youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : null,
    episodeCount,
    isFavorite: false,
    userCount: 0,
    scoreGiven: -1,
    score: 0,
  };
};

export const updateAnimeScore = async (animeId: string, db: Db): Promise<{
  newAverageScore: number,
  newUserCount: number,
}> => {
  const animeScoreByUserCollection = db.collection('animeScoreByUser');
  const animeScoreCollection = db.collection('animeScore');

  let total = 0;
  const animeScoreByUserArr = await animeScoreByUserCollection.find({animeId}).toArray();
  const count = animeScoreByUserArr.length
  animeScoreByUserArr.forEach(({ score }) =>
    total += score
  );
  const newAverageScore = Math.round((total / count) * 100)/100;
  const now = Date.now();
  
  const res = await animeScoreCollection.updateOne({animeId}, {'$set' : {
    updatedAt: now,
    averageScore: newAverageScore,
    userCount: count,
  }});

  if(res.modifiedCount < 1) {
    await animeScoreCollection.insertOne({
      animeId,
      userCount: count,
      averageScore: newAverageScore,
      createdAt: now,
      updatedAt: now,
    })
  }

  return {
    newAverageScore,
    newUserCount: count,
  };
};

export const isValidScore = (score: number) => {
  return score > 0 && score <= 10;
}

