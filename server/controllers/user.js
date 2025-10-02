import auth from "../config/firebase-config.js";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { _id: 0, __v: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[getUser] Looking for user with uid:`, userId);
    
    let user = await User.findOne({ uid: userId }, { _id: 0, __v: 0 });
    
    if (!user) {
      console.log(`[getUser] No user found in MongoDB, fetching from Firebase...`);
      try {
        // Get user info from Firebase
        const firebaseUser = await auth.getUser(userId);
        
        // Create user in MongoDB
        const newUser = new User({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL
        });
        
        user = await newUser.save();
        console.log(`[getUser] Created new user in MongoDB:`, user);
      } catch (firebaseError) {
        console.error(`[getUser] Firebase lookup failed:`, firebaseError);
        return res.status(404).json({ error: "User not found in Firebase" });
      }
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("[getUser] Error:", error);
    res.status(500).json({ error: "Failed to fetch/create user" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    // Create new user in MongoDB
    const newUser = new User({
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL
    });

    await newUser.save();
    console.log("Created new user in MONGODB");
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
