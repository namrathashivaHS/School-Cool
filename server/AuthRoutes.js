import { Signup, Login, Home, AdminProfile, AddStudent, ViewStudent, EditStudent, DeleteStudent,
 AdminAttendance, EditAttendance, AddStaff, TeacherProfile, ViewStaff, EditStaff, DeleteStaff, ChangePassword, StudentProfile,
 AddAttendance,StudentList, ViewAttendance, DeleteAttendance, AddParent, ViewParents, EditParents,DeleteParents, 
 ParentsProfile, ParentsAttendance, AddProgressReport, TeacherViewProgressReport, ViewProgressReport, 
 EditProgressReport, DeleteProgressReport,
AllUsers, AccessChat, FetchChats, CreateGroupChat, RenameGroup, RemoveFromGroup, AddToGroup, 
TimeTable, ViewTimeTable, ViewTimeTableS, ViewTimeTableP, DeleteTimeTable} from "./AuthController.js";
import express from "express";
import { checkUser } from "./AuthMiddleware.js";

const router=express.Router();

// router.post('/signup', Signup);
router.post('/login', Login);
router.get('/',Home);
router.get('/admin/profile',AdminProfile);
router.post('/user',checkUser);
router.post('/admin/addStudent',AddStudent);
router.post('/admin/addStaff',AddStaff);
router.post('/admin/addParents',AddParent);
router.post('/changePassword',ChangePassword);
router.get('/student/profile',StudentProfile);
router.post('/teacher/addAttendance',AddAttendance);
router.get('/student/attendance', ViewAttendance);
router.get('/admin/viewStudent',ViewStudent);
router.get('/admin/viewStaff',ViewStaff);
router.get('/admin/viewParents',ViewParents);
router.put('/admin/editStudent/:id',EditStudent);
router.delete('/admin/deleteStudent/:id',DeleteStudent);
router.put('/admin/editStaff/:id', EditStaff);
router.delete('/admin/deleteStaff/:id',DeleteStaff);
router.put('/admin/editParents/:id',EditParents);
router.delete('/admin/deleteParents/:id',DeleteParents);
router.get('/teacher/profile',TeacherProfile);
router.get('/teacher/studentList',StudentList);
router.post('/teacher/attendance',AddAttendance);
router.get('/parents/profile',ParentsProfile);
router.get('/parents/attendance',ParentsAttendance);
router.get('/admin/viewAttendance',AdminAttendance);
router.put('/teacher/editAttendance/:selectedClass/:selectedDate',EditAttendance);
router.get('/teacher/viewAttendance',AdminAttendance);
router.post('/teacher/progressReport',AddProgressReport);
router.get('/teacher/viewProgressReport',TeacherViewProgressReport);
router.get('/parents/viewProgressReport',ViewProgressReport);
router.get('/student/viewProgressReport',ViewProgressReport);
router.delete('/teacher/deleteAttendance/:selectedClass/:selectedDate',DeleteAttendance);
router.put('/teacher/editProgressReport/:studentid/:test_type',EditProgressReport);
router.delete('/teacher/deleteProgressReport/:studentid/:test_type',DeleteProgressReport);
router.post('/chat',AccessChat);
router.get('/chat',FetchChats);
router.post('/chat/group',CreateGroupChat);
router.put('/chat/rename',RenameGroup);
router.put('/chat/groupremove',RemoveFromGroup);
router.put('/chat/groupadd',AddToGroup);
router.get('/chat/alltheusers',AllUsers);
router.post('/admin/addTimetable',TimeTable);
router.get('/admin/timeTable',ViewTimeTable);
router.get('/teacher/timeTable',ViewTimeTable);
router.get('/student/timeTable',ViewTimeTableS);
router.get('/parents/timeTable',ViewTimeTableP);
router.delete('/admin/deleteTimeTable/:class_std',DeleteTimeTable);

export { router };