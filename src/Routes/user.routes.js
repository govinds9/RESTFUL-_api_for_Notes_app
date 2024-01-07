import { Router } from "express";
import {  createNote, deleteNote, getNotes, getNotesbyId, loginUser, logoutUser, registerUser, shareNote, updateNote } from "../Controller/User.controller.js";
import { verifyJwt } from "../Middleware/auth.middleware.js";

const router = Router()

router.route('/auth/signup').post(registerUser)
router.route('/auth/login').post(loginUser)
router.route('/auth/logout').post(verifyJwt,logoutUser)


router.route('/notes').post(verifyJwt,createNote)
router.route('/notes').get(verifyJwt,getNotes)
router.route('/notes/:id').get(verifyJwt,getNotesbyId)
router.route('/notes').put(verifyJwt,updateNote)
router.route('/notes').delete(verifyJwt,deleteNote)
router.route('/notes/:id/share').post(verifyJwt,shareNote)



export default router