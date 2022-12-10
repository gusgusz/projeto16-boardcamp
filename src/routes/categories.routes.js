import { Router } from "express";
import { showCategories } from "../controllers/categories.controllers.js";

const router = Router();

router.get("/categories", showCategories);


export default router;