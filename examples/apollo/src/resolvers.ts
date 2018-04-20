import { SOQL } from 'salesforce-queries';

import { accountFields, contactFields } from './lib/fieldLists';

const resolvers = {
  Mutation: {
    createAccount: (input, data, { db }) => db.insert('Account', data),
  },
  Query: {
    Accounts: (parent, { limit }, { loaders }, info) => {
      const query = new SOQL('Account')
        .select(accountFields)
        .limit(limit)
        .build();

      return loaders.query.load(query);
    },
    Account: (parent, { Id }, { loaders }, info) => {
      const query = new SOQL('Account')
        .select(accountFields)
        .where('Id', '=', Id)
        .build();

      return loaders.query.load(query).then(records => records[0]);
    },
    Contacts: (parent, { limit }, { loaders, user }, info) => {
      const query = new SOQL('Contact')
        .select(contactFields)
        .limit(limit)
        .build();

      return loaders.query.load(query);
    },
    Contact: (parent, { Id }, { loaders }, info) => {
      const query = new SOQL('Contact')
        .select(contactFields)
        .where('Id', '=', Id)
        .build();

      return loaders.query.load(query).then(records => records[0]);
    },
  },
  Account: {
    Contacts: (parent, args, { loaders }, info) => {
      if (!parent.Id) {
        return null;
      }

      const query = new SOQL('Contact')
        .select(contactFields)
        .where('AccountId', '=', parent.Id)
        .build();

      return loaders.query.load(query);
    },
  },
  Contact: {
    Account: (parent, args, { loaders }, info) => {
      if (!parent.AccountId) {
        return null;
      }

      const query = new SOQL('Account')
        .select(accountFields)
        .where('Id', '=', parent.AccountId)
        .build();

      return loaders.query.load(query).then(records => records[0]);
    },
  },
};

export default resolvers;
