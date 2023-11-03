const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const uploader = require("../config/cloudinary.config");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { param } = require("express-validator");
/**
 * @rout POST /blog
 * @description create a new blog
 * @body (name, description,category)
 * @access Login required, Admin
 */

router.post(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,
  blogController.createBlog
);

/**
 * @rout GET /blog
 * @description Get all blogs.
 * @access Public
 */
router.get(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,
  blogController.getBlogs
);

/**
 * @rout GET /blog
 * @description Get all blogs.
 * @access Public
 */
router.get("/:bid", blogController.getSingleBlog);
/**
 * @rout PUT /blog/like/:bid
 * @description Like or dislike a blog
 * @body (bid)
 * @access Login required
 */
router.put("/like/:bid", authentication.loginRequired, blogController.likeBlog);
/**
 * @rout PUT /blog/dislike/:bid
 * @description  dislike a blog
 * @body (bid)
 * @access Login required
 */
router.put(
  "/dislike/:bid",
  authentication.loginRequired,
  blogController.dislikeBlog
);
/**
 * @rout PUT /blog/uploadimage/:id
 *
 * @description Upload images for a blog by blog id
 * @access Login required,Admin
 */
router.put(
  "/uploadimage/:bid",
  authentication.loginRequired,
  authentication.isAdmin,
  uploader.single("images"),
  blogController.uploadImageBlog
);

/**
 * @rout PUT /blog
 * @description Update blog
 * @body (name, description,category)
 * @access Login required, Admin
 */
router.put(
  "/:bid",
  authentication.loginRequired,
  authentication.isAdmin,
  blogController.updateBlog
);

/**
 * @rout DELETE /products/:id
 * @description Delete a single product by id
 * @access Private - Admin
 */
router.delete(
  "/:bid",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("bid").exists().isString().custom(validators.checkObjectId),
  ]),
  blogController.deleteBlog
);

module.exports = router;
