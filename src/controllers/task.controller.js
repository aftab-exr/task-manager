import { Task } from "../models/task.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";

const createTask = asyncHandler(async (req, res) => {
    // Note: We changed 'const' to 'let' for priority so the AI can override it!
    let { title, description, status, priority } = req.body; 
    
    if (!(title && description && status && priority)) {
        throw new apiError(400, "All fields are required");
    }

    // --- THE AI TRIAGE INTERCEPT ---
    try {
        // Send the description through the tunnel to your local RAM
        const triageResponse = await axios.post('https://silent-taxis-unite.loca.lt/api/v1/triage', {
            mission_brief: description
        }, {
            headers: { "Bypass-Tunnel-Reminder": "true" }
        });

        // If the AI detects a catastrophic bug, it forces the priority to High
        if (triageResponse.data && triageResponse.data.priority === "High") {
            console.log(`[AI_OVERRIDE]: Task "${title}" upgraded to HIGH priority.`);
            priority = "High";
        }
    } catch (error) {
        // If your laptop is offline, the server just ignores the AI and uses the user's input
        console.error("AI Triage Offline, proceeding with standard priority.");
    }
    // -------------------------------

    const newTask = await Task.create({
        title,
        description,
        status,
        priority, // This is now either the user's choice OR the AI's override
        userId: req.user._id
    });

    const createdTask = await Task.findById(newTask._id);
    if (!createdTask) {
        throw new apiError(500, "Something Went Wrong");
    }

    return res.status(201).json(new apiResponse(201, "Task created successfully", createdTask));
});

const getTasks = asyncHandler(async (req, res) => {
    const myTasks = await Task.find({userId: req.user._id});

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

const aiDecompile = asyncHandler(async (req, res) => {
    const { mission_brief } = req.body;
    
    if (!mission_brief) {
        throw new apiError(400, "MISSION_BRIEF required for AI fragmentation.");
    }

    try {
        // 1. Send the brief to your Python Microservice
        const aiResponse = await axios.post('https://silent-taxis-unite.loca.lt/api/v1/breakdown', {
            mission_brief
        },{
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });

        const subTasks = aiResponse.data.nodes; // The JSON array from Python

        // 2. Map the array into MongoDB documents mapped to your schema
        const tasksToCreate = subTasks.map(title => ({
            title: title,
            description: `Auto-fragmented from: ${mission_brief.substring(0, 50)}...`,
            status: 'Pending',
            priority: 'Medium',
            userId: req.user._id // Binding to the active session user
        }));

        // 3. Bulk insert them into MongoDB Atlas
        const createdTasks = await Task.insertMany(tasksToCreate);

        return res.status(201).json(
            new apiResponse(201, "AI Fragmentation Complete", createdTasks)
        );

    } catch (error) {
        console.error("AI Bridge Error:", error.message);
        throw new apiError(503, "Local AI Engine Offline or Unresponsive.");
    }
});

export {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    aiDecompile
}
