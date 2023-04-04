import mongoose from 'mongoose';

async function connectDB(dbURI) {
    return await mongoose.connect(dbURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
}
async function disconnectDB() {
    return await mongoose.disconnect();
}

export default {
    connectDB: connectDB,
    disconnectDB: disconnectDB,
    connection: mongoose.connection
}