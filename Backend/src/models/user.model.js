import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    profileImage: {
      type: String,
      default: "",
    },

    githubLink: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinLink: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      trim: true,
      default: "",
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// hash password before saving
userSchema.pre("save", async function () {                      
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);        // hash the password with a salt round of 10
});

// compare password
userSchema.methods.isPasswordCorrect = async function (password) {               
  return await bcrypt.compare(password, this.password);
};

// generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);