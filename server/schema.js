import Joi from "joi";
import { tlds } from "@hapi/tlds";
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const empId = /^EMP\d{2}$/;
//const studentId = /^HVS(0[1-9]|1[0-2])[A-D]01([0-9]|[1-9][0-9])$/;

const AdminSignupSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: tlds },
    })
    .required(),
  designation:Joi.string().min(3).max(35),
  role:Joi.string(),
  password: Joi.string().pattern(passwordRegex).required()
});

const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: tlds },
    })
    .required(),
  password: Joi.string().pattern(passwordRegex).required(),
  newpassword: Joi.string().pattern(passwordRegex).default(123),
  role:Joi.string()
});

const studentRegistrationSchema=Joi.object({
  roll_no: Joi.string().length(8),
  first_name:Joi.string().min(1).max(25).required(),
  last_name:Joi.string().min(1).max(25).required(),
  father_name:Joi.string().min(3).max(30).required(),
  mother_name:Joi.string().min(3).max(30).required(),
  dob:Joi.date().iso().required(),//.iso()
  age:Joi.number().min(3).max(129),
  gender:Joi.string().regex(/^(Male|Female)$/).required(),
  admission_year:Joi.number().required(),
  class_std:Joi.number().min(1).max(10).required(),
  section:Joi.string().length(1).required().regex(/^[A-D]$/),
  class_teacher_id:Joi.string().pattern(empId).required(),
  email:Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: tlds },
  })
  .required(),
  mob_num:Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  address:Joi.string().min(5).max(100).required(),
});

const staffRegistrationSchema=Joi.object({
   emp_id:Joi.string().length(5),
   first_name:Joi.string().min(1).max(25).required(),
   last_name:Joi.string().min(1).max(25).required(),
   dob:Joi.date().iso().required(),
   age:Joi.number().min(3).max(129),
   gender:Joi.string().regex(/^(Male|Female)$/).required(),
   qualification:Joi.string().min(2).max(25),
   course:Joi.string().required(),
   designation:Joi.string().required(),
   email:Joi.string()
   .email({
     minDomainSegments: 2,
     tlds: { allow: tlds },
   })
   .required(),
   mob_num:Joi.string().length(10).pattern(/^[0-9]+$/).required(),
   address:Joi.string().min(5).max(100).required(),
});

const parentsRegistrationSchema=Joi.object({
  first_name:Joi.string().min(1).max(25).required(),
  last_name:Joi.string().min(1).max(25).required(),
  student_id:Joi.string().length(8).required(),
  email:Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: tlds },
  })
  .required(),
  mob_num:Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  address:Joi.string().min(5).max(100).required(),
});


const attendanceSchema=Joi.object({
  student_id:Joi.string().length(8).required(),
  marked_by:Joi.string(),
  class:Joi.number().min(1).max(12),
  date:Joi.date().iso().required(),
  month:Joi.string().regex(/^(January|February|March|April|May|June|July|August|September|October|November|December)$/),
  status:Joi.string().regex(/^(Present|Absent|Holiday)$/).required(),
})

const studentProgressReportSchema =Joi.object({
  kannada:Joi.number().min(0).max(100).required(),
  english:Joi.number().min(0).max(100).required(),
  hindi:Joi.number().min(0).max(100).required(),
  maths:Joi.number().min(0).max(100).required(),
  science:Joi.number().min(0).max(100).required(),
  social:Joi.number().min(0).max(100).required(),
  physical_education:Joi.number().min(0).max(100).required(),
  drawing:Joi.string().min(1).max(2).required(),
  computer_science:Joi.number().min(0).max(100).required(),
  moral_science:Joi.string().min(1).max(2).required(),
  test_type:Joi.string().regex(/^(FA1|FA2|FA3|FA4|SA1|SA2)$/).required(),
  student_id:Joi.string().length(8).required(),
  feedback:Joi.string(),
  class_teacher_id:Joi.string().regex(empId).required(),
})

const ChatSchema = Joi.object({
  chatName: Joi.string().min(3).max(30).required(),
  isGroupChat: Joi.boolean().required(),
  users: Joi.array().items(Joi.string()).required(),
  latestMessage: Joi.string(),
  groupAdmin: Joi.string(),
});

const messageSchema = Joi.object({
  sender: Joi.string().required(), // You might use a more specific type for the sender, like an ObjectId
  content: Joi.string().trim().required(),
  chat: Joi.string().required(), // Reference to the chat or conversation, you can use ObjectId here
  readBy: Joi.array().items(Joi.string()), // References to users who have read the message
  createdAt: Joi.date().timestamp('javascript'),
});

const timeTableSchema = Joi.object({
  class_std:Joi.number().min(1).max(10).required(),
  Room:Joi.number().required(),
  Monday: Joi.array().items(Joi.string()).required(),
  Tuesday: Joi.array().items(Joi.string()).required(),
  Wednesday: Joi.array().items(Joi.string()).required(),
  Thursday: Joi.array().items(Joi.string()).required(),
  Friday: Joi.array().items(Joi.string()).required(),
  Saturday: Joi.array().items(Joi.string()).required(),
});
export { AdminSignupSchema, userLoginSchema, studentRegistrationSchema, staffRegistrationSchema, 
  parentsRegistrationSchema, studentProgressReportSchema, attendanceSchema, ChatSchema, messageSchema, timeTableSchema }