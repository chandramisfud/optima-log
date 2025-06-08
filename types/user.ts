// types/user.ts
export interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
  updated_at: string
  profile_picture?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface ProfilePictureResponse {
  message: string
  path: string
}
