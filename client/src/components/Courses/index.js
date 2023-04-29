import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Axios from "axios";
import Modal from "../Modal/Modal.js";
import * as IoIcons from "react-icons/io";
import "./Courses.scss";

function Course(props) {
  const [courseName, setCourseName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [courseList, setCourseList] = useState([])
  const [showList, setShowList] = useState(false);

  // const history = useHistory();
  // const handleOnClick = useCallback(() => history.push('/sample'), [history]);

  // const { courseInfo } = props;
  useEffect(() => {
     // getAllNotes();
     Axios.get(`/api/courses`)
     .then((response) => {
       console.log(response.data)
       setCourseList([])
       response.data.map((item,index) => { setCourseList(courseList => [...courseList, item]) })
       // setCourseList(response.data)
       setShowList(true);
     })
     .catch(error => console.log(error))
  }, []);

  const findCourses = async (e) => {
    e.preventDefault();
    const response = await Axios.get(`/api/courses/${courseName}`);
    console.log(response.data)
    if (response.data.length === 0) {
      console.log('no entries')
    } else {
      setCourseList([])
      response.data.map((item,index) => { setCourseList(courseList => [...courseList, item]) })
      setShowList(true);
    }
    // setCourseList([])
    // response.data.map((item,index) => { setCourseList(courseList => [...courseList, item]) })
    // setCourseList(courseList => [...courseList, response.data])
    // console.log(courseList)
    // setShowList(false);
    // setShowList(true);
    /*if (response.data) {
      props.appLogin(response.data.username, rememberMe);
    } else {
      setModalOpen(true);
    }*/
  };

  return (
    <>
    <div className="page-container game-history">
    <h1 className="history-header">Course Finder</h1>
      <form id="login-form" onSubmit={(e) => findCourses(e)}>
        <div className="form-input">
          <label htmlFor="username">Course Name</label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            placeholder="Enter Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
        </div>
        {/*<div className="form-input checkbox">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <label htmlFor="remember-me">Remember Me</label>
        </div>*/}
        <div className="form-input">
          <button
            type="submit"
            className="btn-main"
            disabled={courseName ? false : true}
          >
            Find
          </button>
        </div>
      </form>

      {showList ?
        <ListCourses handleCourseData={courseList}/> :
        <p>none</p>}
        {/*<Tst handleCourseData={courseList}/>*/}

        </div>
    </>
  );

}

export default Course;

function Tst(props,index) {
  console.log(props)
  /*let path = `course/${props.handleCourseData[index].cid}`;
  let history = useHistory();
  history.push(path);*/
  // return(<></>)
}

function ListCourses(props) {
  const history = useHistory();
  // console.log(props.handleCourseData[0])
  return (<>
    <div className="game-data">
    {props.handleCourseData.map((value, index) => {
      return <div
        className="game-data-child"
        // key={value.slug}
        key={index}
        // onClick={() => Tst(props,index)}
        onClick={() => { history.push(`/course/${value.cid}`) }}
      >
        <div className="game-data-info">
          <div className="game-data-top">
            <h2>{value.name}</h2>
            {/*<h3 className="score">Score: {value.slug}</h3>*/}
          </div>
          <div className="game-data-bottom">
            <p className="small-font">{value.location ? value.location : value.address.cityState}</p>
            {/*<p className="small-font">Players: {value.slug}</p>*/}
          </div>
        </div>

      </div>
    })}
    </div>
    </>)
}
