import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something when wrong while generating refresh and access toekn")
    }
}







const registerUser = asyncHandler( async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })
    // console.log("FILES =>", req.files);
   // console.log("BODY  =>", req.body);
//    console.log(req.files.avatar)
// console.log("Files:", req.files);
// console.log("Avatar Path:", req.files.avatar?.[0]?.path);


    // get user details front frontend
    //validation - not empty
    //check if user already exists : username, email
    //check for image and avatar
    // upload them to cloudinary, check avatar again
    // create user object - create entry in db
    // remove password and refresh token field from responce
    // check for user creation
    //return responce
    // else return error

    const {fullname,email,username,password} = req.body
    // if (fullname=== "") {
    //     throw new ApiError(400,"Fullname is required")
    // }

    if(
        [fullname,email,password,username].some((field)=>(field?.trim()===""))
    ){
        throw new ApiError(400,"All fields are compulsory")
    }
const userExisted = await User.findOne({
        $or: [{ username },{ password }]
    })
    if(userExisted){
        throw new ApiError(409,"User with email or username already exists")
    }

   const avatarLocalPath =   req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length >0){
    coverImageLocalPath = req.files.coverImage[0].path
}



   if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }

   const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })

   const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!userCreated){
    throw new ApiError(500,"Something went wrong while registering a user")
   }

   return res.status(201).json(
    new ApiResponse(200,userCreated,"User registered Successfully")
   )
})

const loginUser = asyncHandler(async(req,res)=>{
        //req body ->data
        //username or email
        //find the user
        //password check 
        //access and refresh token
        //send cookies and send responce that login successfull


        const {username,email,password} = req.body;
        if((!username && !email)){
            throw new ApiError(400,"Username or email is required");
        }

        const user = await User.findOne({
            $or: [{ username },{ email }]
        });

        if (!user) {
            throw new ApiError(404,"User doesnt exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401,"Invalid user credentials ")
        }

        const  {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser, accessToken , refreshToken
                },
                "User Logged In successfully"
            )
        )
        


})
   
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
            {
                new: true
            }
        
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User LoggedOut"))
})






export {registerUser,
        loginUser,
        logoutUser
}