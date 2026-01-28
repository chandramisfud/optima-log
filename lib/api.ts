// lib/api.ts
import axios, { type AxiosInstance, type AxiosResponse } from "axios"
import type { User, ChangePasswordRequest, ChangePasswordResponse, ProfilePictureResponse } from "../types/user"
import type { LogFile, LogListResponse, LogSearchResult } from "../types/log"
import type { BackupFile } from "../types/backup"
import type { MandrillActivityResponse } from "../types/mandrill"

const api: AxiosInstance = axios.create({
  baseURL: "https://apioptima-log.xva-rnd.com",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle errors (e.g., 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  },
)

export const getUsers = (): Promise<AxiosResponse<User[]>> => {
  return api.get("/api/users")
}

export const login = (email: string, password: string): Promise<AxiosResponse<{ token: string; user: User }>> => {
  return api.post("/api/users/login", { email, password })
}

export const getUserProfile = (): Promise<AxiosResponse<User>> => {
  return api.post("/api/users/me")
}

export const changePassword = (data: ChangePasswordRequest): Promise<AxiosResponse<ChangePasswordResponse>> => {
  return api.post("/api/users/change-password", data)
}

export const changeProfilePicture = (file: File): Promise<AxiosResponse<ProfilePictureResponse>> => {
  const formData = new FormData()
  formData.append("profile_picture", file)

  return api.post("/api/users/change-profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const getLogFiles = (
  date: string,
  server: "ui" | "api",
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
): Promise<AxiosResponse<LogListResponse>> => {
  return api.get(`/api/logs/list?date=${date}&server=${server}&env=${env}&platform=${platform}`).then((response) => {
    // Ensure files is an array, default to empty array if null or undefined
    response.data.files = response.data.files || [];
    return response;
  });
};

export const getLogContent = (
  server: "ui" | "api",
  date: string,
  env: "dev" | "prod",
  file: string,
  platform: "XVA" | "DANONE",
): Promise<AxiosResponse<string>> => {
  return api.get(`/api/logs/get/${server}/${date}/${env}/${file}?platform=${platform}`)
}

export const searchLogs = (
  date: string,
  server: "ui" | "api",
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  keyword: string,
): Promise<AxiosResponse<LogSearchResult[]>> => {
  return api.get(`/api/logs/search?date=${date}&server=${server}&env=${env}&platform=${platform}&keyword=${keyword}`)
}

export const downloadLogs = (
  server: "ui" | "api",
  date: string,
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  files: string[],
): Promise<AxiosResponse<Blob>> => {
  return api.get(
    `/api/logs/download?server=${server}&date=${date}&env=${env}&platform=${platform}&files=${files.join(",")}`,
    {
      responseType: "blob",
    },
  )
}

export const getBackupFiles = (
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  date: string,
): Promise<AxiosResponse<BackupFile[]>> => {
  return api.get(`/api/db-backups/list?env=${env}&platform=${platform}&date=${date}`)
}

export const downloadBackup = (
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  date: string,
  file_name: string,
): Promise<AxiosResponse<Blob>> => {
  return api.get(`/api/db-backups/download?env=${env}&platform=${platform}&date=${date}&file_name=${file_name}`, {
    responseType: "blob",
  })
}

export const getMandrillActivity = (
  status: string[],
  date_from: string,
  date_to: string,
  limit: number,
  offset: number,
  keyword = "",
): Promise<AxiosResponse<MandrillActivityResponse>> => {
  const page = Math.floor(offset / limit) + 1
  return api.post("/api/mandrill/activity", {
    status,
    date_from,
    date_to,
    limit,
    page,
    page_size: limit,
    keyword,
    fetch_content: false,
  })
}

export const exportMandrillActivity = (
  status: string[],
  date_from: string,
  date_to: string,
  limit: number,
  offset: number,
  keyword = "",
): Promise<AxiosResponse<Blob>> => {
  const page = Math.floor(offset / limit) + 1
  return api.post(
    "/api/mandrill/export",
    {
      status,
      date_from,
      date_to,
      limit,
      page,
      page_size: limit,
      keyword,
      fetch_content: false,
    },
    { responseType: "blob" },
  )
}

export const getMandrillContent = (
  id: string,
): Promise<
  AxiosResponse<{
    content: string
    subject: string
    from_email: string
    from_name: string
    to: { email: string; name: string; type: string }[]
  }>
> => {
  return api.get(`/api/mandrill/content/${id}`)
}

export const resendMandrillEmail = (
  id: string,
): Promise<
  AxiosResponse<{
    message: string
    new_message_id: string
  }>
> => {
  return api.post(`/api/mandrill/resend/${id}`, {})
}

export default api

export const getAgentLogFiles = (
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  type: "ui" | "api",
  date?: string,
  pattern?: string,
): Promise<AxiosResponse<{ files: LogFile[]; count: number }>> => {
  const params = new URLSearchParams({
    env,
    platform,
    type,
  })
  if (date) params.append("date", date)
  if (pattern) params.append("pattern", pattern)

  return api.get(`/api/logs/agent/list?${params.toString()}`).then((response) => {
    response.data.files = response.data.files || []
    return response
  })
}

export const getAgentLogContent = (
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  type: "ui" | "api",
  filename: string,
): Promise<AxiosResponse<string>> => {
  return api.get(
    `/api/logs/agent/file?env=${env}&platform=${platform}&type=${type}&filename=${filename}`,
  )
}

export const downloadAgentLog = (
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  type: "ui" | "api",
  filename: string,
): Promise<AxiosResponse<Blob>> => {
  return api.get(
    `/api/logs/agent/download?env=${env}&platform=${platform}&type=${type}&filename=${filename}`,
    { responseType: "blob" },
  )
}

export const downloadAgentLogsMultiple = (
  env: "dev" | "prod",
  platform: "XVA" | "DANONE",
  type: "ui" | "api",
  files: string[],
): Promise<AxiosResponse<Blob>> => {
  return api.post(
    "/api/logs/agent/download-multiple",
    { env, platform, type, files },
    { responseType: "blob" },
  )
}