import { SOQL } from 'salesforce-queries';

function getFields(info: any) {
  const fields: Set<string> = new Set([]);
  info.fieldNodes.map((fieldNode: any) => {
    if (fieldNode.selectionSet) {
      fieldNode.selectionSet.selections.map((value: any) => {
        if (!value.selectionSet) fields.add(value.name.value);
      });
    }
  });
  return [...fields];
}

function getWheres(info: any): any[] {
  const wheres: { field: string; value: string; operator: string }[] = [];
  info.fieldNodes.map((fieldNode: any) => {
    fieldNode.arguments.map((val: any) => {
      const field = val.name.value;
      const value = val.value.value;
      if (field !== 'limit') {
        wheres.push({ field, value, operator: '=' });
      }
    });
  });
  return wheres;
}

function getLimit(info: any): number | void {
  let limit;
  info.fieldNodes.map((fieldNode: any) => {
    fieldNode.arguments.map((value: any) => {
      if (value.name.value === 'limit') {
        limit = value.value.value;
      }
    });
  });
  return limit;
}

export interface Options {
  conn: any;
}

class Salesforce {
  conn: any;

  constructor(props: Options) {
    this.conn = props.conn;
  }

  public query = (parent: { [key: string]: string }, info: any) => {
    const queryBuilder = new SOQL(info.returnType.ofType || info.returnType).select(
      getFields(info)
    );
    const limit = getLimit(info);

    if (limit) {
      queryBuilder.limit(limit);
    }

    const wheres = getWheres(info);

    wheres.map(({ field, operator, value }) => queryBuilder.where(field, operator, value));
    Object.keys(parent).map((key: string) => queryBuilder.where(key, '=', parent[key]));
    const query = queryBuilder.build();
    return this.conn.query(query);
  };
}

export { Salesforce };
