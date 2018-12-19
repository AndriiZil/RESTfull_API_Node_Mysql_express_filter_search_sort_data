const expect = require('chai').expect;
const mocha = require('mocha');
const sinon = require('sinon');
const queryService = require('../services/queryService');


describe('Testing Query Service', () => {

  describe('Testing LimitOffset function', () => {
    it('should return limit and offset', () => {
      const queryParams = {limit: '1', offset: '1'};
      const result = queryService.getLimitOffset(queryParams);
      expect(result).to.be.a('string');
      expect(result).to.equal(' LIMIT 1 OFFSET 1 ');
    });
  });

  describe('Testing sortField & SortOrder function', () => {
    it('should return Sort By FirstName ASC', () => {
      const queryParams = { sortField: 'FirstName', sortOrder: 'DESC' };
      const result = queryService.getSort(queryParams);
      expect(result).to.be.a('string');
      expect(result).to.equal(' ORDER BY `FirstName` DESC');
    });
  });

  describe('Testing filter function', () => {
    it('should return filtered data', () => {
      const queryParams = {
        FirstName: 'Tammy',
        LastName: 'Cummings',
        Age: 35,
        State: 'New York',
        City: 'Wurtsboro'
      };
      const result = queryService.getFilters(queryParams);
      expect(result).to.be.a('string');
      expect(result).to.equal( ` WHERE FirstName='Tammy' AND LastName='Cummings' AND Age=35 AND State='New York' AND City='Wurtsboro'`);
    });
  });

});