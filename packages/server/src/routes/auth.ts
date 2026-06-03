import type { FastifyInstance } from "fastify";
import type { LoginRequest, LoginResponse, ApiResponse } from "@nul/shared";

export default async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginRequest }>("/auth/login", async (req, reply) => {
    const { username, password } = req.body;

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return reply.code(401).send({ success: false, error: "Invalid credentials" });
    }

    const token = app.jwt.sign({ username }, { expiresIn: "7d" });
    return reply.send({ success: true, data: { token } } satisfies ApiResponse<LoginResponse>);
  });
}
