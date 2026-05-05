import { describe, it, expect, vi } from "vitest";
import { authService } from "../src/modules/auth/auth.service";

describe("AuthService", () => {
  it("should define register and login", () => {
    expect(authService.register).toBeDefined();
    expect(authService.login).toBeDefined();
  });
});
