import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    // Get User Details
    const {username, email, password, fullName} = req.body;
    // Validate Details
    if (!(username && email && password && fullName)) {
        throw new apiError(400, "All fields are required");
    }
    // Check user existed
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser){
        throw new apiError(400, "User already existed");
    };

    // Create new user
    const newUser = await User.create({
        username: username.lowercase(),
        email,
        password,
        fullName
    });
    // Fetch New User
    const createdUser = await User.findById(newUser._id).select("-password");

    if (!createdUser) {
        throw new apiError(500, "Something Went Wrong")
    }
    // Send Respone
    return res.status(201)
    .json( new apiResponse(201, "User registered successfully", createdUser) );
    
})

const loginUser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body;
    if (!(username || email || password)) {
        throw new apiError(400, "All fields are required");
    }
    
    const existedUser = await User.findOne({
        $or: [{username: username.lowercase()},{email}]
    })

    if (!existedUser) {
        throw new apiError(404, "User not found");
    }

    const isMatch = await existedUser.comparePassword(password);
    if (!isMatch) {
        throw new apiError(401, "Invalid credentials");
    }

    const token = existedUser.generateToken();

    const loggedInUser = await User.findById(existedUser._id).select("-password")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .cookie("token", token, options)
    .json( new apiResponse(200, "User logged in successfully", loggedInUser) );
})

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("token", options)
    .json(
        new apiResponse(200, "User logged out Succesfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser
}