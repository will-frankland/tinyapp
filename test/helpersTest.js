const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // assert that this user has this user ID
    assert.strictEqual(user.id, expectedUserID, 'these IDs are strictly equal')
  });
});

// assert.strictEqual(true, true, 'these booleans are strictly equal');


describe ('generateRandomString', function() {
  it('should return a random string of 6 alphanumeric characters', function() {
    const randomString = generateRandomString()

    // assert that the string of 6 digits is random
    assert
  })
});




describe ('urlsForUser', function() {
  it('should only allow access to the MyURLs page of TinyURL if the user is logged in', function() {
    const myUrlAccess = urlsForUser('userID01', testDatabase)
    const 

    // assert that a logged in user only can access the myURL page
  }
})