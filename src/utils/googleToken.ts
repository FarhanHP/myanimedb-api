import fetch from 'node-fetch';
import { DecodedGoogleToken } from '../interfaces';

const decodeToken = (token: string): Promise<any> =>
  fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

export const isValidAndDecodeGoogleToken = async (token: string): Promise<DecodedGoogleToken> => {
  const res = await decodeToken(token);
  if(res.ok) {
    const json: DecodedGoogleToken = await res.json();
    if(json.exp * 1000 > Date.now()) {
      return json;
    }
  }

  return undefined;
}