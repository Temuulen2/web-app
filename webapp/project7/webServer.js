// strict mode not needed in modules
const express = require("express");
const mongoose = require("mongoose");
const async = require("async");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const cs142password = require("./cs142password");

// MongoDB setup
mongoose.Promise = require("bluebird");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const port = 3000;

// ================= MIDDLEWARE =================

// JSON body унших
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Session тохиргоо
app.use(
  session({
    secret: "cs142-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Static files
app.use(express.static(__dirname));

// ================= LOGIN CHECK =================
// login / logout-оос бусад бүх request login шаардана
app.use((req, res, next) => {
  if (
    req.path === "/admin/login" ||
    req.path === "/admin/logout" ||
    req.path === "/user" ||
    req.path.startsWith("/test")
  ) {
    next();
    return;
  }

  if (!req.session.user) {
    res.sendStatus(401);
    return;
  }

  next();
});

// ================= ADMIN APIs =================

/**
 * POST /admin/login
 */
app.post("/admin/login", async (req, res) => {
  const loginName = req.body.login_name;
  const password = req.body.password;

  if (!loginName) {
    res.status(400).send("Missing login_name");
    return;
  }

  if (!password) {
    res.status(400).send("Missing password");
    return;
  }

  const user = await User.findOne({ login_name: loginName });
  if (!user) {
    res.status(400).send("Invalid login_name or password");
    return;
  }

  // Support old plaintext `password` field for backward compatibility,
  // otherwise validate salted digest.
  let passwordOk = false;
  if (user.password) {
    passwordOk = user.password === password;
  } else if (user.password_digest && user.salt) {
    passwordOk = cs142password.doesPasswordMatch(user.password_digest, user.salt, password);
  }

  if (!passwordOk) {
    res.status(400).send("Invalid login_name or password");
    return;
  }

  req.session.user = {
    _id: user._id,
    first_name: user.first_name,
  };

  res.json(req.session.user);
});

/**
 * POST /admin/logout
 */
app.post("/admin/logout", (req, res) => {
  if (!req.session.user) {
    res.status(400).send("Not logged in");
    return;
  }

  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

// ================= TEST APIs =================

app.get("/test/:p1", (req, res) => {
  const param = req.params.p1 || "info";

  if (param === "info") {
    SchemaInfo.find({}, (err, info) => {
      if (err || info.length === 0) {
        res.status(500).send("Missing SchemaInfo");
        return;
      }
      res.json(info[0]);
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    async.each(
      collections,
      (col, done) => {
        col.collection.countDocuments({}, (err, count) => {
          col.count = count;
          done(err);
        });
      },
      (err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const obj = {};
          collections.forEach((c) => {
            obj[c.name] = c.count;
          });
          res.json(obj);
        }
      }
    );
  } else {
    res.status(400).send("Bad param");
  }
});

// ================= USER APIs =================

/**
 * POST /user
 * Register a new user
 */
app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  // Validate required fields
  if (!login_name || login_name.trim() === "") {
    res.status(400).send("login_name is required");
    return;
  }

  if (!password || password.trim() === "") {
    res.status(400).send("password is required");
    return;
  }

  if (!first_name || first_name.trim() === "") {
    res.status(400).send("first_name is required");
    return;
  }

  if (!last_name || last_name.trim() === "") {
    res.status(400).send("last_name is required");
    return;
  }

  try {
    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      res.status(400).send("login_name already exists");
      return;
    }

    // Create new user with salted password digest
    const pwdEntry = cs142password.makePasswordEntry(password.trim());
    const newUser = await User.create({
      login_name: login_name.trim(),
      password_digest: pwdEntry.hash,
      salt: pwdEntry.salt,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    res.json({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send(err.message || "Server error");
  }
});

/**
 * GET /user/list
 */
app.get("/user/list", (req, res) => {
  User.find({}, "_id first_name last_name", (err, users) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(users);
  });
});

/**
 * GET /user/:id
 */
app.get("/user/:id", (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).send("Invalid user id");
    return;
  }

  // Return only the public user fields expected by the client/tests
  User.findById(
    id,
    "_id first_name last_name location description occupation",
    (err, user) => {
      if (err || !user) {
        res.status(400).send("User not found");
        return;
      }
      res.json(user);
    }
  );
});

// ================= PHOTO APIs =================

/**
 * GET /photosOfUser/:id
 */
app.get("/photosOfUser/:id", async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).send("Invalid user id");
    return;
  }

  try {
    const photos = await Photo.find({ user_id: id }).lean();

    const commentUserIds = [];
    photos.forEach((photo) => {
      photo.comments?.forEach((comment) => {
        commentUserIds.push(comment.user_id);
      });
    });

    const users = await User.find(
      { _id: { $in: commentUserIds } },
      "_id first_name last_name"
    ).lean();

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id] = u;
    });

    photos.forEach((photo) => {
      photo.comments?.forEach((comment) => {
        comment.user = userMap[comment.user_id];
        delete comment.user_id;
      });
    });

    // Strip mongoose internal properties like __v from photos and comments
    photos.forEach((photo) => {
      if (photo.__v !== undefined) delete photo.__v;
      if (photo.comments) {
        photo.comments.forEach((c) => {
          if (c.__v !== undefined) delete c.__v;
        });
      }
    });

    res.json(photos);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * POST /commentsOfPhoto/:photoId
 * Adds a comment to a photo
 */
app.post("/commentsOfPhoto/:photoId", async (req, res) => {
  const photoId = req.params.photoId;
  const { comment } = req.body;

  // Validate comment is not empty
  if (!comment || comment.trim() === "") {
    res.status(400).send("Comment cannot be empty");
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    res.status(400).send("Invalid photo id");
    return;
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      res.status(400).send("Photo not found");
      return;
    }

    // Create the comment object with current user's ID and timestamp
    const newComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: req.session.user._id,
    };

    photo.comments.push(newComment);
    await photo.save();

    // Get the user info to return with comment
    const user = await User.findById(req.session.user._id, "_id first_name last_name");

    // Return the comment with user info
    const commentWithUser = {
      _id: newComment._id,
      comment: newComment.comment,
      date_time: newComment.date_time,
      user_id: newComment.user_id,
      user,
    };

    res.json(commentWithUser);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).send(err.message || "Server error");
  }
});

/**
 * POST /photos/new
 * Upload a new photo for the logged-in user
 */
app.post("/photos/new", upload.single("uploadedphoto"), async (req, res) => {
  // Check if file was provided
  if (!req.file) {
    res.status(400).send("No file provided");
    return;
  }

  try {
    // Generate unique filename: timestamp_userId_originalname
    const timestamp = Date.now();
    const userId = req.session.user._id;
    const originalName = req.file.originalname;
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${userId}_${safeName}`;

    // Save file to images directory
    const imagesDir = path.join(__dirname, "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    // Create Photo object in database
    const photo = await Photo.create({
      file_name: filename,
      date_time: new Date(),
      user_id: userId,
      comments: [],
    });

    // Return only the fields expected by clients/tests (no __v)
    res.json({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      comments: photo.comments,
    });
  } catch (err) {
    console.error("Error uploading photo:", err);
    res.status(500).send(err.message || "Server error");
  }
});

// ================= START SERVER =================

app.listen(port, () => {
  console.log(
    `Listening at http://localhost:${port} exporting ${__dirname}`
  );
});
