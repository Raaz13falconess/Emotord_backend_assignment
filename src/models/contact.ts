import {Schema,model,Types} from 'mongoose'

const contactSchema=new Schema({
    phoneNumber: {type:Number,required: true},
    email: {type:String,required: true},
    linkedId: {type: Types.ObjectId,ref:'contact',default: null},
    linkPrecedence: {type: String,required: true,enum:['primary','secondary']},
    createdAt: {type: Date},
    updatedAt: {type: Date},
    deletedAt: {type: Date}
})

const contactModel=model('contact',contactSchema)

export default contactModel