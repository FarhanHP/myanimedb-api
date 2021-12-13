import fetch from 'node-fetch';
import { AnimeData } from '../interfaces';

const BASE_URL = 'https://kitsu.io/api/edge/anime'

export const getAnime = (offset: number, limit: number, keyword?: string): Promise<any> => {
  let url = `${BASE_URL}?page[offset]=${offset}&page[limit]=${limit}`;
  
  if(keyword) {
    url += `&filter[text]=${encodeURIComponent(keyword)}`;  
  } else {
    url += '&sort=popularityRank';
  }

  return fetch(url);
};

export const getAnimeDataById = async (animeId: string): Promise<AnimeData> => {
  const res = await fetch(`https://kitsu.io/api/edge/anime/${animeId}`);
  if(res.ok) {
    const animeData: AnimeData = (await res.json()).data;
    return animeData;
  }
}
