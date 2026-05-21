import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verfiyJWT = asyncHandler(async (req, res, next) => {
    try {
        // 1. Grab the token from the cookies (or headers if using mobile app)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Incoming Cookies: ", req.cookies);
        console.log("Incoming Token: ", token);
        if (!token) {
            throw new apiError(401, "Unauthorized request");
        }

        // 2. Verify the token using your secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 3. Find the user in the database based on the _id inside the token
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new apiError(401, "Invalid Access Token");
        }

        // 4. THE MAGIC TRICK: Attach the user object to the request
        req.user = user;
        
        // 5. Pass the baton to the next function (the controller)
        next();
        
    } catch (error) {
        throw new apiError(401, "Unauthorized");
    }
})

export { verfiyJWT };