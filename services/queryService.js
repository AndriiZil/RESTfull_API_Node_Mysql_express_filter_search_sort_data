const mysql = require('../mySQL');


class QueryService {

  constructor() {}

  getLimitOffset(queryParams) {
    if (queryParams.limit === undefined || queryParams.offset === undefined) {
      throw new Error('No correct params!')
    }
    const limit = parseInt(queryParams.limit);
    const offset = parseInt(queryParams.offset);
    if (typeof limit !== 'number' || typeof offset !== 'number') {
      throw new Error('Incorrect Type');
    }
    return ` LIMIT ${mysql.protectedValue(limit)} OFFSET ${mysql.protectedValue(offset)} `;
  }

  getSort(queryParams) {
    let query = '';
    const sortField = queryParams.sortField;
    if (queryParams.sortField && queryParams.sortOrder) {
      const sortOrder = queryParams.sortOrder === '1' ? 'ASC' : 'DESC';
      query = ` ORDER BY ${mysql.protectedId(sortField)} ${sortOrder}`;
    } else if (queryParams.sortField) {
      query = ` ORDER BY ${mysql.protectedId(sortField)}`;
    }
    return query;
  }

  getFilters(filters) {
    // console.log(filters);
    let query = ' WHERE';

    for (let key in filters) {
      if (filters.hasOwnProperty(key)) {
        const prefix = (query === ' WHERE') ? '' : ' AND';
        if (key === 'FirstName' || key === 'LastName' || key === 'Age'
          || key === 'State' || key === 'City') {
          const filterBy = mysql.protectedValue(filters[key]);
          query += `${prefix} ${key}=${filterBy}`
        }
      }
    }
    return query === ' WHERE ' ? '' : query;
  }

  async _createPerson(body) {
    if (body === undefined) {
      throw new Error('Incoming Person\'s Data is Incorrect!')
    }
    const person = [
      [
        body.FirstName, body.LastName, body.Age, body.Gender, body.Email,
        body.Country, body.City, body.Street, body.State
      ]
    ];
    person[0].forEach((value) => {
      if (value === undefined || value === '') {
        throw new Error('Person\'s value is empty')
      }
    });
    const queryPerson = `INSERT INTO Persons (FirstName, LastName, Age, Gender,
                         Email, Country, City, Street, State) VALUES ?;`;

    const tablePerson = await mysql.query(queryPerson, [person]);
    return tablePerson.insertId;
  }

  async _createPersonalInfo(personInfo, personId) {
    // const personInfo = body.personalInfo;
    if (personInfo === undefined) {
      throw new Error('Incoming personalInfo\'s Data is incorrect!')
    }

    const data = [];

    personInfo.forEach((value) => {
      if (value.Credit_Card_Number === undefined || value.CVV2 === undefined
        || value.Expires === undefined) {
        throw new Error('PersonalInfo Data is Incorrect!')
      }

      const preparedInfo = [
        value.Credit_Card_Number, value.CVV2, value.Expires, personId
      ];

      data.push(preparedInfo)

    });

    const queryInfo = 'INSERT INTO PersonalInfo (Credit_Card_Number, CVV2, Expires, Person_id) VALUES ?';
    const tableInfo = await mysql.query(queryInfo, [data]);
    return tableInfo
  }

  async getPersons(queryParams) {

    let myQuery = `SELECT p.id, p.FirstName, p.LastName, p.Age, p.Gender, p.Email, 
                   p.Country, p.City, p.Street, p.State FROM Persons AS p`;

    if (Object.keys(queryParams).length > 0) {

      if (queryParams.filters) {
        const filters = this.getFilters(queryParams.filters);
        myQuery += filters;
      }
      
      if (queryParams.sortField) {
        const sort = this.getSort(queryParams);
        myQuery += sort;
      }

      const limitOffsetQuery = this.getLimitOffset(queryParams);
      myQuery += limitOffsetQuery;
    }

    const result = await mysql.query(myQuery);
    return result;
  }

  async getPersonById(personId) {
    const id = parseInt(personId);
    const myQuery = `SELECT p.id, p.FirstName, p.LastName, p.Age, p.Gender, 
                     p.Email, p.Country, p.City, p.Street, p.State 
                     FROM Persons AS p WHERE p.id = ?; 
                     SELECT * FROM PersonalInfo WHERE Person_id = ?`;
    const result = await mysql.query(myQuery, [id, id]);
    console.log(result);
    const person = result[0][0];
    if (person === undefined) {
      throw new Error('Person is Not Defined')
    }
    person.personalInfo = result[1];
    return person
  }

  async createPerson(body) {
    const personId = await this._createPerson(body);
    await this._createPersonalInfo(body.personalInfo, personId);
  }

  async updatePerson(personId, body) {
    if (personId === undefined || body === undefined) {
      throw new Error('Incoming Data is Incorrect!')
    }
    const id = parseInt(personId);
    const values = [
      body.FirstName, body.LastName, body.Age, body.Gender, body.Email,
      body.Country, body.City, body.Street, body.State, id, id
    ];

    const myQuery = `UPDATE Persons AS p SET p.FirstName = ?, p.LastName = ?, p.Age = ?, 
                     p.Gender = ?, p.Email = ?, p.Country = ?, p.City = ?, p.Street = ?, 
                     p.State = ? WHERE id = ?;
                     DELETE FROM PersonalInfo WHERE Person_id = ?;`;

    const result = await mysql.query(myQuery, values);
    this._createPersonalInfo(body.personalInfo, personId);
    return result;
  }

  async deletePerson(personId) {
    const id = parseInt(personId);
    const myQuery = `DELETE FROM PersonalInfo WHERE PersonalInfo.Person_id = ?; 
                     DELETE FROM Persons WHERE Persons.id = ?;`;

    const result = await mysql.query(myQuery, [id, id]);
    if (result === undefined) {
      throw new Error ('Person is Undefined!')
    }
    return result
  }

}

module.exports = new QueryService();