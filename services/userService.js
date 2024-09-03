import User from "../models/User.js";

async function findUserById(id) {
  try {
    return await User.findOne({ id });
  } catch (error) {
    console.error("User not found:", error.message);
  }
}

export {
  findUserById
}