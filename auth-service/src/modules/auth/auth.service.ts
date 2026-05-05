import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { RegisterInput, LoginInput } from "./auth.schema";
import { logger } from "../../middleware/logger";
import { redis } from "../../cache/redis";

export class AuthService {
  async register(input: RegisterInput) {
    const hashedPassword = await Bun.password.hash(input.password);
    
    const [user] = await db.insert(users).values({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    }).returning();

    logger.info({ userId: user.id }, "User registered");
    return user;
  }

  async login(input: LoginInput) {
    const [user] = await db.select().from(users).where(eq(users.email, input.email));
    
    if (!user) return null;

    const isMatch = await Bun.password.verify(input.password, user.password);
    if (!isMatch) return null;

    logger.info({ userId: user.id }, "User logged in");
    return user;
  }

  async getUserById(id: string) {
    // Check cache first
    const cachedUser = await redis.get(`user:${id}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user) {
      await redis.set(`user:${id}`, JSON.stringify(user), { EX: 3600 });
    }
    return user;
  }
}

export const authService = new AuthService();
