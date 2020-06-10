const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('email is not valid')
            }
        }
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        async validate(val) {
            if (val.includes('password')) {
                throw new Error('password must not include "password"')
            }
        }
    },

    age: {
        type: Number,
        default: 0,
        validate(val) {
            if (val < 0) {
                throw new Error('age must be positive number')
            }
        }
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    userObj = this.toObject()

    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar

    return userObj
}

userSchema.methods.generateToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
    this.tokens.push({ token })
    await this.save()
    return token
}

userSchema.statics.findByCred = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('unable to login')
    }

    const compare = await bcrypt.compare(password, user.password)
    if (!compare) {
        throw new Error('unable to login')
    }

    return user
}

// password hashing
userSchema.pre('save', async function (next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

// deleting corresponding tasks after deleting a user
userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User