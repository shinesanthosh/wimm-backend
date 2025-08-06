import request from 'supertest'
import { app } from '../../src/index'

describe('User Routes', () => {
  describe('POST /user/login', () => {
    it('should return 400 for missing credentials', async () => {
      const response = await request(app).post('/user/login').send({})

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('required')
    })

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app).post('/user/login').send({
        username: 'nonexistent',
        password: 'wrongpassword',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should return 200 for valid credentials', async () => {
      const response = await request(app).post('/user/login').send({
        username: 'user1',
        password: 'password',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.token).toBeDefined()
    })
  })

  describe('GET /user/me', () => {
    let authToken: string

    beforeAll(async () => {
      const loginResponse = await request(app).post('/user/login').send({
        username: 'user1',
        password: 'password',
      })

      authToken = loginResponse.body.data.token
    })

    it('should return 401 without token', async () => {
      const response = await request(app).get('/user/me')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/user/me')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.username).toBe('user1')
      expect(response.body.data.userId).toBeDefined()
    })
  })
})
