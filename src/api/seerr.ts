// src/api/hello.ts
import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from API!" });
});

export default router;
