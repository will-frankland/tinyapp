const express = require("express");   // Import the express package. Framework to make a simpler server (http)
const app = express();                // Instantiate an express object for us to use
const PORT = 8080;                    // This is the default port   (stire the port value in a variable)
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// users object for registrations
const users = {
  1234: {
    // specific values for user1234
    id: 1234,
    email: "1234@gmail.com",
    password: "password"
  }  
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id
  // console.log("Identifer", email);
  const templateVars = { urls: urlDatabase, user:users[userID] }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id
  // console.log(req.params);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user:users[userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  const longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  // const userID = req.cookies.user_id
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  // console.log(urlDatabase);
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);         
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  // console.log(req.params);
  const { shortURL } = req.params;
  // return res.send("Hello delete");
delete urlDatabase[shortURL];
res.redirect(`/urls`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.cookies.user_id
  const templateVars = { urls: urlDatabase, user:users[userID] }
  // const templateVars = { urls: urlDatabase, username: req.cookies['username'] }
  // console.log(req.params);
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

// .get renders page and form render login.ejs
app.get("/login", (req, res) => {
  const templateVars = { user: null}
  res.render("login", templateVars);
});

// for when form is submitted
app.post("/login", (req, res) => {
  const { email, password } = req.body
  // variable that acceses user object values
  const _users = Object.values(users)
  // variable that uses .find to check if client email is contained within object 'users'.
  const foundEmail = _users.find(user => {
    return user.email === email;
  })

  console.log("Found email & found password", foundEmail)
    if (!foundEmail) {
      return res.status(403).send("Invalid email")
    }
    if (email !== foundEmail["email"]) {
      // console.log('email issue') TESTING
    return res.status(403).send("Invalid email")
    }
    if (password !== foundEmail["password"]) {
      // console.log('password issue') TESTING
    return res.status(403).send("Invalid password")
  }
  res.cookie('user_id', foundEmail["id"]);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
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
  // could do res.send (error) here
  users[id] = { id, email, password }     // adding new user details to the object
  // console.log(users);
  res.cookie('user_id', id)
  res.redirect("/urls")
  // const { error, data } = createUser(req.body);
});


const createUser = (userInfo, newUser) => {
  const { id, email, password } = userInfo;

  if (!id || !email || !password) {
    return { error: "Invalid field", data: null };
  }
};

// const newUser = {
//   id,
//   email,
//   password
// }

// const users[email] = newUser;

// return { error:null, data:newUser}
// };



//   if(error) {
//     console.log(error);
//     return res.redirect("/register");
//   }
  
//   userDatabase[email] = newUser
//   res.cookie("email", email)
//   return res.redirect("/")

// })


// Lecture example
// app.post("urls/login2", (req, res) => {
//   const { email, password } = req.body

//   // check if the email exists
//   if(!userDatabase[email]) {
//     console.log("bad email")
//     return res.redirect("/")
//   }
//   // check if the pw matches one on record
//     if (userDatabase[email].password !== password) {
//       console.log("bad email")
//       return res.redirect("/")
//     }
//     // if so, go back to /url (identifier)
//     // if not, also go back to / (nothing)
//     res.cookie("email", email)
//     return res.send('success');
// })

// // user is an object