import { Task } from "../models/task.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTask = asyncHandler(async (req, res) =>{
    const {title, description, status, priority} = req.body;
    if (!(title && description && status && priority)) {
        throw new apiError(400, "All fields are required");
    }

    const newTask = await Task.create({
        title,
        description,
        status,
        priority,
        userId: req.user._id
    })

    const createdTask = await Task.findById(newTask._id);
    if (!createdTask) {
        throw new apiError(500, "Something Went Wrong")
    }

    return res.status(201)
    .json( new apiResponse(201, "Task created successfully", createdTask) );


})

const getTasks = asyncHandler(async (req, res) => {
    const myTasks = Task.find({createdTask: req.user._id});

    return res.status(201)
    .json(
        new apiResponse(201, "Tasks fetched successfully", myTasks)
    )
})

const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const {title, description, status, priority} = req.body;
    if (!(title && description && status && priority)) {
        throw new apiError(400, "All fields are required");
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            title,
            description,
            status,
            priority
        },
        { new : true}
    )
    if(!updatedTask){
        throw new apiError(404, "Task not found");
    }

    return res.status(200)
    .json(
        new apiResponse(200, "Task updated successfully", updatedTask)
    )
})

const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    if(!taskId){
        throw new apiError(400, "Task id is required");
    }

    const deletedTask = await Task.findByIdAndDelete(taskId);
    if(!deletedTask){
        throw new apiError(404, "Task not found");
    }

    return res.status(200)
    .json(
        new apiResponse(200, "Task deleted successfully", deletedTask)
    )
})

export {
    createTask,
    getTasks,
    updateTask,
    deleteTask
}
