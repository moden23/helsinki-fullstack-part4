const { test, after, beforeEach, describe } = require("node:test");
const assert = require("assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const Blog = require("../model/blog");
const app = require("../app");

const api = supertest(app);

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
});

describe("when there is initially some notes saved", async () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, initialBlogs.length);
  });

  test("a specific title is on the blogs", async () => {
    const response = await api.get("/api/blogs");
    const titles = response.body.map((e) => e.title);
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
    const response = await api.get("/api/blogs");
    const blogTitle = response.body.map((blog) => blog.title);

    assert.strictEqual(blogTitle.includes(newBlog.title), true);
    assert.strictEqual(response.body.length, initialBlogs.length + 1);
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
    const response = await api.get("/api/blogs");

    //no duplicates
    const [blogOfInterest] = response.body.filter(
      (blog) => blog.title === "fullstack",
    );
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
    const response = await api.get("/api/blogs");

    const does_idExist = response.body.some((blog) => {
      console.log(Object.keys(blog));
      return Object.keys(blog).includes("_id");
    });
    console.log(does_idExist);
    assert.strictEqual(does_idExist, false);
  });

  test("correctly updating a blog", async () => {
    const blogs = await api.get("/api/blogs");
    const blogsStart = blogs.body;
    const blogToChange = blogsStart[0];

    await api
      .put(`api/blogs/${blogToChange.id}`)
      .send(blogToChange)
      .expect(204)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    const updatedBlog = response.body.find(
      (blog) => blogToChange.id === blog.id,
    );

    assert.strictEqual(blogs.length, response.body.length);
    assert.strictEqual(updatedBlog.id === blogToChange.id, true);
    assert.strictEqual(
      updatedBlog.title === blogToChange.title ||
        updatedBlog.author === blogToChange.author ||
        updatedBlog.url === blogToChange.url,
      false,
    );
  });
});

describe("deletion of a blog", () => {
  test.only("test for successful deletion", async () => {
    const response = await api.get("/api/blogs");
    const blogs = response.body;
    const blogToDelete = blogs[0];

    console.log(blogToDelete.id);
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const responseAfterDeletion = await api.get("/api/blogs");

    const blogsIdsAfterDeletion = responseAfterDeletion.body.map(
      (blog) => blog.id,
    );
    console.log(blogsIdsAfterDeletion);
    assert.strictEqual(blogs.includes(blogsIdsAfterDeletion), false);
    assert.strictEqual(blogsIdsAfterDeletion.length, blogs.length - 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
