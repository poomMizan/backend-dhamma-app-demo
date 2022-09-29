/* eslint-disable prettier/prettier */
import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
  cookie: any // or any other type
}

export interface ClearCookieResponse extends Request {
  [x: string]: any
  clearCookieResponse: any // or any other type
}