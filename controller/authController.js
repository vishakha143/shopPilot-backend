import User from "../model/userModel.js";
import validator from "validator"
import bcrypt from "bcryptjs"
import { genToken, genToken1 } from "../config/token.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const registration = async (req,res) => {
  try {
    const {name , email, password} = req.body;
    const existUser = await User.findOne({email})
    if(existUser){
        return res.status(400).json({message:"User already exist"})
    }
    if(!validator.isEmail(email)){
         return res.status(400).json({message:"Enter valid Email"})
    }
    if(password.length < 8){
        return res.status(400).json({message:"Enter Strong Password"})
    }
    let hashPassword = await bcrypt.hash(password,10)

    const user = await User.create({name,email,password:hashPassword})
    let token = await genToken(user._id)
    res.cookie("token",token,cookieOptions)
    const { password: _password, ...safeUser } = user.toObject()
    return res.status(201).json(safeUser)
  } catch (error) {
    console.log("registration error")
    return res.status(500).json({message:`registration error ${error}`})
  }
    
}


export const login = async (req,res) => {
    try {
        let {email,password} = req.body;
        let user = await User.findOne({email}) 
        if(!user){
            return res.status(404).json({message:"User is not Found"})
        }
        let isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Incorrect password"})
        }
        let token = await genToken(user._id)
        res.cookie("token",token,cookieOptions)
    const { password: _password, ...safeUser } = user.toObject()
    return res.status(201).json(safeUser)

    } catch (error) {
         console.log("login error")
    return res.status(500).json({message:`Login error ${error}`})
        
    }
    
}
export const logOut = async (req,res) => {
try {
    res.clearCookie("token", cookieOptions)
    return res.status(200).json({message:"logOut successful"})
} catch (error) {
    console.log("logOut error")
    return res.status(500).json({message:`LogOut error ${error}`})
}
    
}


export const googleLogin = async (req,res) => {
    try {
        const { idToken } = req.body;
        if (!idToken || !process.env.FIREBASE_API_KEY) {
          return res.status(400).json({ message: "Firebase sign-in token is required" });
        }

        const verification = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          },
        );
        const verificationData = await verification.json();
        const firebaseUser = verificationData.users?.[0];
        if (!verification.ok || !firebaseUser?.email || !firebaseUser.emailVerified) {
          return res.status(401).json({ message: "Invalid Firebase sign-in token" });
        }

        const email = firebaseUser.email.toLowerCase();
        const name = firebaseUser.displayName || email.split("@")[0];
        let user = await User.findOne({email})
        if(!user){
          user = await User.create({
            name,email
        })
        }
       
        let token = await genToken(user._id)
        res.cookie("token",token,cookieOptions)
    const { password: _password, ...safeUser } = user.toObject()
    return res.status(200).json(safeUser)

    } catch (error) {
         console.log("googleLogin error")
    return res.status(500).json({message:`googleLogin error ${error}`})
    }
    
}


export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD?.trim();

    const reqEmail = email?.trim().toLowerCase();
    const reqPassword = password?.trim();

    if (reqEmail === envEmail && reqPassword === envPassword) {
      const token = await genToken1(reqEmail);

      res.cookie("token", token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

      return res.status(200).json({ message: "Admin login successful" });
    }

    return res.status(400).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log("AdminLogin error:", error);
    return res.status(500).json({ message: "Admin login error" });
  }
};


