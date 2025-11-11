import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['lawyer', 'assistant', 'admin'], default: 'lawyer' },
  barNumber: { type: String },
  firm: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.methods.verifyPassword = async function(password) {
  // Check if password hash exists
  if (!this.passwordHash) {
    console.error(`verifyPassword: User ${this._id} has no passwordHash`);
    return false;
  }
  
  // Check if password is provided
  if (!password) {
    return false;
  }
  
  // Verify the password hash format (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (!this.passwordHash.startsWith('$2')) {
    console.error(`verifyPassword: User ${this._id} has an invalid password hash format`);
    return false;
  }
  
  try {
    return await bcrypt.compare(password, this.passwordHash);
  } catch (error) {
    console.error(`verifyPassword error for user ${this._id}:`, error);
    return false;
  }
};

userSchema.statics.hashPassword = function(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export default mongoose.model('User', userSchema);



