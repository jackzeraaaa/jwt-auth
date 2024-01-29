const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

router.post("/register", async (req, res) => {
  const { name, password, email } = req.body;
  if (!name || !password) {
    return res.status(400).send("Name and password are required.");
  }
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(400).send("This email is already in use.");
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: hashPassword,
  });

  try {
    const savedUser = await user.save();
    res
      .status(201)
      .send({ message: "Account created successfully.", id: savedUser._id });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send("Email and password are required.");

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("Email or password wrong");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Email or password wrong");

  // create jwt
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res
    .header("Authorization", `Bearer ${token}`)
    .send({ token, id: user._id, message: "Logged in successfully." });
});

module.exports = router;
