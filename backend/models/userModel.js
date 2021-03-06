import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false
    },
    billingAddress: {
        type: String,
        required: false,
        default: ''
    },
    billingCity: {
        type: String,
        required: false,
        default: ''
    },
    billingState: {
        type: String,
        required: false,
        default: ''
    },
    billingZip: {
        type: String,
        required: false,
        default: ''
    },
    billingCountry: {
        type: String,
        required: false,
        default: ''
    }
}, {timestamps: true});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;