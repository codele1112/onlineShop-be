### Overview

## User stories

### Authentication

- As a user, I can register for a new account with name, email, password.
- As a user, I can sign in with email and password. (google)

### Users

- As a user, I can get my current profile info (stay signed in after page refresh)
- As a user, I can see the profile of a specific user given a user ID
- As a user, I can update my profile info like Avatar, Address, Phone.
- As a admin, I can delete a user

### Products

CRUD

- As a user, I can see a list of products,category,
- As a user, I can see a single products with name, image, description, price, stock, rating, reviews
- As a user(admin), I can create a new product with name, image, description, price, stock, rating, reviews, category.
- As a user(admin), I can edit my products.
- As a user(admin), I can delete my products.

### Cart

CRUD

- As a user, I can add a product in the cart.
- As a user, I can see a list of products which I added in the cart.
- As a user, I can edit the quatity of product
- As a user, I can remove a product from the cart.
- As a user, I can see total price
- As a user, I can see pay for cart

### Category

<!-- admin CRUD
USER : filter search by category -->

### Reviews

- As a user, I can write review on a product.
- As a user, I can see a list of reviews.
- As a user, I can edit my reviews.
- As a user, I can delete my reviews.

### Rating

<!-- - As a user, I can rate my product I bought.
- As a user, I can edit rate my product I bought. -->

## Endpoint APIs

### Auth APIs

- @rout POST /auth/login
- @description Login with username and password.
- @body (email, password)
- @access Public

### User APIs

- @rout POST /users
- @description Register new user
- @body (name, email, password, address)
- @access Public

- @rout GET /users?page=1&limit=10
- @description get all users with pagination
- @body (name, email, password)
- @access Login required

- @rout GET /users/me
- @description get current user info
- @access Login required

- @rout GET /users/:id
- @description get a user profile
- @access Login required

- @rout PUT /users/:id
- @description Update user profile
- @body (name, avatarUrl, coverUrl,aboutme, city, country, company, job title, facebookLink,InstagramLink, LinkedInLink,...)
- @access Login required

### Products APIs

- @rout GET /products/user.:userId?page=1&limit=10
- @description get all products a user can see with pagination
- @access Login required

- @rout POST /pproducts
- @description create a new product
- @body (content, image)
- @access Login required - admin

- @rout PUT /products/:id
- @description update a product
- @body (content, image)
- @access Login required -admin

- @rout DELETE /posts/:id
- @description Delete a product
- @access Login required -admin

- @rout GET /products/:id
- @description Get a single product
- @access Login required

### Review APIs

- @rout POST /comments
- @description create a new comment
- @body {content, postId}
- @access Login required

- @rout PUT /comments/:id
- @description update a comment
- @access Login required

- @rout DELETE /comments/:id
- @description delete a comment
- @access Login required

- @rout GET /comments/:id
- @description get detail of a comment
- @access Login required

### Rating APIs
