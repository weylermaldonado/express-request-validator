const MissingFields = require('../models/missingfilederrors.js');
/**
 * Custom function to validate
 * @param {*} express Express instance
 */
function prototypeConstruct(express) {
  /**
   * Validate request content.
   * @param {Object} request Express request object.
   * @param {Object} parameters Parameters to find in the request.
   * @returns {Array} errors
   */
  express.request.validate = (request, parameters) => {
    const errors = getMissingParamsByType(request, parameters);
    return errors;
  };
}

const getMissingParamsByType = (request, parameters) => {
  let masterError = [];
  Object.keys(parameters).forEach((element) => {
    const location = parameters[element].location.toLowerCase();
    const required = parameters[element].required;
    const nested = parameters[element].nested;
    switch (location) {
      case 'query': {
        const queryResults = findByQuery(request, element, required, nested);
        masterError = masterError.concat(queryResults);
        break;
      }
      case 'params': {
        const paramsResults = findByParams(request, element, required, nested);
        masterError = masterError.concat(paramsResults);
        break;
      }
      case 'body': {
        const bodyResults = findByBody(request, element, required, nested);
        masterError = masterError.concat(bodyResults);
        break;
      }
      default: {
        const defaultError = new MissingFields(`Location ${location} doesnt exists in the request.`, 400, 'UnprocessableEntity.').getFirstError();
        masterError.push(defaultError);
        break;
      }
    }
  });
  return masterError;
};

const findByQuery = (request, key, required, nested) => {
  if (!required) { return []; }
  let errors = [];
  if (nested) {
    const nestedErrors = findNestedKeys(nested, request.query);
    errors = errors.concat(nestedErrors);
  } else {
    if (!request.query[key]) {
      const queryError = new MissingFields(`Field ${key} missing in request query`, 422, 3001).getFirstError();
      errors.push(queryError);
    }
  }
  return errors;
};

const findByParams = (request, key, required, nested) => {
  if (!required) { return []; }
  let errors = [];
  if (nested) {
    const nestedErrors = findNestedKeys(nested, request.params);
    errors = errors.concat(nestedErrors);
  } else {
    if (!request.params[key]) {
      const paramsError = new MissingFields(`Field ${key} missing in request params`, 422, 3001).getFirstError();
      errors.push(paramsError);
    }
  }
  return errors;
};

const findByBody = (request, key, required, nested) => {
  if (!required) { return []; }
  let errors = [];
  if (nested) {
    const nestedErrors = findNestedKeys(nested, request.body);
    errors = errors.concat(nestedErrors);
  } else {
    if (!request.body[key]) {
      const bodyError = new MissingFields(`Field ${key} missing in request body`, 422, 3001).getFirstError();
      errors.push(bodyError);
    }
  }

  return errors;
};

const findNestedKeys = (nested, request) => {
  const errors = [];
  const findArray = nested.split('.');
  findArray.reduce((obj, key) => {
    if (typeof obj[key] !== 'undefined' && obj[key]) {
      return obj[key];
    } else {
      const nestedError = new MissingFields(`Field ${key} missing in request`, 422, 3001).getFirstError();
      errors.push(nestedError);
      return;
    }
  }, request);

  return errors;
};

module.exports = prototypeConstruct;
