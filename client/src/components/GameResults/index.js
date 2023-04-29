import React, { useRef, useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { IconContext } from "react-icons";

import "./GameResults.scss";

function GameResults(props) {
  // Pass game details
  const { detailsDisplay } = props;

  const [date, setDate] = useState('');
  const dateInputRef = useRef(null);
  const handleChange = (e) => {
    setDate(e.target.value);
  };



  // Create top row based on how many holes there were
  let holeRows = [];
  if (detailsDisplay.holes > 9) {
    console.log(detailsDisplay)
    // let holeRows = [];
    for (let i = 0; i < detailsDisplay.holes/2; i++) {
      holeRows.push(<td key={i}>{i + 1}</td>);
    }
  } else {
    console.log(detailsDisplay.holes)
    // let holeRows = [];
    for (let i = 0; i < detailsDisplay.holes; i++) {
      holeRows.push(<td key={i}>{i + 1}</td>);
    }
  }
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

  // console.log(detailsDisplay.scorecard.slice(0,9).reduce(function (acc, obj) { return acc + obj.par; }, 0))

  // Map out par for each hole
  const parMap = detailsDisplay.players.map((player, index) => {
    const scoreMap = holeRows.map((score, index) => (
      <td key={index}>{detailsDisplay.scorecard[index].par}</td>
    ))
    /*const scoreMap = player.gameArray.map((score, index) => (
      <td key={index}>{score}</td>
    ));*/
    const totalScore = detailsDisplay.scorecard.slice(0,9).reduce(function (acc, obj) { return acc + obj.par; }, 0) // player.gameArray.reduce((a, b) => a + b, 0);
    return (
      <tr key={index}>
        <th className="player-name">Par</th>
        {scoreMap}
        <th className="total">{totalScore}</th>
      </tr>
    );
  });

  return (
    <>
      <div className="details-display">
        <div className="details-header">
          <IconContext.Provider value={{ color: "#1e1e1e" }}>
            <IoIcons.IoIosArrowBack id="arrow-back" onClick={props.goBack} />
          </IconContext.Provider>
          <h1>Details</h1>
          <IconContext.Provider value={{ color: "#1e1e1e" }}>
            <IoIcons.IoIosCreate id="edit-right" onClick={props.goBack} />
          </IconContext.Provider>
        </div>

        <form>
        <div className="details-info">
            {/*<input
            type="date"
            onChange={handleChange}
            ref={dateInputRef}
          />*/}
          <p className="small-font">{detailsDisplay.date}</p>
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
              {holeRows}
              <th className="total">Total</th>
            </tr>
            {parMap}
            {playerMap}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default GameResults;
