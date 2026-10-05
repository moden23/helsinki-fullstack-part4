const jwt = require("jsonwebtoken");
const blogRouter = require("express").Router();
const Blog = require("../model/blog");
const User = require("../model/user");
console.log("trexei?");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "invalid token" });
  }

  const body = request.body;
  const user = await User.findById(decodedToken.id);
  console.log(user);
  if (!user)
    return response.status(400).json({ error: "userId missing or not valid" });

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.number || 0,
    user: user._id,
  });

  const blogCreated = await blog.save();
  user.blogs = user.blogs.concat(blogCreated._id);
  await user.save();

  if (!(blogCreated.url || blogCreated.title)) response.status(400).end();

  response.status(201).json(blogCreated);
});

blogRouter.delete("/:id", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "invalid token" });
  }

  const id = request.params.id;

  const blog = await Blog.findById(id);

  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blog.user.toString() === decodedToken.id.toString()) {
    await Blog.findByIdAndDelete(id);
    return response.status(204).end();
  }

  return response
    .status(401)
    .json({ error: "invalid user, user cant delete an id he didnt created" });
});

blogRouter.put("/:id", async (request, response) => {
  const { likes } = request.body;
  const id = request.params.id;
  const blog = await Blog.findById(id);

  if (!blog) return response.status(404).end();

  blog.likes = likes || 0;

  const updatedBlog = blog.save();
  response.status(201).json(updatedBlog);
});

module.exports = blogRouter;
