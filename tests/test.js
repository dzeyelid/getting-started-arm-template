const assert = require('chai').assert;
const axios = require('axios');
const contentTypeParser = require('content-type');

describe('API', () => {

  before(() => {
    if (process.env.FUNCTION_NAME) {
      this.host = `https://${process.env.FUNCTION_NAME}.azurewebsites.net`;
    }
    else {
      this.host = 'http://localhost:7071';
    }
  });

  describe('HttpTrigger', () => {
    this.path = '/api/HttpTrigger';

    before(() => {
      this.params = {};
      if (process.env.SUBSCRIPTION_ID &&
          process.env.RESOURCE_GROUP_NAME &&
          process.env.FUNCTION_NAME) {
            // TODO: Get function key
          }
    });

    it('should return name when name parameter is set', async () => {
      const name = 'Rock';
      const url = this.host + this.path;
      const params = {
        ...this.params,
        name
      };
      const response = await axios.get(url, {params});
      const contentType = contentTypeParser.parse(response.headers['content-type']);
      assert.equal(response.status, 200);
      assert.equal(contentType.type, 'application/json');
      assert.deepEqual(response.data, {name: name});
    });

    it('should return name when name is set in data', async () => {
      const name = 'Julia';
      const url = this.host + this.path;
      const params = {
        ...this.params,
      };
      const response = await axios.post(url, {name: name}, {params});
      const contentType = contentTypeParser.parse(response.headers['content-type']);
      assert.equal(response.status, 200);
      assert.equal(contentType.type, 'application/json');
      assert.deepEqual(response.data, {name: name});
    });

    it('should return error message when name parameter is not set', async () => {
      const url = this.host + this.path;
      const params = {
        ...this.params,
      };
      try {
        await axios.get(url, {params});
        assert.fail();
      } catch (e) {
        const response = e.response;
        const contentType = contentTypeParser.parse(response.headers['content-type']);
        assert.equal(response.status, 400);
        assert.equal(contentType.type, 'application/json');
        assert.deepEqual(response.data, {message: 'Please pass a name on the query string or in the request body'});
      }
    });
  });
});