const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const request = require('supertest')
const sandbox = sinon.createSandbox()

const { Book } = require('../models/book')
const path = require('path')
const cloudinaryService = require('../services/cloudinary')
const passport = require('passport')

describe('BOOKS', () => {
  const userId = 1
  before(() => {
    const fakeAuth = (req, res, next) => {
      req.user = {
        id: userId
      }
      return next()
    }
    sandbox.stub(passport, 'authenticate').returns(fakeAuth)
    // have to delete caches, otherwise there is no way to stub auth middleware
    delete require.cache[require.resolve('../routes/books.js')]
    delete require.cache[require.resolve('../app.js')]

    this.app = require('../app')
  })
  afterEach(() => {
    sandbox.restore()
  })
  context('GET  /api/v1/books', () => {
    it('should get books', (done) => {
      const books = [
        {
          currentOwner: '123',
          name: 'ML Basics',
          author: 'John Doe',
          description: 'This book is about love between john doe and female spider called jane doe',
          img: 'https://images-na.ssl-images-amazon.com/images/I/91OME-jyFmL.jpg',
          nextOwner: '345'
        },
        {
          name: 'Advanced Javascript',
          author: 'Jane Doe',
          description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
          img: 'https://images.squarespace-cdn.com/content/v1/54d262dde4b02fc9b49ecf9c/1522975869432-RRNG4FPX0LCJD205NT88/ke17ZwdGBToddI8pDm48kEuv4Y4t3q1rAAZ3bBSUazl7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QPOohDIaIeljMHgDF5CVlOqpeNLcJ80NK65_fV7S1US9-0cW5aPUUMJ-3sw1AVU3jPrGIyYMQT1mVx6iI98dTG6v6ULRah83RgHXAWD5lbQ/Atthegoingdownofthesun_mockup.png'
        }
      ]
      const getBooksStub = sandbox.stub(Book, 'find').returns({
        exec: () => books
      })
      request(this.app).get('/api/v1/books')
        .expect(200)
        .end((err, res) => {
          expect(getBooksStub).to.have.been.calledOnce
          expect(res.body).to.have.lengthOf(2)
          expect(res.body[0]).to.have.property('name').to.equal('ML Basics')
          done(err)
        })
    })
  })
  context('POST  /api/v1/books', () => {
    it('should create a book', (done) => {
      const book = {
        name: 'name',
        author: 'author',
        description: 'desc',
        img: 'cloudinary.png'
      }
      const createBookStub = sandbox.stub(Book, 'create').resolves(book)
      const uploadImageStub = sandbox.stub(cloudinaryService, 'uploadImage').resolves({ url: book.img })
      request(this.app).post('/api/v1/books')
        .field('name', book.name)
        .field('author', book.author)
        .field('description', book.description)
        .attach('img', path.join(__dirname, 'files', 'img.jpg'))
        .expect(200)
        .end((err, res) => {
          expect(createBookStub).to.have.been.calledOnce
          expect(uploadImageStub).to.have.been.calledOnce
          expect(res.body).to.have.property('img').to.equal(book.img)
          expect(res.body).to.have.property('name').to.equal(book.name)
          done(err)
        })
    })
    it('should throw validation error', (done) => {
      request(this.app).post('/api/v1/books')
        .field('name', 'name')
        .expect(400)
        .end((err, res) => {
          done(err)
        })
    })
    it('should throw mime type error', (done) => {
      request(this.app).post('/api/v1/books')
        .field('name', 'name')
        .field('author', 'author')
        .field('description', 'desc')
        .attach('img', path.join(__dirname, 'files', 'text.txt'))
        .expect(400)
        .end((err, res) => {
          expect(res.body.error.message).to.have.been.equal('invalid mime type or field name')
          done(err)
        })
    })
  })
  context('PUT  /api/v1/books/:id/own', () => {
    it('should become the owner of book', (done) => {
      const book = {
        name: 'name',
        author: 'author',
        img: 'img.png',
        description: 'desc'
      }
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => {
          return {
            ...book,
            save () { return this }
          }
        }
      })
      request(this.app).put('/api/v1/books/123/own')
        .expect(200)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123' })
          expect(res.body).to.have.property('name').to.equal('name')
          expect(res.body).to.have.property('currentOwner').to.equal(userId)
          done(err)
        })
    })
    it('should throw validation error, since book has an owner already', (done) => {
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => {
          return {
            currentOwner: 2
          }
        }
      })
      request(this.app).put('/api/v1/books/123/own')
        .expect(400)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123' })
          expect(res.body.error.message).to.have.been.equal('the book already has an owner')
          done(err)
        })
    })
    it('should throw validation error, since next owner is somebody else', (done) => {
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => {
          return {
            nextOwner: 2
          }
        }
      })
      request(this.app).put('/api/v1/books/123/own')
        .expect(400)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123' })
          expect(res.body.error.message).to.have.been.equal('the book is reservated by somebody else')
          done(err)
        })
    })
    it('should transfer next owner to current owner', (done) => {
      const book = {
        nextOwner: 1
      }
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => {
          return {
            ...book,
            save () { return this }
          }
        }
      })
      request(this.app).put('/api/v1/books/123/own')
        .expect(200)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123' })
          expect(res.body).to.have.property('nextOwner').to.equal(null)
          expect(res.body).to.have.property('currentOwner').to.equal(userId)
          done(err)
        })
    })
  })
  context('PUT  /api/v1/books/:id/unown', () => {
    it('should unown the book', (done) => {
      const book = {
        name: 'name',
        currentOwner: userId
      }
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => {
          return {
            ...book,
            save () { return this }
          }
        }
      })
      request(this.app).put('/api/v1/books/123/unown')
        .expect(200)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123', currentOwner: userId })
          expect(res.body).to.have.property('name').to.equal('name')
          expect(res.body).to.have.property('currentOwner').to.equal(null)
          done(err)
        })
    })
    it('should throw validation error if the book is owned by somebody else', (done) => {
      const findBookStub = sandbox.stub(Book, 'findOne').returns({ exec: () => null })
      request(this.app).put('/api/v1/books/123/unown')
        .expect(400)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123', currentOwner: userId })
          expect(res.body.error.message).to.have.been.equal('the book is owned by somebody else')
          done(err)
        })
    })
  })
  context('PUT /api/v1/books/:id/reservate', () => {
    it('should reservate the book', (done) => {
      const book = {
        name: 'name'
      }
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => {
          return {
            ...book,
            save () { return this }
          }
        }
      })
      request(this.app).put('/api/v1/books/123/reservate')
        .expect(200)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123' })
          expect(res.body).to.have.property('name').to.equal('name')
          expect(res.body).to.have.property('nextOwner').to.equal(userId)
          done(err)
        })
    })
    it("should throw validation error if book is already reservated or doesn't exist", (done) => {
      const findBookStub = sandbox.stub(Book, 'findOne').returns({
        exec: () => null
      })
      request(this.app).put('/api/v1/books/123/reservate')
        .expect(400)
        .end((err, res) => {
          expect(findBookStub).to.have.been.calledWith({ _id: '123' })
          expect(res.body.error.message).to.have.been.equal("the book doesn't exist or it's already reservated")
          done(err)
        })
    })
  })
})
