import axios from "axios";

import { CommandResponse, DashboardResponse, HistoryResponse } from "../types/api";

export function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    timeout: 6000
  });

  return {
    async getDashboard() {
      const response = await client.get<DashboardResponse>("/api/dashboard");
      return response.data;
    },
    async getHistory(limit = 40) {
      const response = await client.get<HistoryResponse>("/api/readings/history", {
        params: { limit }
      });
      return response.data;
    },
    async sendCommand(path: string) {
      const response = await client.post<CommandResponse>(path);
      return response.data;
    }
  };
}
