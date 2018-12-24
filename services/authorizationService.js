const mysql = require('../mySQL');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').load();


class Authorization {

  _error(code, message) {
    const error = new Error(message);
    error.code = code;
    return error
  }

  async _getUserByUserName(username) {
    const query = `SELECT username, password FROM users WHERE username = ?`;
    const user = await mysql.query(query, [username]);
    return user[0]
  }

  async _createUser(user, password) {
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    const result = await mysql.query(query, [user, password]);
    return result
  }

  _sha512(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
      salt: salt,
      passwordHash: value
    };
  };

  _saltHashPassword(userpassword) {
    const salt = 'secret';
    const passwordData = this._sha512(userpassword, salt);
    return passwordData
  }

  async register(body) {
    const { username, password } = body;
    const user = await this._getUserByUserName(username);
    if (user !== undefined) {
      const error = new Error('User already exist');
      error.code = 409;
      throw error
    }
    try {
      const hash = this._saltHashPassword(password);
      await this._createUser(username, hash.passwordHash)
    } catch (e) {
      console.log(e);
    }
  }

  async login(body) {
    const { username, password } = body;
    const secter = process.env.SECRET_KEY;
    const user = await this._getUserByUserName(username);
    if (user === undefined) {
      throw new Error('User is Not Found!')
    }
    const hash = this._saltHashPassword(password);
    if (hash.passwordHash !== (user.password)) {
      throw new Error('Password doesn\'t much')
    }
    const token = jwt.sign({user}, secter, {expiresIn: 120});
    return token
  }
}

module.exports = new Authorization();