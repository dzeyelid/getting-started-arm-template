const assert = require('chai').assert;
const axios = require('axios');
const contentTypeParser = require('content-type');

describe('API', () => {

  before(() => {
    if (process.env.FUNCTIONS_NAME) {
      this.host = `https://${process.env.FUNCTIONS_NAME}.azurewebsites.net`;
    }
    else {
      this.host = 'http://localhost:7071';
    }
  });

  describe('HttpTrigger', () => {
    const functionName = 'HttpTrigger';
    this.path = `/api/${functionName}`;

    before(async () => {
      this.params = {};

      if (process.env.PUBLISHING_USER_NAME &&
        process.env.PUBLISHING_PASSWORD &&
        process.env.FUNCTIONS_NAME) {
        try {
          // Get function key
          const b = new Buffer.from(`${process.env.PUBLISHING_USER_NAME}:${process.env.PUBLISHING_PASSWORD}`);
          const base64Credential = b.toString('base64');
          const getTokenUrl = `https://${process.env.FUNCTIONS_NAME}.scm.azurewebsites.net/api/functions/admin/token`;
          const getTokenHeaders = {
            'Authorization': `Basic ${base64Credential}`,
          };
          const tokenResponse = await axios.get(getTokenUrl, {headers: getTokenHeaders});
          const token = tokenResponse.data;
          
          const getKeysUrl = `https://${process.env.FUNCTIONS_NAME}.azurewebsites.net/admin/functions/${functionName}/keys`;
          const getKeysHeaders = {
            'Authorization': `Bearer ${token}`,
          };
          const keysResponse = await axios.get(getKeysUrl, {headers: getKeysHeaders});
          this.params.code = keysResponse.data.keys[0].value;
        } catch (e) {
          console.log(e);
        }
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