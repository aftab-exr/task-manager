import { Router } from "express";
import { aiDecompile, createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controller.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verfiyJWT, createTask);
router.route("/mytasks").get(verfiyJWT, getTasks);
router.route("/:id/update").put(verfiyJWT,updateTask);
router.route("/:id/delete").delete(verfiyJWT,deleteTask);
router.route("/ai").post(verfiyJWT,aiDecompile);

export default router;