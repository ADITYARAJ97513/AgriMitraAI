
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from './mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Avoid model recompilation in Next.js hot-reload environments
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function findUserByUsername(username) {
  await connectDB();
  return User.findOne({ username });
}

export async function createUser({ username, password }) {
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    password: hashedPassword,
  });
  await newUser.save();
  // Return a plain object to avoid passing non-serializable data
  return { id: newUser._id.toString(), username: newUser.username };
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
