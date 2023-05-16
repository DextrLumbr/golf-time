import React, { useState, useEffect } from "react";
import Axios from "axios";
import Modal from "../Modal/Modal.js";
import Scorecard from "../Scorecard";
import { useParams, useHistory } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { IconContext } from "react-icons";

function Course(props) {
  const [courseInfo, setCourseInfo] = useState("");
  const [gameData, setGameData] = useState(null);
  const { username, handicap } = props;
  const { cid } = useParams()
  console.log(cid)
  console.log(handicap)
  let history = useHistory();

  const handleGameData = (gameData) => {
    setGameData({
      username: username,
      handicap: handicap,
      pin: gameData.pin,
      holes: gameData.holes,
      course: gameData.course,
      scorecard: gameData.scorecard
    });
  };

  useEffect(() => {
     // getAllNotes();
     Axios.get(`/api/course/${cid}`)
     .then((response) => {
       console.log(response.data)
       setCourseInfo(response.data)
     })
     .catch(error => console.log(error))
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const newPin = (Math.floor(Math.random() * 9000) + 1000).toString();
    const response = await Axios.post(`/api/games/${newPin}`, {
      course: courseInfo.name,
      holes: Number(courseInfo.scorecard.length),
      scorecard: courseInfo.scorecard
    });
    console.log(response)
    if (response.data) {
      handleGameData(response.data);
    }
  }
  // const response = await Axios.get(`/api/course/${cid}`);
  // console.log(response.data)
  /*Axios.get(`/api/course/${cid}`)
  .then((response) => {
    console.log(response.data)
    setCourseInfo(response.data)
  })
  .catch(error => console.log(error))*/
  return gameData ? (
    <Scorecard gameData={gameData} />
  ) : (<><div className="page-container game-history">
  <div className="details-header">
    <IconContext.Provider value={{ color: "#1e1e1e" }}>
      <IoIcons.IoIosArrowBack id="arrow-back" onClick={history.goBack} />
    </IconContext.Provider>
    <h1 className="course-header">{courseInfo.name}</h1>
  </div>
  <table dangerouslySetInnerHTML={createMarkup(courseInfo.scorecardHtml)} />
  <div className="form-input" style={{width:"80%"}}>
    <button
      type="submit"
      /*disabled={holes === 0 || courseName === ""}*/
      onClick= {(e) => handleCreate(e)}
      className="btn-main"
    >
      Start Round
    </button>
    </div>
  </div></>)

}

function createMarkup(html) {
  return {__html: html};
}

export default Course;
