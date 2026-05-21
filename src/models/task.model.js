import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: ["Pending"]
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: ["Low"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps: true});

taskSchema.pre("save", function(next){
    if (!this.isModified("title")) return next();
    next();
})

export const Task = mongoose.model("Task", taskSchema);