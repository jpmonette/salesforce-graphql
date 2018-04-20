import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cookieSession from 'cookie-session';
import * as DataLoader from 'dataloader';
import * as express from 'express';
import { makeExecutableSchema } from 'graphql-tools';
import * as jsforce from 'jsforce';
import * as passport from 'passport';
import { Strategy } from 'passport-forcedotcom';

import { cookieOptions, strategyOptions } from './lib/config';
import typeDefs from './lib/typeDefs';
import resolvers from './resolvers';

const app = express();

passport.use(new Strategy(strategyOptions, (token, _1, _2, done) => done(null, token.params)));
app.use(cookieParser());
app.use(cookieSession(cookieOptions));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((token, done) => done(null, token));
passport.deserializeUser((token, done) => done(null, token));

app.get('/auth/salesforce', passport.authenticate('forcedotcom'));

app.get(
  '/services/oauth2/callback',
  passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  (req, res) => res.redirect('/graphiql')
);

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

const executeQuery = ({ access_token, instance_url }, query) =>
  new jsforce.Connection({
    version: '42.0',
    accessToken: access_token,
    instanceUrl: instance_url,
  })
    .query(query)
    .then(response => response.records);

const insert = ({ access_token, instance_url }, sobjectName, data) =>
  new jsforce.Connection({
    version: '42.0',
    accessToken: access_token,
    instanceUrl: instance_url,
  })
    .sobject(sobjectName)
    .create(data);

app.use('/graphql', bodyParser.json(), (req: any, res, next) => {
  const queryLoader = new DataLoader(keys =>
    Promise.all(keys.map(query => executeQuery(req.user, query)))
  );

  const db = { insert: (sobjectName, data) => insert(req.user, sobjectName, data) };

  return graphqlExpress({
    schema: makeExecutableSchema({ typeDefs: typeDefs, resolvers: resolvers as any }),
    context: { user: req.user, loaders: { query: queryLoader }, db },
  })(req, res, next);
});

app.listen(3000, () => console.log('Now browse to localhost:3000/graphiql'));
