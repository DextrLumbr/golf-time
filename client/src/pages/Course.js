import React, { useState } from "react";
import CreateCourse from "../components/Course";

function Course(props) {
  const { username } = props;
  console.log(username)
  return /*username ?*/ (
    <CreateCourse username={username} />
  )
}

export default Course;
