<p align="center">
  <img src="./assets/title.png" alt="salesforce graphql" width="326">
  <br>
  <a href="https://travis-ci.org/jpmonette/salesforce-graphql"><img src="https://travis-ci.org/jpmonette/salesforce-graphql.svg?branch=master" alt="Build Status"></a> <a href='https://coveralls.io/github/jpmonette/salesforce-graphql?branch=master'><img src='https://coveralls.io/repos/github/jpmonette/salesforce-graphql/badge.svg?branch=master' alt='Coverage Status' /></a>
</p>

<p align="center"><code>salesforce-graphql</code> - Bringing the <strong>GraphQL</strong> query language to <strong>Salesforce</strong></p>

## Getting Started

### Installation

```sh
$ yarn add salesforce-graphql jsforce
```

### Example

#### `app.ts`

```ts
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as fs from 'fs';

import { GraphQLServer } from 'graphql-yoga';
import { Binding } from 'salesforce-graphql';

const schemaFile = path.join(__dirname, 'schema.graphql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

const { USERNAME, PASSWORD } = process.env;

const resolvers = {
  Query: {
    Accounts: (parent, args, context, info) =>
      context.db.query({}, info).then(res => res.records),
    Account: (parent, args, context, info) =>
      context.db.query({}, info).then(res => res.records[0]),
    Contacts: (parent, args, context, info) =>
      context.db.query({}, info).then(res => res.records),
    Contact: (parentobj, args, context, info) =>
      context.db.query({}, info).then(res => res.records[0]),
  },
  Account: {
    Contacts: (parent, args, context, info) =>
      context.db.query({ AccountId: parent.Id }, info).then(res => res.records),
  },
  Contact: {
    Account: (parent, args, context, info) =>
      context.db.query({ Id: parent.AccountId }, info).then(res => res.records[0]),
  },
};

const conn = new jsforce.Connection({});

function init() {
  const db = new Binding({ conn });

  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: req => ({ ...req, db }),
  });

  server.start({ playground: '/playground' }, ({ port }) =>
    console.log('Server is running on localhost:' + port)
  );
}

conn.login(USERNAME, PASSWORD, (err, userinfo) => init());
```

#### `schema.graphql`

```graphql
type Query {
  Account(Id: ID!): Account
  Accounts(limit: Int): [Account]
  Contact(Id: ID!): Contact
  Contacts(limit: Int): [Contact]
}

type Account {
  Id: ID!
  IsDeleted: Boolean
  Name: String
  Type: String

  Contacts(limit: Int): [Contact]
}

type Contact {
  Id: ID!
  Account: Account
  AccountId: String
  LastName: String
  FirstName: String
  Salutation: String
  Name: String
}
```

When you are ready, start the GraphQL server:

```sh
$ yarn start
```

Head over to `http://localhost:4000/playground` to test with the following query:

```graphql
{
  Account(Id: "001E000001KnMkTIAV") {
    Id
    Name
    Contacts(limit: 1) {
      Name
      AccountId
      Account {
        Name
      }
    }
  }
}
```

![Sample Output](assets/output.png)

## TODO

* Subscriptions
* Mutations
* Basically everything

## References

- [`salesforce-graphql` on NPM](https://www.npmjs.com/package/salesforce-graphql)
- Learn more about [GraphQL](http://graphql.org/)
- [Salesforce REST API](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm) documentation

## Extra

- Looking for [new opportunities](https://mavens.com/careers/)? Have a look at [Mavens](https://mavens.com/) website!