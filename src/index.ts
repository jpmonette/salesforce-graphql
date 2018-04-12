function getFields(info) {
  const fields = [];
  info.fieldNodes[0].selectionSet.selections.map((value, key) => {
    if (!value.selectionSet) fields.push(value.name.value);
  });
  return fields;
}

function getWheres(info) {
  const wheres = [];
  info.fieldNodes[0].arguments.map((value, key) => {
    const fieldName = value.name.value;
    const fieldValue = value.value.value;
    if (fieldName !== 'limit') {
      wheres.push(`${fieldName} = '${fieldValue}'`);
    }
  });

  if (wheres.length !== 0) {
    return ` WHERE ${wheres.join(' ')}`;
  } else {
    return '';
  }
}

function getLimit(info) {
  let limit = '';
  info.fieldNodes[0].arguments.map((value, key) => {
    if (value.name.value === 'limit') {
      limit = ' LIMIT ' + value.value.value;
    }
  });
  return limit;
}

export class Salesforce {
  public conn;

  constructor(props) {
    this.conn = props.conn;
  }

  query = (_, info) => {
    const sobject = info.returnType.ofType || info.returnType;
    const fields = getFields(info);
    const limit = getLimit(info);
    const wheres = getWheres(info);
    const query = `SELECT ${fields.join(',')} FROM ${sobject}${limit}${wheres}`;
    console.log('\nExecuting', query);
    return this.conn.query(query);
  };
}
