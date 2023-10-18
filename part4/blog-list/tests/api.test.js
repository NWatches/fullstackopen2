const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('blog posts returned', async () => {
	const response = await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)

	console.log(response.body)
})

test('verifies unique identifier property is named id', async() => {
	const response = await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)

	const posts = response.body
	expect(posts[0].id).toBeDefined()
})

test('verifies if like property is missing', async() => {
	const response = await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)

	const posts = response.body
	if (!posts[0].likes) {
		expect(response.body.likes).toBe(0)
	} else {
		expect(posts[0].likes.toBeDefined)
	}
})

test('verifies making POST request successfuly creates new blog post', async() => {
	const newPost = {
		'title': 'Test Blog',
		'author': 'Squirrel Girl',
		'url': 'https://squirrel.com/girl',
		'likes': 923
	}

	const initialResponse = await api.get('/api/blogs')
	const initialLength = initialResponse.body.length

	await api
		.post('/api/blogs')
		.send(newPost)
		.expect(201)

	const updatedBlog = await api.get('/api/blogs')
	const updatedLength = updatedBlog.body.length
	expect(updatedLength).toBe(initialLength + 1)
})

test('verifies if likes property is missing from request, default will be 0', async() => {
	const newPost = {
		'title': 'Default Likes Test Blog',
		'author': 'Harry Mason',
		'url': 'https://mydaughter.com/cheryl'
	}

	await api
		.post('/api/blogs')
		.send(newPost)
		.expect(201)

	const response = await api.get('/api/blogs')
	const newBlogPost = response.body.find(blog => blog.title == newPost.title)
	expect(newBlogPost.likes).toBe(0)
})

test('verifies that posts sent with title or url missing return 400 Bad Request status codes', async() => {
	const newPost = {
		'author': 'Anon Y Mouse',
		'likes': 149
	}

	await api
		.post('/api/blogs')
		.send(newPost)
		.expect(400)
})

afterAll(async () => {
	await mongoose.connection.close()
})

test('deletes a post', async() => {
	const newBlog = {
		'title': 'Delete Blog',
		'author': 'Pearl Krabs',
		'url': 'https://pearl.com/money',
		'likes': 420
	}

	const response = await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)

	const blogID = response.body.id
	
	await api
		.delete(`/api/blogs/${blogID}`)
		.expect(204)

	const verifyResponse = await api.get(`/api/blogs/${blogID}`)

	expect(verifyResponse.status).toBe(404)
})