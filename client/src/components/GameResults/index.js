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
const defaultValue = checkDate// .toLocaleDateString('en-NY');
const handleChange = (e) => {
    console.log(e.target.value)
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
          console.log(new Date(date).toISOString())
          // "<YYYY-mm-ddTHH:MM:ssZ>"
      }

  // Create top row based on how many holes there were
  // let holeRows = [];
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
    console.log(detailsDisplay)
    // detailsDisplay.players[0].playerMatchData.length
    for (let i = 0; i < detailsDisplay.holes; i++) {
      // holeRows.push(<td key={i}>{i + 1}</td>);
      parRowsOut.push(<td key={i}>{detailsDisplay.scorecard[i].par}</td>)
    }
    var holeRows = detailsDisplay.players[0].playerMatchData.map((obj,i) => <td key={i}>{obj.holeNumber}</td>)
    // let holeRows = [];
    /*for (let i = 0; i < detailsDisplay.holes; i++) {
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
  parRows.push(<td key={9}>{parScore}</td>)*/
  // const frontNine = detailsDisplay.holes.slice(0,8)
  /*let holeRows = [];
  for (let i = 0; i < detailsDisplay.holes/2; i++) {
    holeRows.push(<td key={i}>{i + 1}</td>);
  }*/

  // Sorting player array by total score
  detailsDisplay.players.sort(
    (a, b) =>
      a.playerMatchData.reduce((c, d) => c.strokes + d, 0) -
      b.playerMatchData.reduce((c, d) => c.strokes + d, 0)
  );

  // Map out each players score
  const playerMap = detailsDisplay.players.map((player, index) => {
    // console.log(player.playerMatchData)

    const scoreMap = player.playerMatchData.map((obj,index) =>
      // console.log(obj.strokes);
      <td key={index}>{obj.strokes}</td>
      // obj.strokes;
    )

    // const scoreMap = player.playerMatchData.map((x,index)=> <td key={index}>{x.strokes}</td>)
    const totalScore = player.playerMatchData.reduce((accum, obj) => accum + obj.strokes, 0); // player.playerMatchData.reduce((a, b) => a.strokes + b.strokes, 0);
    // console.log(scoreMap)

    return (
      <tr key={index}>
        <th className="player-name">{player.username.split('')[1]}</th>
        {scoreMap}
        <th className="total">{totalScore}</th>
      </tr>
    );
  });

  // var scorecardContent = []
  // var playerScore = []
  var holeCount = detailsDisplay.holes> 9 ? 2 : 1
  // var holeRowss = holeCount == 2 ? detailsDisplay.players[0].playerMatchData.slice(0,9).map((obj,i) => <td key={i}>{obj.holeNumber}</td>) : detailsDisplay.players[0].playerMatchData.slice(9).map((obj,i) => <td key={i}>{obj.holeNumber}</td>)
  // var parRowssOut = holeCount == 2 ? detailsDisplay.players[0].playerMatchData.slice(0,9).map((obj,i) => <td key={i}>{obj.par}</td>) : detailsDisplay.players[0].playerMatchData.slice(9).map((obj,i) => <td key={i}>{obj.par}</td>)
  const scorecard = new Array(holeCount).fill(null).map((x,rayIndex) => {
    var playerScore = []
    var holeRowss = rayIndex == 0 ? detailsDisplay.players[0].playerMatchData.slice(0,9).map((obj,i) => <td key={i}>{obj.holeNumber}</td>) : detailsDisplay.players[0].playerMatchData.slice(9).map((obj,i) => <td key={i}>{obj.holeNumber}</td>)
    var parRowssOut = rayIndex == 0 ? detailsDisplay.players[0].playerMatchData.slice(0,9).map((obj,i) => <td key={i}>{obj.par}</td>) : detailsDisplay.players[0].playerMatchData.slice(9).map((obj,i) => <td key={i}>{obj.par}</td>)
    var parTotal = rayIndex == 0 ? detailsDisplay.players[0].playerMatchData.slice(0, 9).map((obj,i) => obj.par).reduce((a, b) => a + b, 0) : detailsDisplay.players[0].playerMatchData.slice(9).map((obj,i) => obj.par).reduce((a, b) => a + b, 0)
    // make table here
    detailsDisplay.players.sort(
      (a, b) =>
        a.playerMatchData.reduce((c, d) => c + d.strokes, 0) - b.playerMatchData.reduce((c, d) => c + d.strokes, 0)
    );
    detailsDisplay.players.map((player, index) => {
      const playerScoreMap = rayIndex == 0 ? player.playerMatchData.slice(0,9).map((obj,i) =>// {
        // console.log(obj.strokes);
        <td key={i}>{obj.strokes}</td>
        // obj.strokes;
      ) : player.playerMatchData.slice(9).map((obj,i) =>// {
        // console.log(obj.strokes);
        <td key={i}>{obj.strokes}</td>
        // obj.strokes;
      )
      var totalScore = rayIndex == 0 ? player.playerMatchData.slice(0, 9).reduce((accum, obj) => accum + obj.strokes, 0) : player.playerMatchData.slice(9).reduce((accum, obj) => accum + obj.strokes, 0)
      // var holeRowss = rayIndex == 0 ? player.playerMatchData.slice(9).map((obj,i) => <td key={i}>{obj.holeNumber}</td>) : player.playerMatchData.slice(0,9).map((obj,i) => <td key={i}>{obj.holeNumber}</td>)
      // var parRowsOut = rayIndex == 0 ? player.playerMatchData.slice(9).map((obj,i) => <td key={i}>{obj.par}</td>) : player.playerMatchData.slice(0,9).map((obj,i) => <td key={i}>{obj.par}</td>) // <td key={i}>{detailsDisplay.scorecard[i].par}</td>
      // parRowsOut.push(<td key={'total'}>{player.playerMatchData.map((obj,i) => detailsDisplay.scorecard[i].par).reduce((a, b) => a + b, 0) }</td> )
      // console.log(parRowsOut)
      playerScore.push(
        <tr key={index}>
          <th className="player-name">{player.username.split('')[1]}</th>
          {playerScoreMap}
          <th className="total">{totalScore}</th>
        </tr>
        /*<table id="player-scores">
          <tbody>

          <tr className="heading-row">
            <th className="hole">Hole</th>
            {holeRows}
            <th className="total">Total</th>
          </tr>
          <tr>
            <th className="Par">Par</th>
            {parRowsOut}
            {<th className="total">tot</th>}
          </tr>

            <tr key={index}>
              <th className="player-name">{player.username.split('')[1]}</th>
              {playerScoreMap}
              <th className="total">{totalScore}</th>
            </tr>

          </tbody>
        </table>*/
      )
    })
    return (
      // playerScore
      <table id="player-scores" key={rayIndex}>
        <tbody>

        <tr className="heading-row">
          <th className="hole">Hole</th>
          {holeRowss}
          {<th className="total">Total</th>}
        </tr>
        <tr>
          <th className="Par">Par</th>
          {parRowssOut}

          {<th className="total">{parTotal}</th>}
        </tr>

        {playerScore}
        </tbody>
        </table>
    )
  })

  // Map out each players score
  /*const playerMapOut = detailsDisplay.players.map((player, index) => {
    const scoreMap = frontNine.map((score, index) => (
      // <td key={index}>{player.gameArray[index]}</td>
      player.adjustedArray[index] ? <td key={index}><sup>{player.gameArray[index]}</sup>/<sub>{player.adjustedArray[index]}</sub></td> : <td key={index}>{player.gameArray[index]}</td>
    ))
    const totalScore = player.gameArray.slice(0,9).reduce((a, b) => a + b, 0);
    const totalAdjScoreOut = player.adjustedArray.slice(0,9).reduce((a, b) => a + b, 0);
    return (
      <tr key={index}>
        <th className="player-name">{player.username.split('')[0]}</th>
        {scoreMap}
        <th className="total"><sup>{totalScore}</sup>/<sub>{totalAdjScoreOut}</sub></th>
      </tr>
    );
  });*/

  /*const playerMapIn = detailsDisplay.players.map((player, index) => {
    const scoreMap = backNine.map((score, index) => (
      // <td key={index}>{player.gameArray.slice(9)[index]}</td>
      player.adjustedArray.slice(9)[index] ? <td key={index}><sup>{player.gameArray.slice(9)[index]}</sup>/<sub>{player.adjustedArray.slice(9)[index]}</sub></td> : <td key={index}>{player.gameArray.slice(9)[index]}</td>
    ))
    const totalScore = player.gameArray.slice(9).reduce((a, b) => a + b, 0);
    console.log(totalScore)
    const totalAdjScoreIn = player.adjustedArray.slice(9).reduce((a, b) => a + b, 0);
    return ( totalScore ?
      <tr key={index}>
        <th className="player-name">{player.username.split('')[0]}</th>
        {scoreMap}
        <th className="total"><sup>{totalScore}</sup>/<sub>{totalAdjScoreIn}</sub></th>
      </tr> : null
    );
  });*/

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
        {scorecard}
        {/*<table id="player-scores">
          <tbody>
            <tr className="heading-row">
              <th className="hole">Hole</th>
              {holeRows}
              <th className="total">Total</th>
            </tr>
            <tr>
              <th className="Par">Par</th>
              {parRowsOut}
              {<th className="total">tot</th>}
            </tr>
            {playerMap}
          </tbody>
        </table>*/}

        {/*
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
            </tr>
            {playerMapIn}
          </tbody>
        </table>*/}

      </div>
    </>
  );
}

export default GameResults;
