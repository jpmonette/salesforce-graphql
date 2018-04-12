import Q from './q';

function getFields(info) {
  const fields = [];
  info.fieldNodes[0].selectionSet.selections.map((value, key) => {
    if (!value.selectionSet) fields.push(value.name.value);
  });
  return fields;
}

function getWheres(info: any): any[] {
  const wheres = [];
  info.fieldNodes[0].arguments.map((val, key) => {
    const field = val.name.value;
    const value = val.value.value;
    if (field !== 'limit') {
      wheres.push({ field, value, operator: '=' });
    }
  });
  return wheres;
}

function getLimit(info: any): number | void {
  let limit;
  info.fieldNodes[0].arguments.map((value, key) => {
    if (value.name.value === 'limit') {
      limit = value.value.value;
    }
  });
  return limit;
}

export class Salesforce {
  public conn;

  constructor(props) {
    this.conn = props.conn;
  }

  query = (parent, info) => {
    const queryBuilder = new Q(info.returnType.ofType || info.returnType).select(getFields(info));
    const limit = getLimit(info);

    if (limit) {
      queryBuilder.limit(limit);
    }

    const wheres = getWheres(info);

    wheres.map(({ field, operator, value }) => queryBuilder.where(field, operator, value));
    Object.keys(parent).map((key: string) => queryBuilder.where(key, '=', parent[key]));
    const query = queryBuilder.build();
    console.log('\nExecuting', query);
    return this.conn.query(query);
  };
}
