const ApplicationError = require('./applicationerror.js');

class MissingFieldError extends ApplicationError {
  constructor(message, status, code) {
    super(message, status, code);
  }
}

module.exports = MissingFieldError;
