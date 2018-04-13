import Q from './q';

function getFields(info) {
  const fields: string[] = [];
  info.fieldNodes.map(fieldNode => {
    if (fieldNode.selectionSet) {
      fieldNode.selectionSet.selections.map(value => {
        if (!value.selectionSet) fields.push(value.name.value);
      });
    }
  });
  return fields;
}

function getWheres(info): any[] {
  const wheres: { field: string; value: string; operator: string }[] = [];
  info.fieldNodes.map(fieldNode => {
    fieldNode.arguments.map(val => {
      const field = val.name.value;
      const value = val.value.value;
      if (field !== 'limit') {
        wheres.push({ field, value, operator: '=' });
      }
    });
  });
  return wheres;
}

function getLimit(info): number | void {
  let limit;
  info.fieldNodes.map(fieldNode => {
    fieldNode.arguments.map(value => {
      if (value.name.value === 'limit') {
        limit = value.value.value;
      }
    });
  });
  return limit;
}

class Salesforce {
  conn: any;

  constructor(props) {
    console.log('CONSTRUCTOR')
    this.conn = props.conn;
  }

  public query = (parent: { key: string }, info) => {
    console.log('BEFORE')
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

export { Salesforce };