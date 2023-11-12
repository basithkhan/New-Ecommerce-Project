const errorHandler = require('../utils/errorhandler');
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/usermodel");
const sendTokens = require('../utils/jwtoken');
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//Register a User
exports.registerUser = catchAsyncError(async(req,res,next)=>{
    const{name,email,password}=req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"sample id",
            url:"sample url"
        }
    });
    sendTokens(user,200,res);
});

//Login User
exports.loginUser = catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body;
    // checking is user has given email and password both
    if(!email || !password){
        return next(new errorHandler("please enter email and password",400))
    };
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new errorHandler("user not found please enter valid credentials",401));
    };

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new errorHandler("Wrong Email Adress or Password",401))
    };
    sendTokens(user,200,res);
});

//Logout User
exports.logoutUser = catchAsyncError(async(req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success:true,
        message:"Logged Out Successful"
    })
})

//forgot password
exports.forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new errorHandler("user not found",404))
    };

    //get password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}
    \n if you have not requested to reset password then please ignore`

    try{
        await sendEmail({
            email: user.email,
            sunject: `Shopping App Password reset`,
            message,
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false});
        return next(new errorHandler(error.message, 500))
    }
})

//reset password
exports.resetPassword = catchAsyncError(async(req,res,next)=>{
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},  
    });

    if(!user){
        return next(new errorHandler("reset password token is error or is expired",400));
    };
    if(req.body.password !== req.body.confirmPassword){
        return next(new errorHandler("password did not matches",400));
    };
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendTokens(user, 200, res)

});

//Get User Details
exports.getUserDetails = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    })
})

//Update Password 
exports.updatePassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new errorHandler("Old Password Is Incorrect",400));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new errorHandler("Password Did Not Matched",400));
    }
    user.password = req.body.newPassword;

    await user.save();

    sendTokens(user, 200, res)

})

//Update Profile
exports.updateProfile = catchAsyncError(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
    });
})

//Get All Users
exports.getAllUser = catchAsyncError(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    })
})

//Get Single User
exports.getSingleUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new errorHandler("User Not Found",400))
    }

    res.status(200).json({
        success: true,
        user,
    })
})

//Update Role
exports.updateRole = catchAsyncError(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
        user,
    });
})


//Delete a User
exports.deleteUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new errorHandler(`User Not Found Using Id:${req.params.id}`,400))
    };

    user.deleteOne();

    res.status(200).json({
        success:true,
        message:"User Has Been Deleted"
    })
})