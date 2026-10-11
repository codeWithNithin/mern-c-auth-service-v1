import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        trim: true,
        isEmpty: {
            errorMessage: 'Email is required',
        },
        isEmail: {
            errorMessage: 'Email is not valid',
        },
    },
})
