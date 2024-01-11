import express, { Request, Response } from 'express'
import router from '../routes'
import request from 'supertest'
import contactModel from '../models/contact'
const app = express()
app.use(express.json())
app.use('/insights', router)


describe('Contact API Tests', () => {
  const mockedFindOne = jest.spyOn(contactModel, 'findOne')
  const mockedCreate = jest.spyOn(contactModel, 'create')
  const mockedFind = jest.spyOn(contactModel, 'find')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /insights', () => {
    it('should add data successfully', async () => {
      mockedFindOne.mockResolvedValueOnce(null);

      mockedCreate.mockImplementation(()=>{
        return new Promise((resolve)=> resolve({ name:"John Doe" , email: ""}))
      })
  
      const response = await request(app)
        .post('/insights')
        .send({ email: 'test@example.com', phoneNumber: 1234567890 });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Data Added Successfully',
      });
  
      expect(contactModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        phoneNumber: 1234567890,
        linkPrecedence: 'primary',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  
    it('should add data with secondary linkPrecedence if data exists', async () => {
      mockedFindOne.mockResolvedValueOnce({ _id: 'existingId' });
  
      const response = await request(app)
        .post('/insights')
        .send({ email: 'test@example.com', phoneNumber: 1234567890 });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Data Added Successfully',
      });
  
      expect(contactModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        phoneNumber: 1234567890,
        linkPrecedence: 'secondary',
        linkedId: 'existingId',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  
    it('should handle invalid data', async () => {
      const response = await request(app)
        .post('/insights')
        .send({ email: null, phoneNumber: 1234567890 });
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Invalid Data',
      });
  
      expect(contactModel.create).not.toHaveBeenCalled();
    });
  
    it('should handle internal server error', async () => {
      mockedFindOne.mockRejectedValueOnce(new Error('Mock Error'));
  
      const response = await request(app)
        .post('/insights')
        .send({ email: 'test@example.com', phoneNumber: 1234567890 });
  
      expect(response.status).toBe(500);
      expect(contactModel.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    it('should return data successfully', async () => {
      mockedFind.mockResolvedValueOnce([
        {
          _id: 'primaryContactId',
          email: 'primary@example.com',
          phoneNumber: 1234567890,
        },
      ])

      mockedFind.mockResolvedValueOnce([
        {
          email: 'secondary@example.com',
          phoneNumber: 9876543210,
        },
      ]);

      const response = await request(app).get('/insights')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        {
          email: 'primary@example.com',
          phoneNumber: 1234567890,
          secondaryContact: [
            {
              email: 'secondary@example.com',
              phoneNumber: 9876543210,
            },
          ],
        },
      ])
    })

    it('should handle errors and return 500 status', async () => {
      mockedFind.mockRejectedValueOnce(new Error('Mocked error'))

      const response = await request(app).get('/insights')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        message: 'Mocked error',
      })
    })
  })
})
