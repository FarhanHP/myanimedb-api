import { ObjectId } from "bson";

export interface Anime {
  id: string,
  description: string,
  title: string,
  imageUrl: string,
  videoUrl?: string,
  episodeCount?: number,
  score: number,
  userCount: number,
  isFavorite: boolean,
  scoreGiven: number,
};

export interface AnimeData {
  id: string,
  attributes: {
    titles: {
      en_jp: string,
    },
    description: string,
    posterImage: {
      small: string,
    }
    episodeCount?: number,
    youtubeVideoId?:string,
  }
};

export interface DecodedGoogleToken {
  exp: number,
  picture: string,
  email: string,
  name: string,
};

export interface Document {
  _id: ObjectId,
  updatedAt: number,
  createdAt: number,
};

export interface User extends Document {
  email: string,
  imageUri: string,
  fullname: string,
};
