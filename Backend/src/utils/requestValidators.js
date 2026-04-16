import { REQUEST_STATUS } from "../constants";

export const isValidRequestStatus = (status) => {
    if (typeof status !== "string") return false;

    return REQUEST_STATUS.includes(status.trim().toLowerCase())
}