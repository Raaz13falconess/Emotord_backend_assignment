import contactModel from '../models/contact'
import { Request, Response } from 'express'

export const addData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, phoneNumber } = req.body

    if (email === null || phoneNumber === null)
      return res.status(400).json({ message: 'Invalid Data' })

    if (!email.includes('@') || typeof email !== 'string')
      return res.status(400).json({ message: 'Invalid Email' })

    if (typeof phoneNumber !== 'number')
      return res.status(400).json({ message: 'Invalid Phone Number' })

    const data = await contactModel.findOne({
      $or: [
        { $and: [{ email: email }, { linkPrecedence: 'primary' }] },
        { $and: [{ phoneNumber: phoneNumber }, { linkPrecedence: 'primary' }] },
      ],
    })

    if (data) {
      await contactModel.create({
        email: email,
        phoneNumber: phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: data._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      await contactModel.create({
        email: email,
        phoneNumber: phoneNumber,
        linkPrecedence: 'primary',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return res.status(200).json({ message: 'Data Added Successfully' })
  } catch (e) {
    
    return res
      .status(500)
      .json({ message: e?.message || 'Internal Server Error' })
  }
}

export const getData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data = await contactModel.find({ linkPrecedence: 'primary' })
    let resp: Array<{
      email: string
      phoneNumber: number
      secondaryContact: Array<{
        email: string
        phoneNumber: number
      }>
    }> = []

    for (let i = 0; i < data.length; i++) {
      const secondaryContact = await contactModel
        .find({ linkedId: data[i]._id })

      resp.push({
        email: data[i].email,
        phoneNumber: data[i].phoneNumber,
        secondaryContact: secondaryContact,
      })
    }

    return res.status(200).json(resp)
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ message: e?.message || 'Internal Server Error' })
  }
}
