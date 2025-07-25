import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/car.js";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

export const registerUser = async (req, res)=> {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password || password.length>8){
            return res.json({success: false, message: "Fill all fields"});
        }
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.json({success: false, message: "User already exists"});
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashedPassword});
        
        const token = generateToken(user._id.toString());
        res.json({success: true, message: "User registered successfully", token});
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error in registration"});
    }
}

export const loginUser = async (req, res)=> {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: "Invalid credentials"});
        }
        const token = generateToken(user._id.toString());
        res.json({success: true, message: "User logged in successfully", token});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error in login"});
    }
}

export const getUserData = async (req, res) => {
    try {
        const {user} = req;
        res.json({success: true, user});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error in fetching user data"});
    }
}

export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({isAvailable: true});
        res.json({success: true, cars});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: "Error in fetching cars"});
    }
}