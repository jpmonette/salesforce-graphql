import Q from '../q';

describe('Query generator', () => {
  it('should generate simple query', () => {
    const query = new Q('Account').build();
    expect(query).toBe(`SELECT Id FROM Account`);
  });

  it('should add fields', () => {
    const query = new Q('Account').select(['Id', 'Name', 'BillingCountry']).build();
    expect(query).toBe(`SELECT Id, Name, BillingCountry FROM Account`);
  });

  it('should add limit', () => {
    const query = new Q('Account').limit(10).build();
    expect(query).toBe(`SELECT Id FROM Account LIMIT 10`);
  });

  it('should add where condition', () => {
    const query = new Q('Account').where('Id', '=', '001E000001KnMkTIAV').build();
    expect(query).toBe(`SELECT Id FROM Account WHERE Id = '001E000001KnMkTIAV'`);
  });
});
