import type { FastifyInstance } from "fastify";
import type { LoginRequest, LoginResponse, ApiResponse } from "@nul/shared";
import { getSheetData } from "../services/sheets.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginRequest }>("/auth/login", async (req, reply) => {
    const { username, password } = req.body;

    const sheet = await getSheetData("AUTH");
    console.log(sheet.rows);
    const user = sheet.rows.find(
      (row) => row["Username"] === username && row["Password"] === password
    );

    if (!user) {
      return reply.code(401).send({ success: false, error: "Invalid credentials" });
    }

    const token = app.jwt.sign({ username }, { expiresIn: "7d" });
    return reply.send({ success: true, data: { token } } satisfies ApiResponse<LoginResponse>);
  });
}
