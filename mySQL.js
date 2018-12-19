require('dotenv').load();
const mysql = require('mysql');


class MySQLConnection {

  constructor() {
    this.connection = null;
  }

  protectedId(id) {
    const connection = this._getConnection();
    const result = connection.escapeId(id);
    return result
  }

  protectedValue(value) {
    const connection = this._getConnection();
    const result = connection.escape(value);
    return result
  }

  query(myQuery, queryParams) {
    return new Promise((resolve, reject) => {
      const connection = this._getConnection();

      connection.query(myQuery, queryParams, (error, result) => {
        if (error) return reject(error);
        return resolve(result)
      })
    });
  }

  _getConnection() {
    if (this.connection === null) {
      this.connection = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.DATABASE_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        multipleStatements: true
      });
    }
    return this.connection;
  }
}

module.exports = new MySQLConnection();