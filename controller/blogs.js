const blogRouter = require("express").Router();
const Blog = require("../model/blog");
const User = require("../model/user");

console.log("trexei?");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});

  const blogWithUsernames = await Promise.all(
    blogs.map(async (blog) => {
      try {
        const user = await User.findById(blog.user);
        const username = user.username;
        console.log(user);
        console.log(username);
        console.log(blog);
        console.log({ ...blog.toObject(), user: username });
        return { ...blog.toObject(), user: username };
      } catch (error) {
        return { ...blog, user: "unknown user" };
      }
    }),
  );
  response.json(blogWithUsernames);
});

blogRouter.post("/", async (request, response) => {
  const body = request.body;
  const user = request.user;

  if (!user)
    return response.status(400).json({ error: "userId missing or not valid" });

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const blogCreated = await blog.save();
  user.blogs = user.blogs.concat(blogCreated._id);
  await user.save();

  if (!(blogCreated.url || blogCreated.title)) response.status(400).end();

  response.status(201).json(blogCreated);
});

blogRouter.delete("/:id", async (request, response) => {
  const user = request.user;

  const id = request.params.id;

  const blog = await Blog.findById(id);

  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }

  if (blog.user.toString() === user.id.toString()) {
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
  console.log(id);
  const blog = await Blog.findById(id);

  if (!blog) return response.status(404).end();

  blog.likes = likes || 0;

  const updatedBlog = await blog.save();

  response.status(201).json(updatedBlog);
});

module.exports = blogRouter;
