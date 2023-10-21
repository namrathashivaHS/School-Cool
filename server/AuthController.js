import { createSecretToken } from "./SecretToken.js";
import bcrypt from "bcrypt";
import { login, admin, student, teacher, parents, attendance, student_progress_report, chat, time_table } from "./user.js";
import { AdminSignupSchema, userLoginSchema, studentRegistrationSchema, staffRegistrationSchema, 
  parentsRegistrationSchema, studentProgressReportSchema, attendanceSchema, timeTableSchema } from "./schema.js";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const Signup = async (req, res, next) => {
  try {
    const { error, value } = AdminSignupSchema.validate(req.body);
    if(error) return res.status(400).send(error.message); 
    const { email, password, username, createdAt } = req.body;
    const user = await admin.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await admin.insertOne({
      name,
      email,
      designation,
      role:"Admin",
      password:hashedPassword
    });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: maxAge
    });
    };
let msg;
const Login = async (req, res, next) => {
  const { error } = userLoginSchema.validate(req.body);
  const { email, password } = req.body;
  if (error){
    msg=error.message;
    //console.log("error message 1");
    return res.status(400).json({msg});
  }
  try {
    
    const user = await login.findOne({ email: email });
    
    if (user) {
      const compareResult = await bcrypt.compare(password, user.password);
      if (!compareResult){
        msg="Invalid credentials. Please check email/password";
        return res
          .status(404)
          .json({msg});
      }
      const token = createToken(user._id);
      res.cookie('jwt', token, {withCredentials:true, httpOnly: false, maxAge: maxAge * 1000 });
      if(user.role==="Admin"){
        console.log("Successfully logged in as Admin");
        next();
        return res.status(201).json({success:true,message:"Successfully logged in as Admin"});
      }else if(user.role==="Student"){
        console.log("Successfully logged in as Student");
        next();
        return res.status(201).json({success:true,message:"Successfully logged in as Student"});
      }else if(user.role==="Teacher"){
        console.log("Successfully logged in as Teacher");
        next();
        return res.status(201).json({success:true,message:"Successfully logged in as Teacher"});
      }else if(user.role==="Parents"){
        console.log("Successfully logged in as Parents");
        next();
        return res.status(201).json({success:true,message:"Successfully logged in as Parents"});
      }
      
    }
    msg="Invalid credentials. Please check emailpassword";
    return res
      .status(404)
      .json({msg});
  } catch (error) {
    msg=error.message;
    //console.log("error message2");
    return res.status(500).json({msg});
  }
}

const Home=async(req,res,next)=>{
  try{
    let user = await login.find();
    res.json({user});
  }
  catch{
    console.log("error");
  }
}

const AdminProfile=async(req,res,next)=>{
  const { email } = req.query;
  try{
    const adminProf = await admin.findOne({email:email});
    console.log("Profile information fetched successfully");
    next();
    res.status(201).json({success:true,adminProf:adminProf});
  }catch(err){
    let msg=err.message;
    console.log("faliure");
    res.status(500).json({success:false,msg});
  }
}

const AddStudent = async (req,res)=>{
  const { error, value } = studentRegistrationSchema.validate(req.body);
  console.log(req.body);
  const { first_name, last_name, father_name, mother_name, dob, age, 
    gender, admission_year, class_std, section, class_teacher_id, email, mob_num, address  } = req.body;
  if (error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  } 
  try{
    const reqUser = await student.findOne({ email });
    if (reqUser) {
      msg="Student with that email already exists. Please login!";
      return res
        .status(400)
        .json({msg});
    }

    //const teachers=class_teacher.split(" ");
    const isteacher=await teacher.findOne({emp_id:class_teacher_id});
    if(!isteacher){
      msg="Invalid Teacher ID";
      return res
        .status(404)
        .json({msg});
    }
    const stu = await student.find({class_std}).toArray();
    let max=0;
    for(const item of stu){
      const str = item.roll_no.match(/\d+$/);
        const lastNumericalPart = str[0];
      const extractedNumber = parseInt(lastNumericalPart, 10);
      if(max<extractedNumber){
        max=extractedNumber;
      }
    }
      const c = max+1;
      var st=""+c;
      var cla=""+class_std;
    if(c<10){
      const pad="00";
      var ans=pad.substring(0,pad.length-st.length)+st;
      var std=pad.substring(0,pad.length-cla.length)+cla;
    }else{
      var ans=st;
    }
    const num='HVS'+std+section+ans;
    
    const newUser = await student.insertOne({
      roll_no:num, 
      first_name, 
      last_name, 
      father_name, 
      mother_name, 
      dob, 
      age, 
      gender, 
      admission_year, 
      class_std, 
      section, 
      class_teacher_id, 
      email, 
      mob_num, 
      address
    });
    let cap=email.substring(0,1).toUpperCase();
    let small=email.substring(1,4).toLowerCase();
    let stupass=cap+small+'@'+class_std+class_std;
    const hashedPassword = await bcrypt.hash(stupass, 10);
    const log=await login.insertOne({
      email,
      password:hashedPassword,
      role:"Student"
    })
    return res.status(201).json({success:true,message:"Student Registerd Successfully",num});
  }
  catch (error) {
    msg=error.message;
    return res.status(500).json({success:false,message:msg});
  }
    
}

const StudentProfile=async(req,res,next)=>{
  const { email } = req.query;
  try{
    const studentProf = await student.findOne({email:email});

    const classteacher = await teacher.findOne({emp_id:studentProf.class_teacher_id})
    console.log("Profile information fetched successfully");
    next();
    res.status(201).json({success:true,studentProf,classteacher});
  }catch(err){
    let msg=err.message;
    res.status(500).json({success:false,msg});
  }
}

const ViewStudent=async (req,res)=>{
  let msg;
  try{
    const cursor = student.find();
    const data = await cursor.toArray();
    
    const cur = attendance.find();
    const attData = await cur.toArray();

    const curr = teacher.find();
    const teach = await curr.toArray();

    const attendanceCounts = {};

    for (const record of attData) {
      const studentId = record.student_id;
      const status = record.status;
    
      // Initialize counts if the student is encountered for the first time
      if (!attendanceCounts[studentId]) {
        attendanceCounts[studentId] = {
          present:0,
          absent:0
        };
      }
      
      if(status=="Present"){
        attendanceCounts[studentId].present++;
      }else if(status=="Absent"){
        attendanceCounts[studentId].absent++;
      }
    }
    const attendanceMap = new Map();

    for (const studentId in attendanceCounts) {
      if (attendanceCounts.hasOwnProperty(studentId)) {
        // Access the present and absent counts for the current student
        const stuid = attendanceCounts[studentId];
        const presentCount = stuid.present;
        const absentCount = stuid.absent;
        const percentage = ((presentCount/(presentCount+absentCount))*100).toFixed(2);

        attendanceMap.set(studentId,percentage);
      }
    }
    const mergedata = []
    for(const item of data){
      const { roll_no } = item;
      const { class_teacher_id } = item;
      let name;
      for(const id of teach){
        if(class_teacher_id == id.emp_id)
          name = id.first_name+' '+id.last_name
      }
      let percentage = attendanceMap.get(roll_no);
      if(percentage===undefined){
        percentage=null;
      }
      const merge = {
        ...item,
        percentage,
        name
      }
      mergedata.push(merge);
      
    }
    if(data.length>0){
      msg='Student data fetched successfully';
      return res.status(200).json({success:true,message:msg,stuData:mergedata});
    }

  }catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
}

const EditStudent = async (req,res) => {
  let msg;
  const roll_no  = req.params.id;
  console.log(req.params.id);
  const  updateData  = req.body;
  try{
    const stu  = await student.findOne({roll_no:roll_no}); 
   if(stu){
    const dataToUpdate={};
    const fieldsToUpdate = [
    'roll_no', 
    'first_name', 
    'last_name', 
    'father_name', 
    'mother_name', 
    'dob', 
    'age', 
    'gender', 
    'admission_year', 
    'class_std', 
    'section', 
    'class_teacher_id', 
    'email', 
    'mob_num', 
    'address'];
    let flag=false;
    for(const field of fieldsToUpdate){
      if(updateData[field]!==undefined && updateData[field]!=="" && updateData[field]!=null){
        dataToUpdate[field] = updateData[field];
        flag=true;
      }else{
        dataToUpdate[field] = stu[field];
      }
    }
    if(flag===false){
      msg="Studnet data can be edited now";
      return res.json({success:false,message:msg,stu});
    }
    const { error, value } = studentRegistrationSchema.validate(dataToUpdate);
    const teach = await teacher.findOne({emp_id:dataToUpdate.class_teacher_id});
    if(!teach){
      msg="Invalid Class Teacher ID";
      return res.json({success:false,message:msg,stu});
    }
    if(error){
      msg=error.message;
      return res.json({success:false,message:msg,stu});
    }

    const filter = {
      _id:stu._id,
    };
    const log = await login.findOne({email:req.body.email});
    
    const  Modified_data  = await student.findOneAndReplace(
      filter, dataToUpdate ,{returnDocument:"after"});
         msg="Changes Saved Successfully you can view the changes in View/Modify Student";
         if(log){
          console.log("");
        }else{
          const logupdate = await login.findOneAndUpdate({email:stu.email},{$set:{email:req.body.email}});
        }
         return res.status(200).json({success:true,message:msg,stu,Modified_data});
       }else{
         msg="User not found";
         return res.json({success:false,message:msg});
       }
  }
  catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
}

const DeleteStudent = async(req,res)=>{
  const roll_no = req.params.id;
  let msg;
  try{
    const delData = await student.findOneAndDelete({roll_no:roll_no});
    const logData = await login.findOneAndDelete({email:delData.email});
    const attData = await attendance.deleteMany({student_id:roll_no});
    if(delData){
      msg="Studnet Deleted Successfully";
      return res.json({success:true,message:msg,delData});
    }else{
      msg="Something went wrong please try again later";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const AdminAttendance = async (req,res)=>{
  let msg;
  const { date, cls } = req.query;
// Check if the entered date is a valid date and greater than 2020
try{
    const cursor = attendance.find({ date:date,class:cls });  
    const att = await cursor.toArray();
    //console.log(att);
    const data=[];
    for(const item of att){
      const studentId = item.student_id;
      const stu = await student.findOne({roll_no:studentId});
      const name = stu.first_name+' '+stu.last_name;
      const merge = {
        ...item,
        name
      };
      data.push(merge);
    }
    msg="Attendance fetched Successfully";
    return res.status(201).json({success:true,message:msg,attendanceData:data});
  }
  catch (error) {
    msg=error.message;
    return res.status(500).json({success:false,message:msg});
  }
    
}

const EditAttendance = async(req,res,next)=>{
  const { selectedClass, selectedDate } = req.params;
  const updatedData = req.body;
  let msg;
  
  try{
    const cursor = attendance.find({class:selectedClass,date:selectedDate});
    const att = await cursor.toArray();
    const data=[];
    for(const item of att){
      const studentId = item.student_id;
      const stu = await student.findOne({roll_no:studentId});
      const name = stu.first_name+' '+stu.last_name;
      const merge = {
        ...item,
        name
      };
      data.push(merge);
    }
    let flag=true;
    if(Object.keys(updatedData).length===0){
      msg="No Changes Saved yet";
      flag=false;
      return res.json({success:true,message:msg,att:data,flag});
    }
    let dat;
    console.log(updatedData);
    const promises = [];
    for (const key in updatedData) {
      console.log(key);
      if (updatedData.hasOwnProperty(key)) {
        const id = updatedData[key];
        const studentId = id.student_id;
        const sta = id.status;
        console.log(id,studentId,sta);
        dat = await attendance.findOneAndUpdate({student_id:studentId,date:selectedDate},{$set:{status:sta}},{ new: true });
      }
    }
    msg="Successfully Updated the Attendance";
    return res.json({success:true,message:msg,att:data,dat,flag});
}
  catch(error){
    msg= error.message;
    return res.json({success:false,message:msg});
  }

}

const AddStaff = async (req,res)=>{
  const { error,value } = staffRegistrationSchema.validate(req.body);
  const { first_name, last_name, dob, age, gender, qualification, 
  course, designation, email, mob_num, address } = req.body;
  if (error) 
  {
    let msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
  try{
    const reqUser = await teacher.findOne({ email });
    if (reqUser) {
      let msg="Staff with that email already exists. Please login!";
      return res.status(400).json({success:false,message:msg});
    }
    let max=0;
    const user = await teacher.find().toArray();
    for(const item of user){
      const lastNumericalPart = item.emp_id.match(/\d+$/);
      const extractedNumber = parseInt(lastNumericalPart[0], 10);
      if(max<extractedNumber){
        max=extractedNumber;
      }
    }
    const c=max+1;
      var st=""+c;
    if(c<10){
      const pad="00";
      var ans=pad.substring(0,pad.length-st.length)+st;
    }else{
      var ans=st;
    }
    const employee_id='EMP'+ans;
    const newUser = await teacher.insertOne({
      emp_id:employee_id, 
      first_name, 
      last_name, 
      dob, 
      age, 
      gender, 
      qualification, 
      course, 
      designation,
      email, 
      mob_num, 
      address
    });

    let cap=email.substring(0,1).toUpperCase();
    let small=email.substring(1,4).toLowerCase();
    let mob=mob_num.substring(0,4);
    let teachpass=cap+small+'@'+mob;
    const hashedPassword = await bcrypt.hash(teachpass, 10);
    const str='teacher';
    const teachlow = designation.toLowerCase();
    const teach = teachlow.endsWith(str);
    console.log(teachlow,teach);
    if(teach){
      const log=await login.insertOne({
      email,
      password:hashedPassword,
      role:"Teacher"
    });
    }
    return res.status(201).json({success:true,message:"Staff Registered Successfully",employee_id});
  }
  catch (error) {
    msg=error.message;
    console.log(msg);
    return res.status(500).json({success:false,message:msg});
  }
    
}

const TeacherProfile=async(req,res,next)=>{
  const { email } = req.query;
  try{
    const teacherProf = await teacher.findOne({email:email});
    console.log("Profile information fetched successfully");
    next();
    return res.status(201).json({success:true,teacherProf:teacherProf});
  }catch(err){
    let msg=err.message;
    return res.status(500).json({success:false,msg});
  }
}

const ViewStaff=async(req,res)=>{
  let msg;
  try{
    const cursor = teacher.find();
    const data = await cursor.toArray();
    if(data.length>0){
      msg='Staff data fetched successfully';
      return res.status(200).json({success:true,message:msg,staData:data});
    }
  }catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
}

const EditStaff = async (req,res) => {
  let msg;
  const emp_num  = req.params.id;
  const  updateData  = req.body;
  console.log(updateData);
  console.log(emp_num);
  try{
    const teach  = await teacher.findOne({emp_id:emp_num}); 
   if(teach){
    const dataToUpdate={};
    const fieldsToUpdate = [
      'emp_id', 
      'first_name', 
      'last_name', 
      'dob', 
      'age', 
      'gender', 
      'qualification', 
      'course', 
      'designation',
      'email', 
      'mob_num', 
      'address'];
    let flag=false;
    for(const field of fieldsToUpdate){
      if(updateData[field]!==undefined && updateData[field]!=="" && updateData[field]!=null){
        dataToUpdate[field] = updateData[field];
        flag=true;
      }else{
        dataToUpdate[field] = teach[field];
      }
    }
    if(flag===false){
      msg="Staff data can be edited now";
      return res.json({success:false,message:msg,teach});
    }
    const { error, value } = staffRegistrationSchema.validate(dataToUpdate);
    if(error){
      msg=error.message;
      return res.json({success:false,message:msg,teach});
    }

    const filter = {
      _id:teach._id,
    };
    const log = await login.findOne({email:req.body.email});
    const  Modified_data  = await teacher.findOneAndReplace(
      filter, dataToUpdate ,{returnDocument:"after"});
         msg="Changes Saved Successfully you can view the changes in View/Modify Staff";
         if(log){
          console.log("");
        }else{
          const logupdate = await login.findOneAndUpdate({email:teach.email},{$set:{email:req.body.email}});
        }
         return res.status(200).json({success:true,message:msg,teach,Modified_data});
       }else{
         msg="User not found";
         return res.json({success:false,message:msg});
       }
  }
  catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
}

const DeleteStaff = async(req,res)=>{
  const emp_num = req.params.id;
  let msg;
  try{
    const delData = await teacher.findOneAndDelete({emp_id:emp_num});
    const logData = await login.findOneAndDelete({email:delData.email});
    if(data){
      msg="Staff Deleted Successfully";
      return res.json({success:true,message:msg,delData});
    }else{
      msg="Something went wrong please try again later";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const ChangePassword = async(req,res)=>{
  const { error } = userLoginSchema.validate(req.body);
  const { email, password, newpassword} = req.body;
  let msg;

  if (error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
  
  try{
    const user = await login.findOne({email:email}); 
  if(user){
    console.log("email is correct");
    const compareResult = await bcrypt.compare(password,user.password);

    if(!compareResult){
      msg="Invalid Credentials check Email/Password is not correct";
      return res.json({success:false,message:msg});
    }else{
        let hashpass=await bcrypt.hash(newpassword, 10);
        let up=await login.updateOne({email:email},{$set:{password:hashpass}});
        if(user.role=="Admin"){
          let adminup=await admin.updateOne({email:email},{$set:{password:hashpass}});
        }
        msg="Password updated successfully login with the new password";
        return res.json({success:true,message:msg});
    }
  }else{
    msg="Invalid Credentials check Email/Password is correct";
    return res.json({success:false,message:msg});
  }
  
  }catch(err){
    msg=err.message;
    return res.json({message:msg});
  }
}

const AddAttendance = async (req,res)=>{
  let msg;
  const { date, attendanceData, email, cls } = req.body;
  const enteredDate = new Date(date);
// Check if the entered date is a valid date and greater than 2020
if (!(!isNaN(enteredDate) && enteredDate.getFullYear() > 2020)) {
  msg='The entered date is not valid or not greater than 2020.';
  return res.json({success:false,message:msg});
}
try{
  const reqUser = await attendance.findOne({ date:date,class:cls });
  if (reqUser) {
    msg=`The Attendance on ${date} for ${cls} is already recorded`;
    return res
      .status(400)
      .json({success:false,message:msg});
  }
  const teach = await teacher.findOne({email:email});
  if(!teach){
    msg='Soemthing went wrong please try again later';
    return res.json({success:false,message:msg});
  }
  const monthaMap = {
    '01' : 'January',
    '02' : 'February',
    '03' : 'March',
    '04' : 'April',
    '05' : 'May',
    '06' : 'June',
    '07' : 'July',
    '08' : 'August',
    '09' : 'September',
    '10' : 'October',
    '11' : 'November',
    '12' : 'December'
  }

  const arr = date.split('-');
  const mon = monthaMap[arr[1]];
  const value = [];
  for( const item of attendanceData){
    const inser={};

    inser['student_id'] = item.studentId;
    inser['marked_by'] = teach.first_name+' '+teach.last_name;
    inser['class'] = cls;
    inser['date'] = date;
    inser['month'] =  mon;
    inser['status'] = item.status;

    value.push(inser);
  }
  
  console.log(value);
    const newUser = await attendance.insertMany(value);
    msg="Attendance Recorded successfully"
    return res.status(201).json({success:true,message:msg,newUser});
  }
  catch (error) {
    msg=error.message;
    return res.status(500).json({success:false,message:msg});
  }
    
}

const StudentList = async (req,res) => {
  const { clas } = req.query;
  let msg;
  try{
    const cursor = student.find({class_std:clas});
    const stu = await cursor.toArray();
    const stuList = stu.map((student)=>({
      studentId:student.roll_no,
      studentName:student.first_name+' '+student.last_name}));
    msg="Student list sent successfully";
    return res.json({success:true,message:msg,stuList});
  }catch(error){
    msg="Something went wrong. Please try again later"
    return res.json({success:false,message:msg});
  }
}

const ViewAttendance = async (req,res) => {
  const { email }  = req.query;
  //const id = student_id.replace(/"/g, '');
  const stu_id = await student.findOne({email:email});
  try{
    const cursor = attendance.find({student_id:stu_id.roll_no});
    const data = await cursor.toArray();
    if(data.length>0){
      msg=`Attendance for ${stu_id.roll_no} fetched Successfully`
      return res.status(200).json({success:true,message:msg,attend:data});
    }
  }catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
  
}

const DeleteAttendance = async(req,res)=>{
  const { selectedClass,selectedDate } = req.params;
  console.log(req.params);
  let msg;
  try{

    const delData = await attendance.deleteMany({class:selectedClass,date:selectedDate});
    console.log(delData);
    if(delData){
      msg="Attendance Deleted Successfully";
      return res.json({success:true,message:msg,delData});
    }else{
      msg="Something went wrong please try again later";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const AddParent = async (req,res)=>{
  const { error, value } = parentsRegistrationSchema.validate(req.body);
  const { first_name, last_name, student_id, email, mob_num, address  } = req.body;
  console.log(student_id);
  console.log(student_id.length);
  if (error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  } 
  try{
    const reqUser = await parents.findOne({ email });
    if (reqUser) {
      msg="Parents with that email already exists. Please login!";
      return res
        .status(400)
        .json({msg});
    }

    //const teachers=class_teacher.split(" ");
    const isstudent=await student.findOne({roll_no:student_id});
    if(!isstudent){
      msg="Invalid Student ID";
      return res
        .status(404)
        .json({msg});
    }

    if((isstudent.father_name !== first_name+' '+last_name)&&
    (isstudent.mother_name !== first_name+' '+last_name)){
      console.log(isstudent.father_name);
      console.log(first_name+' '+last_name);
      msg= "Student ID and Parents details are not matching. Please check once again!!";
      return res.status(400).json({success:false,message:msg});
    }
    
    const newUser = await parents.insertOne({
      first_name,
      last_name,
      student_id,
      email,
      mob_num,
      address
    });
    let cap=email.substring(0,1).toUpperCase();
    let small=email.substring(1,4).toLowerCase();
    let mob=mob_num.substring(0,4);
    let parepass=cap+small+'@'+mob;
    const hashedPassword = await bcrypt.hash(parepass, 10);
    const log=await login.insertOne({
      email,
      password:hashedPassword,
      role:"Parents"
    })
    return res.status(201).json({success:true,message:"Parents Registerd Successfully"});
  }
  catch (error) {
    msg=error.message;
    return res.status(500).json({success:false,message:msg});
  }
    
}

const ViewParents=async (req,res)=>{
  let msg;
  try{
    const cursor = parents.find();
    const data = await cursor.toArray();
    
    const cur = student.find();
    const stu = await cur.toArray();


    let name;
    
    let mergeData =[];
    for(const item of data){
      const roll_no = item.student_id;
      for(const id of stu){
        if(roll_no == id.roll_no)
          name = id.first_name+' '+id.last_name;
      }
      let merge={}

      merge={
        ...item,
        name
      }
      mergeData.push(merge);

      console.log(mergeData.length);
    }
    if(mergeData.length>0){
      msg='Parents data fetched successfully';
      return res.status(200).json({success:true,message:msg,pareData:mergeData});
    }

  }catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
}

const EditParents = async (req,res) => {
  let msg;
  const id  = req.params.id;
  const  updateData  = req.body;
  try{
    const pare  = await parents.findOne({_id:new ObjectId(id)}); 
   if(pare){
    const dataToUpdate={};
    const fieldsToUpdate = [ 
    'first_name', 
    'last_name', 
    'student_id', 
    'email', 
    'mob_num', 
    'address'];
    let flag=false;
    for(const field of fieldsToUpdate){
      if(updateData[field]!==undefined && updateData[field]!=="" && updateData[field]!=null){
        dataToUpdate[field] = updateData[field];
        flag=true;
      }else{
        dataToUpdate[field] = pare[field];
      }
    }
    if(flag===false){
      msg="Parents data can be edited now";
      return res.json({success:false,message:msg,pare});
    }
    const { error, value } = parentsRegistrationSchema.validate(dataToUpdate);
    const stu = await student.findOne({roll_no:dataToUpdate.student_id});
    if(!stu){
      msg="Invalid Student ID";
      return res.json({success:false,message:msg,pare});
    }
    if(error){
      msg=error.message;
      return res.json({success:false,message:msg,pare});
    }
    
    const filter = {
      _id:new ObjectId(pare._id),
    };
    const log = await login.findOne({email:req.body.email});
    const  Modified_data  = await parents.findOneAndReplace(
      filter, dataToUpdate ,{returnDocument:"after"});
         msg="Changes Saved Successfully you can view the changes in View/Modify Parents";
         if(log){
          console.log("");
        }else{
          const logupdate = await login.findOneAndUpdate({email:pare.email},{$set:{email:req.body.email}});
        }
         return res.status(200).json({success:true,message:msg,pare,Modified_data});
       }else{
         msg="User not found";
         return res.json({success:false,message:msg});
       }
  }
  catch(error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  }
}

const DeleteParents = async(req,res)=>{
  const id = req.params.id;
  let msg;
  try{
    const delData = await parents.findOneAndDelete({_id:new ObjectId(id)});
    const logData = await login.findOneAndDelete({email:delData.email});
    if(data){
      msg="Parents Deleted Successfully";
      return res.json({success:true,message:msg,delData});
    }else{
      msg="Something went wrong please try again later";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}


const ParentsProfile=async(req,res,next)=>{
  const { email } = req.query;
  try{
    const parentsProf = await parents.findOne({email:email});

    const stu = await student.findOne({roll_no:parentsProf.student_id});
    console.log("Profile information fetched successfully");
    next();
    res.status(201).json({success:true,parentsProf,stu});
  }catch(err){
    let msg=err.message;
    res.status(500).json({success:false,msg});
  }
}

const ParentsAttendance = async(req,res,next)=>{
  const { email } = req.query;
  let msg;
  try{
    const pareData = await parents.findOne({email:email});

    const cursor =  attendance.find({student_id:pareData.student_id});
    const attData = await cursor.toArray();

    const attend={};
    for(const item of attData){
      const month1 = item.month;
      const status = item.status;

      if(!attend[month1]){
        attend[month1]={
          present:0,
          absent:0,
          holiday:0
        };
      }
      
      if(status=="Present"){
        attend[month1].present++;
      }else if(status=="Absent"){
        attend[month1].absent++;
      }else{
        attend[month1].holiday++;
      }

    }

    const attendancedata = [];
    let per=0;
    let tot=0;
    let pre=0;
    for(const month in attend){
      if (attend.hasOwnProperty(month)) {
        const monthData = attend[month];
        const presentCount = monthData.present;
        const absentCount = monthData.absent;
        const holidayCount = monthData.holiday;
        const totalClasses = presentCount+absentCount;
        const percentage = ((presentCount/totalClasses)*100).toFixed(2);
        pre=pre+presentCount;
        tot=tot+totalClasses;
        let data={};
        data['month']=month;
        data['present']=presentCount;
        data['total']=totalClasses;
        data['holiday']=holidayCount;
        data['percentage']=percentage;
        attendancedata.push(data);
        }
      }
      per=((pre/tot)*100).toFixed(2);
      console.log(per)
      msg="Attendance fetched Successfully"
      return res.json({success:true,message:msg,attendanceData:attendancedata,totper:per});
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const AddProgressReport = async (req,res)=>{
  console.log(req.body);
  const { kannada, english, hindi, maths, science, social, physical_education, drawing, computer_science, moral_science, test_type, student_id, feedback, class_teacher_id,email } = req.body;
  delete req.body.email;
  console.log(req.body);
  console.log(email);
  const { error, value } = studentProgressReportSchema.validate(req.body);
  if (error){
    msg=error.message;
    return res.status(400).json({success:false,message:msg});
  } 
  try{
    
    const reqUser = await student_progress_report.findOne({ student_id,test_type:test_type });
    if (reqUser) {
      msg=`For Student ID ${student_id} is already recorded for ${test_type}`;
      return res
        .status(400)
        .json({msg});
    }

    const teach = await teacher.findOne({email:email});

    const stu = await student.findOne({roll_no:student_id,class_teacher_id:teach.emp_id});
    if(!stu){
      msg=`You are not the Class teacher of Student ${student_id} Please check the Student ID`;
      return res.json({success:false,message:msg});
    }

    const newUser = await student_progress_report.insertOne({
      kannada, 
      english, 
      hindi, 
      maths, 
      science, 
      social, 
      physical_education, 
      drawing, 
      computer_science, 
      moral_science, 
      test_type, 
      student_id, 
      feedback,
      class_teacher_id
    });
    return res.status(201).json({success:true,message:"Progress Report recorded Successfully"});
  }
  catch (error) {
    msg=error.message;
    return res.status(500).json({success:false,message:msg});
  }
    
}

const TeacherViewProgressReport = async(req,res,next)=>{
  const id = req.query;
  let msg;
  try{
    const cursor = student_progress_report.find({student_id:id.studentid});
    const Data = await cursor.toArray();
    console.log(Data);
    if(Data.length==0){
      msg="No Data found";
      return res.json({success:false,message:msg});
    }
    let proData = [];
    for(const item of Data){
      let tot=(((parseInt(item.kannada,10)+
      parseInt(item.english,10)+parseInt(item.hindi,10)+parseInt(item.maths,10)
      +parseInt(item.science,10)+parseInt(item.social,10))/600)*100).toFixed(2);
      let merge = {};
      merge={
        ...item,
        tot
      }
      proData.push(merge);
    }
    return res.json({success:true,message:msg,proData});
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const ViewProgressReport = async(req,res,next)=>{
  const { email, role } = req.query;
  let msg;
  let data;
  let id;
  try{
    if(role=="Parents"){
       data = await parents.findOne({email:email});
       id=data.student_id;
    }else if(role=="Student"){
       data = await student.findOne({email:email}); 
       id=data.roll_no
    }
    const cursor = student_progress_report.find({student_id:id});
    const Data = await cursor.toArray();
    let proData = [];
    for(const item of Data){
      let tot=(((parseInt(item.kannada,10)+
      parseInt(item.english,10)+parseInt(item.hindi,10)+parseInt(item.maths,10)
      +parseInt(item.science,10)+parseInt(item.social,10))/600)*100).toFixed(2);
      let merge = {};
      merge={
        ...item,
        tot
      }
      proData.push(merge);
     
    }
     console.log(proData);
    return res.json({success:true,message:msg,proData});
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const EditProgressReport = async(req,res,next)=>{
  const {studentid,test_type} = req.params;
  const email = req.body.email;
  delete req.body.email;
  const updateData = req.body;
  let msg;
  try{
    const teach = await teacher.findOne({email:email});
    const prodata = await student_progress_report.findOne({student_id:studentid,test_type:test_type});
    if(prodata==null){
      msg="No data found";
      return res.json({success:false,message:msg});
    }
    if(prodata.class_teacher_id!==teach.emp_id){
      msg=`You are not the Class teacher of Student ${studentid} Please check the Student ID`;
      return res.json({success:false,message:msg,prodata});
    }
    if(prodata){
      const dataToUpdate={};
    const fieldsToUpdate = [
    'kannada', 
    'english', 
    'hindi', 
    'maths', 
    'science', 
    'social', 
    'physical_education', 
    'drawing', 
    'computer_science', 
    'moral_science', 
    'test_type',
    'student_id',
    'feedback',
    'class_teacher_id'];
    let flag=false;
    for(const field of fieldsToUpdate){
      if(updateData[field]!==undefined && updateData[field]!=="" && updateData[field]!=null){
        dataToUpdate[field] = updateData[field];
        flag=true;
      }else{
        dataToUpdate[field] = prodata[field];
      }
    }
    if(flag==false){
      msg="Progress Report can be edited now";
      return res.json({success:false,message:msg,prodata});
    }
    const { error, value } = studentProgressReportSchema.validate(dataToUpdate);
    if(error){
      msg=error.message;
      return res.json({success:false,message:msg,prodata});
    }

    const filter = {
      _id:prodata._id,
    };
    const  Modified_data  = await student_progress_report.findOneAndReplace(
      filter, dataToUpdate ,{returnDocument:"after"});
         msg="Changes Saved Successfully you can view the changes in View Progress Report";
         return res.status(200).json({success:true,message:msg,prodata,Modified_data});
    }else{
      msg="Something went wrong Please try again later.";
      res.json({success:false,message:msg})
    }
  }catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}

const DeleteProgressReport = async(req,res)=>{
  const { studentid, test_type } = req.params;
  let msg;
  try{
    const delData = await student_progress_report.findOneAndDelete({student_id:studentid,test_type:test_type});
    if(delData){
      msg="Progress Report Deleted Successfully Refresh the screen to see the changes";
      return res.json({success:true,message:msg,delData});
    }else{
      msg="No Data found";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const AccessChat = async(req,res)=>{
  const  { id,email } = req.body;
  //let ids =  ObjectId(id);
  let msg;
  let user;
  try{
    user = await login.findOne({email:email});
    const isChat = await chat
      .find({
        isGroupChat: false,
        users: { $all: [user._id, id] }, // Both users should be present
      })
      .toArray();

  if(isChat.length>0){
    msg="Chat with this user already exists";
    let cht = isChat[0];
    res.json({success:true,message:msg,cht});
  }else{
    const ch = await chat.insertOne({
      chatName : "Sender",
      isGroupChat : false,
      users:[user._id,id],
    });
    msg="Chat created successfully";
    res.json({success:true,message:msg});
  }
 }catch(error){
  msg=error.message;
  res.json({success:false,message:msg});
 }
}

const FetchChats = async(req,res)=>{
  const { email } = req.query;
  let user;
  let role;
  try{
  user = await login.findOne({email:email});
  const chats = await chat
      .find({
        users: { $all: [user._id] }, // Both users should be present
      })
      .toArray();
      msg="Chats with the user is sent";
  
  let fullmergeData=[];
  for(const usr of chats){
    const { users } = usr;
    let mergeData = [];
    for(const item of users){

      let name;
      let usr;
      if(item.length==24){
        usr=item;
        const id = await login.findOne({_id:new ObjectId(usr)});
        if(id.role=="Admin"){
          const ad = await admin.findOne({email:id.email});
          name=ad.name;
          role="Admin";
        }else if(id.role=="Teacher"){
          const teach = await teacher.findOne({email:id.email});
          name=teach.first_name+' '+teach.last_name;
          role="Teacher";
        }else if(id.role=="Student"){
          const stu = await student.findOne({email:id.email});
          name=stu.first_name+' '+stu.last_name;
          role="Student";
        }else if(id.role=="Parents"){
          const para = await parents.findOne({email:id.email});
          name=para.first_name+' '+para.last_name;
          role="Parents";
        }
        let merge={
      item,
      name,
      role
    }
    mergeData.push(merge);
    // const items = mergeData.map(data => data);
    // console.log(items);
    }
  }
  let m={
    ...usr,
    mergeData
  }
  fullmergeData.push(m);
}
  //console.log(mergeData);
  res.json({success:true,message:msg,fullmergeData});
  }catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}

const CreateGroupChat = async(req,res) =>{
  const {users,email,name} = req.body;
  let usr=[];
  if(users===undefined){
    return res.json({success:false,message:"Not able to add the group"});
  }
    for(const item of users){
      const id = item.id;
      usr.push(id);
    }
   let user;
   let msg;
  try{
    user = await login.findOne({email:email});
    if(!users || !name){
    return res.status(400).json({success:false, message: "Please Fill all the feilds" });
    }
    if(users.length<2){
      return res
      .status(400)
      .json({success:true,message:"More than 2 users are required to form a group chat"});
    }

    usr.push(user._id);
    const groupChat = await chat.insertOne({
      chatName:name,
      users:usr,
      isGroupChat:true,
      groupAdmin:user._id
    });
    msg="Group Chat Created Successfully"
    res.json({success:true,message:msg});
  }catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}

const RenameGroup = async(req,res) =>{
  const { chatId, chatName } = req.body;
  let msg;
  try{
    const updatedchat = await chat.findOneAndUpdate({_id:new ObjectId(chatId)},{$set:{chatName:chatName}},{ new: true });

    if(updatedchat){
      msg="Chat name is successfully updated";
      res.json({success:true,message:msg,updatedchat});
    }else{
      msg="Chat not found";
      res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}

const RemoveFromGroup = async(req,res)=>{
  const { chatId, userId } = req.body;
  let msg;
  try{
    const updatedChat = await chat.findOneAndUpdate({_id:new ObjectId(chatId),},{ $pull: { users: { $in: [userId] } } },{ new: true });
    if(updatedChat){
      msg="Successfully removed the user from the chat";
      res.json({success:true,message:msg});
    }else{
      msg="Unable to remove the user please try again later".
      res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}

const AddToGroup = async(req,res) =>{
  const { chatId, userId } = req.body;
  let msg;
  try{
    const updatedChat = await chat.findOneAndUpdate({_id:new ObjectId(chatId)},{ $push: { users: userId } },{ new: true });
    if(updatedChat){
      msg="Successfully added the user to the chat";
      res.json({success:true,message:msg});
    }else{
      msg="Unable to add the user please try again later".
      res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}

const AllUsers = async(req,res)=>{
  const { email, role, search } = req.query;
   let msg;
  try{
  const user = await login.findOne({email:email,role:role});
  const keyword = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  let allData;
  allData = await login.find({$and:[keyword,{_id : { $ne: user._id } }]}).toArray();  
  
  const mergeData = [];

  for(const item of allData){
    const id = item._id;
    const email = item.email;
    const role = item.role;
    let nam;
    if(role=="Admin"){
      const dat = await admin.findOne({email:email});
      nam = dat.name;
    }else if(role=="Teacher"){
      const dat = await teacher.findOne({email:email});
      nam = dat.first_name+' '+dat.last_name;
    }else if(role=="Student"){
      const dat = await student.findOne({email:email});
      nam = dat.first_name+' '+dat.last_name;
    }else if(role=="Parents"){
      const dat = await parents.findOne({email:email});
      nam = dat.first_name+' '+dat.last_name;
    }
    const merge = {
      id,
      nam,
      email,
      role,
    };
    mergeData.push(merge);
  }

  msg="Successfully fetched all the users";
  res.json({success:true,message:msg,mergeData});
}catch(error){
    msg=error.message;
    res.json({success:false,message:msg});
  }
}
const AllUserss = async(req,res)=>{
const searchQuery = req.query.search;
const email = req.query.email;
const role = req.query.role;
let user;
   let msg;
  try{
    if(role=="Admin"){
    user = await admin.findOne({email:email});
  }else if(role=="Teacher"){
    user = await teacher.findOne({email:email});
  }else if(role=="Student"){
    user = await student.findOne({email:email});
  }else if(role=="Parents"){
    user = await parents.findOne({email:email});
  }
const userId = user._id;
    let filter = {};

    if (searchQuery) {
      // Create a regex pattern for the search query
      const regexPattern = new RegExp(searchQuery, 'i');
      filter = {
        $or: [
          { name: { $regex: regexPattern } },
          { email: { $regex: regexPattern } }
        ]
      };
    }

    // Exclude the current user
    filter._id = { $ne: userId };

    const users = await collection.find(filter).toArray();
    res.json({success:true,message:"Success",users});
  } catch (error) {
    console.error('Error:', error);
    res.json({success:false,message:'An error occurred'});
  }
}

const TimeTable = async(req,res) =>{
  const {class_std,
      Room,
      M1,M2,M3,M4,M5,M6,M7,M8,
      T1,T2,T3,T4,T5,T6,T7,T8,
      W1,W2,W3,W4,W5,W6,W7,W8,
      Th1,Th2,Th3,Th4,Th5,Th6,Th7,Th8,
      F1,F2,F3,F4,F5,F6,F7,F8,
      S1,S2,S3,S4,S5} = req.body;

      const valuesToCheck = [
    M1, M2, M3, M4, M5, M6, M7, M8,
    T1, T2, T3, T4, T5, T6, T7, T8,
    W1, W2, W3, W4, W5, W6, W7, W8,
    Th1, Th2, Th3, Th4, Th5, Th6, Th7, Th8,
    F1, F2, F3, F4, F5, F6, F7, F8,
    S1, S2, S3, S4, S5
  ];

  // Check if any value has a length less than or equal to 3
  if (!valuesToCheck.every(value => value.length > 3)) {
    return res.status(400).json({ success: false, message: 'Please enter the values in the Subject/Teacher form' });
  }
    let msg;
    try{
    const reqUser = await time_table.findOne({class_std});
    if(reqUser){
      msg = `Time table for class ${class_std} is already recorded `;
      return res.json({success:false,message:msg});
    }
    const newUser = await time_table.insertOne({
      class_std,Room,
      Monday:[M1,M2,M3,M4,M5,M6,M7,M8],
      Tuesday:[T1,T2,T3,T4,T5,T6,T7,T8],
      Wednesday:[W1,W2,W3,W4,W5,W6,W7,W8],
      Thursday:[Th1,Th2,Th3,Th4,Th5,Th6,Th7,Th8],
      Friday:[F1,F2,F3,F4,F5,F6,F7,F8],
      Saturday:[S1,S2,S3,S4,S5],
    });
    msg="Time Table Inserted Successfully";
    return res.json({success:true,message:msg});
  }
  catch (error) {
    msg=error.message;
    return res.status(500).json({success:false,message:msg});
  }
    
}

const ViewTimeTable = async(req,res)=>{
  const { class_std } = req.query;
  let msg;
  try{
    const table = await time_table.findOne({class_std});
    if(table){
      msg="Successfully fetched data";
      res.json({success:true,message:msg,table});
    }else{
      msg="No data found";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const ViewTimeTableS = async(req,res)=>{
  const { email } = req.query;
  let msg;
  try{
    const stu = await student.findOne({email:email});
    const table = await time_table.findOne({class_std:stu.class_std});
    if(table==null){
      msg="No time table alloted for this class";
      return res.json({success:false,message:msg});
    }
    if(table){
      msg="Successfully fetched data";
      return res.json({success:true,message:msg,table});
    }else{
      msg="No data found";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const ViewTimeTableP = async(req,res)=>{
  const { email } = req.query;
  let msg;
  try{
    const pare = await parents.findOne({email:email});
    const regex = /(\d+)/; 
    const match = pare.student_id.match(regex);
    const extractedPart = match[0];
    const table = await time_table.findOne({class_std:extractedPart});
    if(table==null){
      msg="No Time Table alloted for this class";
      return res.json({success:false,message:msg});
    }
    if(table){
      msg="Successfully fetched data";
      res.json({success:true,message:msg,table});
    }else{
      msg="No data found";
      return res.json({success:false,message:msg});
    }
  }catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

const DeleteTimeTable = async(req,res) => {
  const { class_std } = req.params;
  console.log(req.params);
  let msg;
  try{
    const data = await time_table.findOneAndDelete({class_std:class_std});
    if(data){
      msg="Successfully deleted the attendance";
      return res.json({success:true,message:msg,data});
    }else{
      msg="No able to delete the record please try againl later";
      return res.json({success:false,message:msg});
    }
  }
  catch(error){
    msg=error.message;
    return res.json({success:false,message:msg});
  }
}

export { Signup, Login, Home, AdminProfile, AddStudent, ViewStudent, EditStudent, DeleteStudent, 
  AdminAttendance,EditAttendance, AddStaff, TeacherProfile, ViewStaff, EditStaff, DeleteStaff, ChangePassword, StudentProfile, 
  AddAttendance, StudentList, ViewAttendance, DeleteAttendance, AddParent, ViewParents, EditParents, DeleteParents, 
  ParentsProfile, ParentsAttendance, AddProgressReport, TeacherViewProgressReport,ViewProgressReport, 
  EditProgressReport, DeleteProgressReport, 
  AllUsers, AccessChat, FetchChats, CreateGroupChat, RenameGroup, RemoveFromGroup, AddToGroup, 
  TimeTable, ViewTimeTable, ViewTimeTableS, ViewTimeTableP, DeleteTimeTable  };