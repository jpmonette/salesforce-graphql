export default class Q {
  fromText: string;
  fieldList: string[];
  numberOfRows: number;
  conditions: { field: string; operator: string; value: string }[];
  numberOfRowsToSkip: number;

  constructor(sobject: string) {
    this.fromText = sobject;
    this.fieldList = [];
    this.conditions = [];
  }

  public select = (fields: string[]): Q => {
    this.fieldList.push.apply(this.fieldList, fields);
    return this;
  };

  public limit = (limit: number): Q => {
    this.numberOfRows = limit;
    return this;
  };

  public where = (field: string, operator: string, value: string): Q => {
    this.conditions.push({
      field,
      operator,
      value,
    });
    return this;
  };

  public buildSelect = (): string => {
    if (this.fieldList.length !== 0) {
      return 'SELECT ' + this.fieldList.join(', ');
    } else {
      return 'SELECT Id';
    }
  };

  public buildConditions = (): string => {
    const condList: string[] = [];

    this.conditions.map(({ field, operator, value }) => {
      condList.push(`${field} ${operator} '${value}'`);
    });

    if (this.conditions.length !== 0) {
      return 'WHERE ' + condList.join(' AND ');
    } else {
      return null;
    }
  };

  public build = (): string => {
    const queryParts: string[] = [];

    queryParts.push(this.buildSelect());
    queryParts.push('FROM ' + this.fromText);

    if (this.conditions.length !== 0) {
      queryParts.push(this.buildConditions());
    }

    if (this.numberOfRows) {
      queryParts.push('LIMIT ' + this.numberOfRows);
    }

    return queryParts.join(' ');
  };
}
