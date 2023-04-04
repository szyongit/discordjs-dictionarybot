import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    data: {
        type: "",
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);