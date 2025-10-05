import Poll from "../models/poll.js";
import { sendCookies } from "../utils/sendCookie.js";
import { ErrorHandler } from "../middlewares/error.js";

export const createPoll = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }
}

export const voteInPoll = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }
}

export const getAllPublicPolls = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }
}

export const getPollById = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }
}

export const getPollCreatedByUser = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }

}

export const getUserVotedPoll = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }
}

export const getPollDetail = async(req, res, next) => {
    try {
        
    } catch (error) {
        console.log(error)
        next(new ErrorHandler("Failed to perform task", 500));
    }
}