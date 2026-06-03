import type { FastifyInstance } from "fastify";
import type { ApiResponse, SheetData } from "@nul/shared";
import { getSheetData } from "../services/sheets.js";

export default async function charactersRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  app.get<{ Params: { discord: string } }>(
    "/user/:discord/characters",
    auth,
    async (req, reply) => {
      const { discord } = req.params;
      const sheet = await getSheetData("CHARACTERS");

      const filtered: SheetData = {
        ...sheet,
        rows: sheet.rows.filter((row) => {
          const val = row["Discord"] ?? row["discord"];
          return String(val ?? "").toLowerCase() === discord.toLowerCase();
        }),
      };

      console.log(filtered.rows);

      return reply.send({ success: true, data: filtered } satisfies ApiResponse<SheetData>);
    }
  );
}
