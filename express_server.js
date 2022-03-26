const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers.js');
const { use } = require("chai");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["aSDFgadrsg893"]
}));


app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "1234@gmail.com",
    password: bcrypt.hashSync("password", 10)
  }
};

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (userID === undefined) {
    return res.send("Please login to view")
  }
  const filteredURLs = urlsForUser(userID, urlDatabase)

  const templateVars = { urls: filteredURLs, user: users[userID] }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id
  if (!userID) {
    return res.redirect("/login");
  }
  const templateVars = { urls: urlDatabase, user: users[userID] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id
  if (!userID) {
    return res.status(404).send("No access, please login")
  }
  // if logged in but accessing URL of other user, display error message.
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(404).send("You do not own this URL")
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.user_id
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("This page does not exist")
    return
  }
  const longURL = urlDatabase[req.params.shortURL].longURL
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  const userID = req.session.user_id
  if (userID) {
    return res.redirect("/urls");
  }
  if(!userID) {
    return res.redirect("/login");
  }
  const templateVars = { urls: urlDatabase, user: users[userID] }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  const userID = req.session.user_id
  const templateVars = { urls: urlDatabase, user: users[userID] }
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const userID = req.session.user_id
  const templateVars = { urls: urlDatabase, user: users[userID] }
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  // const userID = req.cookies.user_id
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = { longURL, userID }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // perform check to see if user is logged in
  const userID = req.session.user_id
    // if user is not logged in, return error message and exit function
  if (!userID) {
    return res.send("Not authorized!")
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  const templateVars = { user: null }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body
  const _users = Object.values(users)
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("Invalid email")
  }
  if (email !== user["email"]) {
    return res.status(403).send("Invalid email")
  }
  bcrypt.compare(password, user.password, (err, success) => {
    if (!success) {
      return res.status(403).send("Invalid password");
    }
  });
  req.session.user_id = user["id"];
  res.redirect(`/urls`);
});
app.post("/logout", (req, res) => {
  // clear cookies after logout
  req.session = null
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  res.render("register")
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing field.");
  }
  const _users = Object.values(users)
  const foundEmail = _users.find(user => {
    return user.email === email;
  })
  if (foundEmail) {
    return res.status(400).send("Email already registered.");
  }

  let hashedPassword = bcrypt.hashSync(password, 10)
  users[id] = { id, email, password: hashedPassword }
  console.log(bcrypt.compareSync("password", hashedPassword));

  console.log("users", users)


  req.session.user_id = id
  res.redirect("/urls")
});


// app.listen needed at bottom of file?