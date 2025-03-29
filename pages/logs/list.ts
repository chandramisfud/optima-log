// pages/api/logs/list.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";import { getServerLogger } from "@/utils/logger";
import { ListLogsResponse } from "@/types/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = await getServerLogger();

  if (req.method !== "GET") {
    logger.warn("Invalid method for /api/logs/list", { method: req.method });
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { date, server, env, platform, logType, page = "1", pageSize = "50" } = req.query;
    const params = new URLSearchParams({
      date: date as string,
      server: server as string,
      env: env as string,
      platform: platform as string,
      logType: logType as string,
      page: page as string,
      pageSize: pageSize as string,
    });
    logger.debug("Fetching logs from API", { params: params.toString() });
    const response = await axios.get<ListLogsResponse>(
      `http://localhost:8080/api/logs/list?${params.toString()}`
    );
    logger.info("Logs fetched successfully", { totalCount: response.data.totalCount });
    res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage =
      "Failed to fetch logs: " + (axiosError.response?.data?.message || axiosError.message || "Unknown error");
    logger.error(errorMessage, axiosError);
    res.status(axiosError.response?.status || 500).json({ message: errorMessage });
  }
}