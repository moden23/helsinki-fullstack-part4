const usersRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../model/user");
console.log("trexei?");
usersRouter.post("/", async (request, response) => {
  const { name, username, password } = request.body;
  console.log("mapinei");
  const saltRountds = 10;
  const passwordHash = await bcrypt.hash(password, saltRountds);

  const user = new User({
    name,
    username,
    passwordHash,
  });

  const userSaved = await user.save();
  response.status(201).json(userSaved);
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");
  response.json(users);
});

usersRouter.get("/:id", async (request, response) => {
  const id = request.params.id;
  const user = await User.findById(id).populate("blogs");

  if (!user) return response.status(404).end();
  response.status(200).json(user);
});
module.exports = usersRouter;
