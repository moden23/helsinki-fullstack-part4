const { test, after, beforeEach, describe } = require("node:test");
const assert = require("assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const Blog = require("../model/blog");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("when there is initially some notes saved", async () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const blogs = await helper.blogsInDb();

    assert.strictEqual(blogs.length, helper.initialBlogs.length);
  });

  test("a specific title is on the blogs", async () => {
    const blogs = await helper.blogsInDb();
    const titles = blogs.map((e) => e.title);
    console.log(titles);
    assert.strictEqual(titles.includes("React patterns"), true);
  });
});

describe("addition of a new note", () => {
  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "fullstack",
      author: "john",
      url: "toyurl",
      likes: "2",
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogs = await helper.blogsInDb();
    const blogTitle = blogs.map((blog) => blog.title);

    assert.strictEqual(blogTitle.includes(newBlog.title), true);
    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1);
  });
});

describe("viewing a specific note", async () => {
  test("if likes are missing default is 0", async () => {
    const newBlog = {
      title: "fullstack",
      author: "john",
      url: "toyurl",
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const blogs = await helper.blogsInDb();

    //no duplicates
    const [blogOfInterest] = blogs.filter((blog) => blog.title === "fullstack");
    console.log(blogOfInterest);
    assert.strictEqual(blogOfInterest.likes, 0);
  });

  test("if title or url are missing result is 400 bad request", async () => {
    const newBlog = {
      author: "john",
      likes: 2,
    };
    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("unique identifier property of the blog posts is named id", async () => {
    const blogs = await helper.blogsInDb();

    const does_idExist = blogs.some((blog) => {
      console.log(Object.keys(blog));
      return Object.keys(blog).includes("_id");
    });
    console.log(does_idExist);
    assert.strictEqual(does_idExist, false);
  });

  test("correctly updating a blog", async () => {
    const blogs = await helper.blogsInDb();
    const blogToChange = blogs[0];

    await api
      .put(`api/blogs/${blogToChange.id}`)
      .send(blogToChange)
      .expect(204)
      .expect("Content-Type", /application\/json/);

    const blogsUpdated = await helper.blogsInDb();
    const updatedBlog = blogsUpdated.find(
      (blog) => blogToChange.id === blog.id,
    );

    assert.strictEqual(blogs.length, response.body.length);
    assert.strictEqual(updatedBlog.id === blogToChange.id, true);
    assert.strictEqual(updatedBlog.likes !== blogToChange.id, true);
  });
});

describe("deletion of a blog", () => {
  test.only("test for successful deletion", async () => {
    const blogs = await helper.blogsInDb();

    const blogToDelete = blogs[0];

    console.log(blogToDelete.id);
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAfterDeletion = await helper.blogsInDb();

    const blogsIdsAfterDeletion = blogsAfterDeletion.map((blog) => blog.id);
    console.log(blogsIdsAfterDeletion);
    assert.strictEqual(blogs.includes(blogsIdsAfterDeletion), false);
    assert.strictEqual(blogsIdsAfterDeletion.length, blogs.length - 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
