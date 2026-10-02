const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog?.likes;
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  let mostLikesObject = blogs[0];
  blogs.forEach((blog) => {
    if (blog?.likes > mostLikesObject?.likes) mostLikesObject = blog;
  });

  return blogs.length === 0 ? 0 : mostLikesObject;
};

const mostBlogs = (blogs) => {
  const authorsPublishingBlogsFrequency = new Map();

  blogs.forEach((blog) => {
    authorsPublishingBlogsFrequency.set(blog.author, 0);
  });

  blogs.forEach((blog) => {
    if (authorsPublishingBlogsFrequency.has(blog.author)) {
      authorsPublishingBlogsFrequency.set(
        blog.author,
        authorsPublishingBlogsFrequency.get(blog.author) + 1,
      );
    }
  });

  let authorWithMostBlogs = {
    author: "dummyname",
    number: -1,
  };

  for (const [
    author,
    blogsNumber,
  ] of authorsPublishingBlogsFrequency.entries()) {
    if (blogsNumber > authorWithMostBlogs.number) {
      authorWithMostBlogs.author = author;
      authorWithMostBlogs.number = blogsNumber;
    }
  }

  return blogs.length === 0 ? 0 : authorWithMostBlogs;
};

const mostLikes = (blogs) => {
  const likesPerAuthorMap = new Map();

  blogs.forEach((blog) => {
    likesPerAuthorMap.set(blog.author, 0);
  });

  blogs.forEach((blog) => {
    if (likesPerAuthorMap.has(blog.author))
      likesPerAuthorMap.set(
        blog.author,
        likesPerAuthorMap.get(blog.author) + blog.likes,
      );
  });

  let authorWithMostLikes = {
    author: "dummyname",
    likes: -1,
  };
  for (const [author, likes] of likesPerAuthorMap.entries()) {
    if (likes > authorWithMostLikes.likes) {
      authorWithMostLikes.author = author;
      authorWithMostLikes.likes = likes;
    }
  }
  return blogs.length === 0 ? 0 : authorWithMostLikes;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
