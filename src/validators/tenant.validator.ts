import { checkSchema } from 'express-validator'

export default checkSchema({
    name: {
        trim: true,
        notEmpty: {
            errorMessage: 'tenant name is required',
        },
    },
    address: {
        trim: true,
        notEmpty: {
            errorMessage: 'tenant address is required',
        },
    },
})
