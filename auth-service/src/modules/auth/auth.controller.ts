import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { registerSchema, loginSchema } from "./auth.schema";
import { authService } from "./auth.service";
import { sign } from "hono/jwt";
import { config } from "../../config";

const auth = new Hono();

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const input = c.req.valid("json");
  try {
    const user = await authService.register(input);
    return c.json({ message: "User registered successfully", userId: user.id }, 201);
  } catch (error: any) {
    return c.json({ error: error.message || "Registration failed" }, 400);
  }
});

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const input = c.req.valid("json");
  const user = await authService.login(input);

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const payload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  };

  const token = await sign(payload, config.JWT_SECRET, "HS256");

  return c.json({ message: "Login successful", token });
});

export { auth as authController };
