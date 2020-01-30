const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const request = require('supertest')
const sandbox = sinon.createSandbox()

const app = require('../app')

describe('AUTH', () => {
  afterEach(() => {
    sandbox.restore()
  })
  context('GET /api/v1/auth/google', () => {
    it('should redirect to google oauth page', (done) => {
      request(app).get('/api/v1/auth/google')
        .expect(302)
        .end((err, res) => {
          done(err)
        })
    })
  })
})
