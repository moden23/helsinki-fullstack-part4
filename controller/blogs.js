const blogRouter = require("express").Router();
const Blog = require("../model/blog");
const User = require("../model/user");
console.log("trexei?");
blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post("/", async (request, response) => {
  const body = request.body;
  console.log(body.userId);
  const user = await User.findById(body.userId);
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
  console.log("den trexei to del");
  const id = request.params.id;
  console.log("trexei to del", id);
  await Blog.findByIdAndDelete(id);
  response.status(204).end();
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
