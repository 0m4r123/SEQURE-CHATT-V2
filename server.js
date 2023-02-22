const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const bcrypt = require("bcrypt");

const adapter = new FileSync("db.json");
const db = low(adapter);

const app = express();

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

//jwt
const jwt = require("jsonwebtoken");
app.use(cookieParser());
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: true }));

const http = require("http");

const publicDirectory = path.join(__dirname, "./www");
app.use(express.static(publicDirectory));
app.use(express.json());
app.set("view engine", "hbs");
app.use(bodyParser.json());
const server = http.createServer(app);

app.get("/", function (req, res) {
  const messages = db.get("messages").value();
  res.render("guest", { messages });
});

app.get("/register", function (req, res) {
  res.render("register");
});
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  // kolla om e-post adressen redans används
  const emailInUse = db.get("users").find({ email }).value();
  if (emailInUse) {
    return res.status(400).send({ message: "E-post adressen är upptagen." });
  }

  // kolla om användarnamnet redans används
  const usernameInUse = db.get("users").find({ username }).value();
  if (usernameInUse) {
    return res.status(400).send({ message: "Användarnamnet är upptaget," });
  }

  // Haschar lösenordet
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Sparar användaren om all är okej.
  const newUser = { email, username, password: hashedPassword };
  db.get("users").push(newUser).write();

  res.send({ message: "Användaren registrerades, logga in." });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Kolla om användaren existerar
  const user = db.get("users").find({ email }).value();
  if (!user) {
    return res
      .status(401)
      .send({ message: "E-post adressen eller lösenordet är fel." });
  }

  // kolla om lösenordet finns och stämmer
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res
      .status(401)
      .send({ message: "E-post adressen eller lösenordet är fel." });
  }

  const token = jwt.sign(
    { email: user.email, username: user.username },
    process.env.JWT_SECRET
  );

  res.cookie("jwt", token, { httpOnly: true });
  res.redirect("/home");
});

app.get("/home", function (req, res) {
  // tar fram jwt token från en coockie
  const token = req.cookies.jwt;

  try {
    // verfierar så att jwt token är giltigt och tar fram lösenordet
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Renderar home och skickar vidare användarnamnet som en variabel.
    res.render("home", { username });
  } catch (err) {
    // Om token inte finns eller är ogiltig
    res.redirect("/login");
  }
});

app.get("/home", function (req, res) {
  // Get the token from the cookie
  const token = req.cookies.jwt;

  try {
    // tar fram jwt token från en coockie och tar fram användarnamn
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    // Renderar home och skickar vidare användarnamnet som en variabel.
    res.render("home", { username });
  } catch (err) {
    // Om token inte finns eller är ogiltig
    res.redirect("/login");
  }
});

app.post("/message", (req, res) => {
  const token = req.cookies.jwt;

  try {
    //verfiera jwt token innand meddelanden och få fram användarnamn
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;

    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;
    const message = {
      date: dateTime,
      username: username,
      message: req.body.message,
    };

    db.get("messages").push(message).write();

    res.json(message);
  } catch (err) {
    // Om det inte finns en jwt toke, generera ett gäst namn.
    const username = "guest-" + Math.floor(Math.random() * 1000000);
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " | " + time;
    const message = {
      date: dateTime,
      username: username,
      message: req.body.message,
    };

    db.get("messages").push(message).write();

    res.json(message);
  }
});

app.post("/private-message", (req, res) => {
  const token = req.cookies.jwt;

  try {
    // Vefierar token och tar fram användarnamnet
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " | " + time;
    const message = {
      date: dateTime,
      username: username,
      message: req.body.message,
    };

    db.get("private_messages").push(message).write();

    res.json(message);
  } catch (err) {
    res.status(401).json({ error: "Vänligen l ogga in och försök igen!" });
  }
});

app.get("/fetch-public-messages", (req, res) => {
  const messages = db.get("messages").value();

  // skickar alla meddelanden som en json
  res.json(messages);
});

app.get("/fetch-private-messages", verifyCookie, (req, res) => {
  const messagesPrivate = db.get("private_messages").value();

  // skickar alla meddelanden som en json
  res.json(messagesPrivate);
});

/*  En funktion som kollar om dt finns en giltig jwt token, 
utan en jwt token kommer den inte låta användaren hämta privata meddelanden. */
function verifyCookie(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Din token är ogiltig." });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "Nrågot gick fel, logga in igen." });
  }
}

app.get("/logout", function (req, res) {
  // Tar bort jwt token från cookie och skickar vidare användaren till framsidan.
  res.clearCookie("jwt");

  res.redirect("/");
});

// Start server, listen on port 5500
server.listen(5500, () => {
  console.log("Server started on port 5500");
});
