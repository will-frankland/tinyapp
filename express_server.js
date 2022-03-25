const express = require("express");   // Import the express package. Framework to make a simpler server (http)
const app = express();                // Instantiate an express object for us to use
const PORT = 8080;                    // This is the default port   (stire the port value in a variable)
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");

const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers.js');


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

// users object for registrations
const users = {
  aJ48lW: {
    // specific values for user1234
    id: "aJ48lW",
    email: "1234@gmail.com",
    password: bcrypt.hashSync("password", 10)
  }
};

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  // Only registered and logged in users can view MyURLs
  if (userID === undefined) {
    return res.send("Please login to view")
  }
  const filteredURLs = urlsForUser(userID, urlDatabase)

  const templateVars = { urls: filteredURLs, user: users[userID] }
  res.render("urls_index", templateVars);
});

// Only registered and logged in users can create tiny URLs
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id
  if (!userID) {
    return res.render("login");
  }
  const templateVars = { urls: urlDatabase, user: users[userID] }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id
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
  // const templateVars = { urls: urlDatabase, user: users[userID] }
  const shortURL = generateRandomString()
  const longURL = req.body.longURL
  urlDatabase[shortURL] = { longURL, userID }
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id
  // perform check to see if it is their url
  // only perform operation if user is logged in - stops people accessing API from behind the scenes without being logged in
  if (!userID) {
    res.send("Not authorized!")
  }
  // const templateVars = { urls: urlDatabase, user: users[userID] }
  // console.log(req.params);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id
  // const templateVars = { urls: urlDatabase, user: users[userID] }
  // const templateVars = { urls: urlDatabase, username: req.cookies['username'] }
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls`);
});

// .get renders page and form render login.ejs
app.get("/login", (req, res) => {
  const templateVars = { user: null }
  res.render("login", templateVars);
});

// for when form is submitted
app.post("/login", (req, res) => {
  const { email, password } = req.body
  // variable that acceses user object values
  const _users = Object.values(users)
  // variable that uses .find to check if client email is contained within object 'users'.
  const user = getUserByEmail(email, users);

  console.log(user)
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
  req.session.user_id = null
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  res.render("register")
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  // if email or password field are missing, return error with reason.
  if (!email || !password) {
    return res.status(400).send("Missing field.");
  }
  // create a variable that accesses user object values
  const _users = Object.values(users)
  // create another var that uses .find to check...
  // if client input email is already reg'd by iterating through all users 
  const foundEmail = _users.find(user => {
    return user.email === email;
  })
  // if email found then display error that email already registered.
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
