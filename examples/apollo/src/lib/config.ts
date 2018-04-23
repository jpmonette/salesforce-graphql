require('dotenv').config();

export const {
  SALESFORCE_USERNAME,
  SALESFORCE_PASSWORD,
  JWT_SECRET,
  CALLBACK_URL,
  CLIENT_ID,
  CLIENT_SECRET,
} = process.env;

export const cookieOptions = {
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000,
};

export const strategyOptions = {
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  scope: ['id', 'chatter_api', 'api'],
  callbackURL: CALLBACK_URL,
};
