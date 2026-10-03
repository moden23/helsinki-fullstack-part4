const { test, after, beforeEach, describe } = require("node:test");
const assert = require("assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../model/user");
const app = require("../app");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");

const api = supertest(app);

describe("when there is initially one user in db", async () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 19);
    const user = new User({ username: "root", passwordHash });
    await user.save({});
  });

  test("creation succeeds with a fresh name", async () => {
    const usersInit = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .get("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAfterCreation = await helper.usersInDb();
    assert.strictEqual(usersInit.length + 1, usersAfterCreation.length);

    const usernames = usersAfterCreation.map((user) => user.username);
    assert.strictEqual(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
