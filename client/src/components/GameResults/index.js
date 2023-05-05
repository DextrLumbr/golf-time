import React, { useRef, useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { IconContext } from "react-icons";

import "./GameResults.scss";

function GameResults(props) {
  // Pass game details
  const { detailsDisplay } = props;

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [date, setDate] = useState(detailsDisplay.date);
  const dateInputRef = useRef(null);
  /*const handleChange = (e) => {
    setDate(e.target.value);
  };*/

var checkDate = new Date(date);
const defaultValue = checkDate.toLocaleDateString('en-NY');
const handleChange = (e) => {
    setDate(e.target.value);
    setIsFormVisible(false)
  };
  const dateForm =
      <input
        className="small-font"
        type="date"
        onChange={handleChange}
        defaultValue={checkDate.toISOString().split('T')[0]}
      />
   
  function setIndex(date){
          /*var emp = this.state.employees[index];
          emp.index = index;
          this.setState({
              isFormVisible: true  //This will make form visible
          }, () => this.setState({
              currentEmp: emp,
              current: 'Update',
              index,  //set index in state
          }));*/
          // setDate(detailsDisplay.date)
          setIsFormVisible(true)
          console.log(date)
      }

  // Create top row based on how many holes there were
  let holeRows = [];
  let frontNine = [];
  let backNine = [];
  let parRowsOut = []
  let parRowsIn = []
  /*if (detailsDisplay.holes > 9) {
    console.log(detailsDisplay)
    // let holeRows = [];
    for (let i = 0; i < detailsDisplay.holes/2; i++) {
      holeRows.push(<td key={i}>{i + 1}</td>);
    }
  } else {*/
    console.log(detailsDisplay.holes)
    // let holeRows = [];
    for (let i = 0; i < detailsDisplay.holes; i++) {
      holeRows.push(<td key={i}>{i + 1}</td>);
      if (i>8) {
        backNine.push(<td key={i}>{i + 1}</td>)
        parRowsIn.push(<td key={i}>{detailsDisplay.scorecard[i].par}</td>)
      } else {
        frontNine.push(<td key={i}>{i + 1}</td>)
        parRowsOut.push(<td key={i}>{detailsDisplay.scorecard[i].par}</td>)
      }
    }
  // }
  const parScoreOut = detailsDisplay.scorecard.slice(0,9).reduce(function (acc, obj) { return acc + obj.par; }, 0)
  parRowsOut.push(<td key={9}>{parScoreOut}</td>)
  const parScoreIn = detailsDisplay.scorecard.slice(9).reduce(function (acc, obj) { return acc + obj.par; }, 0)
  parRowsIn.push(<td key={18}>{parScoreIn}</td>)

  const parRows = holeRows.map((score, index) => (
    <td key={index}>{detailsDisplay.scorecard[index].par}</td>
  ))

  // const parScore = detailsDisplay.scorecard.reduce((a, b) => a.par + b.par, 0);
  const parScore = detailsDisplay.scorecard.slice(0,9).reduce(function (acc, obj) { return acc + obj.par; }, 0)
  parRows.push(<td key={9}>{parScore}</td>)
  // const frontNine = detailsDisplay.holes.slice(0,8)
  /*let holeRows = [];
  for (let i = 0; i < detailsDisplay.holes/2; i++) {
    holeRows.push(<td key={i}>{i + 1}</td>);
  }*/

  // Sorting player array by total score
  detailsDisplay.players.sort(
    (a, b) =>
      a.gameArray.reduce((c, d) => c + d, 0) -
      b.gameArray.reduce((c, d) => c + d, 0)
  );

  // Map out each players score
  const playerMap = detailsDisplay.players.map((player, index) => {
    const scoreMap = holeRows.map((score, index) => (
      <td key={index}>{player.gameArray[index]}</td>
    ))
    /*const scoreMap = player.gameArray.map((score, index) => (
      <td key={index}>{score}</td>
    ));*/
    const totalScore = player.gameArray.reduce((a, b) => a + b, 0);
    return (
      <tr key={index}>
        <th className="player-name">{player.username.split('')[0]}</th>
        {scoreMap}
        <th className="total">{totalScore}</th>
      </tr>
    );
  });

  // Map out each players score
  const playerMapOut = detailsDisplay.players.map((player, index) => {
    const scoreMap = frontNine.map((score, index) => (
      <td key={index}>{player.gameArray[index]}</td>
    ))
    /*const scoreMap = player.gameArray.map((score, index) => (
      <td key={index}>{score}</td>
    ));*/
    const totalScore = player.gameArray.slice(0,9).reduce((a, b) => a + b, 0);
    return (
      <tr key={index}>
        <th className="player-name">{player.username.split('')[0]}</th>
        {scoreMap}
        <th className="total">{totalScore}</th>
      </tr>
    );
  });

  const playerMapIn = detailsDisplay.players.map((player, index) => {
    const scoreMap = backNine.map((score, index) => (
      <td key={index}>{player.gameArray.slice(9)[index]}</td>
    ))
    /*const scoreMap = player.gameArray.map((score, index) => (
      <td key={index}>{score}</td>
    ));*/
    const totalScore = player.gameArray.slice(9).reduce((a, b) => a + b, 0);
    return (
      <tr key={index}>
        <th className="player-name">{player.username.split('')[0]}</th>
        {scoreMap}
        <th className="total">{totalScore}</th>
      </tr>
    );
  });

  // console.log(detailsDisplay.scorecard.slice(0,9).reduce(function (acc, obj) { return acc + obj.par; }, 0))

  return (
    <>
      <div className="details-display">
        <div className="details-header">
          <IconContext.Provider value={{ color: "#1e1e1e" }}>
            <IoIcons.IoIosArrowBack id="arrow-back" onClick={props.goBack} />
          </IconContext.Provider>
          <h1>Details</h1>
          {/*<IconContext.Provider value={{ color: "#1e1e1e" }}>
            <FaIcons.FaRegEdit id="edit-right" onClick={()=>setIndex(detailsDisplay.date)} />
          </IconContext.Provider>*/}
        </div>

        <form>
        <div className="details-info">
            {/*<input
            type="date"
            onChange={handleChange}
            ref={dateInputRef}
          />*/}
          {isFormVisible ? dateForm : <div style={{display:'inline-flex'}}><p className="small-font" style={{marginRight:'5px'}}>{date}</p>
          <IconContext.Provider value={{ color: "#1e1e1e" }}>
            <FaIcons.FaPen id="edit-right" onClick={()=>setIndex(date)} />
          </IconContext.Provider>
          </div>}
          {/*<p className="small-font">{detailsDisplay.date}</p>*/}
          <h2>{detailsDisplay.course}</h2>
          <p>
            Game Pin: <strong>{detailsDisplay.pin}</strong>
          </p>
        </div>
        </form>

        <h2 id="table-heading">Scorecard</h2>
        <table id="player-scores">
          <tbody>
            <tr className="heading-row">
              <th className="hole">Hole</th>
              {/*holeRows*/}
              {frontNine}
              <th className="total">Total</th>
            </tr>
            <tr>
              <th className="Par">Par</th>
              {parRowsOut}
              {/*<th className="total">tot</th>*/}
            </tr>
            {/*{parMap}*/}
            {playerMapOut}
          </tbody>
        </table>

        {backNine ?
        <table id="player-scores">
          <tbody>
            <tr className="heading-row">
              <th className="hole">Hole</th>
              {backNine}
              <th className="total">Total</th>
            </tr>
            <tr>
              <th className="Par">Par</th>
              {parRowsIn}
              {/*<th className="total">tot</th>*/}
            </tr>
            {/*{parMap}*/}
            {playerMapIn}
          </tbody>
        </table> : null}

      </div>
    </>
  );
}

export default GameResults;
