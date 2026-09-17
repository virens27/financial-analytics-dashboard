import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminUsername || !adminPasswordHash || !jwtSecret) {
    console.error("Missing auth environment variables");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (username !== adminUsername) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const passwordMatches = await bcrypt.compare(password, adminPasswordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, jwtSecret, { expiresIn: "8h" });
  res.json({ token });
});

export default router;