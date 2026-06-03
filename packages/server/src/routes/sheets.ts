import type { FastifyInstance } from "fastify";
import type { AppendRowRequest, UpdateRowRequest, ApiResponse } from "@nul/shared";
import * as sheetsService from "../services/sheets.js";

export default async function sheetsRoutes(app: FastifyInstance) {
  const auth = { onRequest: [app.authenticate] };

  // List all sheet names in the spreadsheet
  app.get("/sheets", auth, async (_req, reply) => {
    const sheets = await sheetsService.listSheets();
    return reply.send({ success: true, data: sheets } satisfies ApiResponse<string[]>);
  });

  // Get all rows from a sheet
  app.get<{ Params: { sheetName: string } }>("/sheets/:sheetName", auth, async (req, reply) => {
    const data = await sheetsService.getSheetData(req.params.sheetName);
    return reply.send({ success: true, data });
  });

  // Append a row
  app.post<{ Body: AppendRowRequest }>("/sheets/rows", auth, async (req, reply) => {
    await sheetsService.appendRow(req.body);
    return reply.code(201).send({ success: true });
  });

  // Update a row
  app.put<{ Body: UpdateRowRequest }>("/sheets/rows", auth, async (req, reply) => {
    await sheetsService.updateRow(req.body);
    return reply.send({ success: true });
  });

  // Delete a row
  app.delete<{ Params: { sheetName: string }; Querystring: { rowIndex: string } }>(
    "/sheets/:sheetName/rows",
    auth,
    async (req, reply) => {
      const rowIndex = parseInt(req.query.rowIndex, 10);
      if (isNaN(rowIndex)) {
        return reply.code(400).send({ success: false, error: "Invalid rowIndex" });
      }
      await sheetsService.deleteRow(req.params.sheetName, rowIndex);
      return reply.send({ success: true });
    }
  );
}
