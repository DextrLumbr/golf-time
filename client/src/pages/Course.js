import React, { useState } from "react";
import CreateCourse from "../components/Course";

function Course(props) {
  const { username, handicap } = props;
  console.log(props)
  return /*username ?*/ (
    <CreateCourse username={username} handicap={handicap} />
  )
}

export default Course;
