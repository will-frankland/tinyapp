const getUserByEmail = (email, users) => {
  let requiredUser = {};
  for (const key in users) {
    console.log(key)
    if (users[key].email === email) {
      requiredUser = users[key];
    }
  }
  return requiredUser
};

const urlsForUser = (userID, urlDatabase) => {
  let filteredURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };