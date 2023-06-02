import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useHistory } from "react-router-dom";
import "./Scorecard.scss";

function Scorecard(props) {
  // Game Data from GameSetup component
  const { gameData } = props;
  const [gameArray, setGameArray] = useState([]);
  const history = useHistory();

  useEffect(() => {
    console.log(props)
    const sessionGame = () => {
      // If rejoining an unfinished game, display the saved values
      if (sessionStorage.getItem("game_pin") === gameData.pin) {
        setGameArray(JSON.parse(sessionStorage.getItem("game_score")));
      } else {
        // Create a new game array if game pins do not match
        let newArray = [];
        console.log(gameData)
        if (gameData.scorecard) {
          var holeCount = gameData.holes ? gameData.holes : gameData.scorecard.length
          for (let i = 0; i < holeCount; i++) {
            newArray.push({
              holeNumber: i + 1,
              strokes: undefined,
              par: gameData.scorecard[i].par
            });
          }
        } else {
          for (let i = 0; i < gameData.holes; i++) {
            newArray.push({
              holeNumber: i + 1,
              strokes: 0,
            });
          }
        }
        setGameArray(newArray);
        console.log(newArray)
        // Save new game array and new game pin to session storage
        sessionStorage.setItem("game_score", JSON.stringify(newArray));
        sessionStorage.setItem("game_pin", gameData.pin);
      }
    };
    sessionGame();
  }, [gameData.pin, gameData.holes]);

  // Map out the inputs for every hole based on the game array
  const mapGame = gameArray.map((game) => (
    <div className="score-input" key={game.holeNumber.toString()}>
      <div><label>Hole {game.holeNumber}</label><br/>
      {game.par ? <p>Par {game.par}</p> : null}</div>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        className={game.strokes !== 0 ? "completed" : undefined}
        value={game.strokes !== 0 ? game.strokes : ""}
        onFocus={(e) => e.target.select()}
        onChange={(e) => updateScore(+e.target.value, game.holeNumber)}
      />
    </div>
  ));

  // Update the score on change to session storage and useState
  const updateScore = (strokes, currentHole) => {
    // console.log(strokes)
    if (Number.isInteger(strokes)) {
      // Match the updating input with the array
      let findH = gameArray.find(
        ({ holeNumber }) => holeNumber === currentHole
      );
      let newData = [...gameArray];
      findH.strokes = strokes;
      setGameArray(newData);
      console.log(newData)
      sessionStorage.setItem("game_score", JSON.stringify(newData));
    }
  };

  const updateHandicap = async (gameData) => {
    const userHistory = await Axios.get(`/api/account/${gameData.username}`);
    let gameHistory = userHistory.data.games;
    if (gameHistory.length > 0) {
      let passData = { pinArray: gameHistory };
      const arrayData = await Axios.get(`/api/player/games`, {
        params: passData,
      });
      // arrayData
      arrayData.data.games.sort((a, b) => new Date(b.date) - new Date(a.date));
        // console.log(arrayData.data.games)
      var arrayOfAvgs = []
      arrayData.data.games.slice(0,20).map((obj,index) => {
        // find strokes over park
        if (obj.holes === 9) {
          arrayOfAvgs.push( (obj.players.find(x=>x.username == gameData.username).playerMatchData.map(x=>x.strokes).reduce((partialSum, a) => partialSum + a, 0) - obj.players.find(x=>x.username == gameData.username).playerMatchData.map(x=>x.par).reduce((partialSum, a) => partialSum + a, 0))*2 )
        } else {
          arrayOfAvgs.push(obj.players.find(x=>x.username == gameData.username).playerMatchData.map(x=>x.strokes).reduce((partialSum, a) => partialSum + a, 0) - obj.players.find(x=>x.username == gameData.username).playerMatchData.map(x=>x.par).reduce((partialSum, a) => partialSum + a, 0))
        }
      })
      var top8 = arrayOfAvgs.sort((a, b) => {return a-b}).slice(0,8)
      console.log(top8.reduce((a, b) => a + b)/top8.length)
      const handicapRoute = await Axios.patch(`/api/player/${gameData.username}`, {
        handicap: top8.reduce((a, b) => a + b)/top8.length,
      });
      console.log(handicapRoute)
      // sessionStorage.removeItem("handicap");
      sessionStorage.setItem("handicap", Number(Math.round(top8.reduce((a, b) => a + b)/top8.length)));
      // setGameData(arrayData.data.games);
    }
  }

  // Finish game and submit score to the database
  const finishGame = async () => {
    let pushScore = [];
    var holeCount = Number(gameArray.filter(x=>x.strokes !== undefined).length)
    var pushAdjust = new Array(holeCount).fill(null);
    console.log(holeCount)
    // Only send # of strokes to the database
    for (let score of gameArray) {
      if (score.strokes != undefined) {
        pushScore.push(score.strokes);
      }
    }

    var holesToCount = gameArray.filter(w=>w.strokes).map(w=>w.holeNumber)
    // console.log(scorecard.filter(y=>holesToCount.includes(y.holeNumber )).sort((a,b) => a.slope-b.slope))
    var filteredScorecard = gameData.scorecard.filter(y=>holesToCount.includes(y.holeNumber )).sort((a,b) => a.slope-b.slope)

    var x = 0
    var i = 0
    var currHandicap = holeCount > 9 ? gameData.handicap : gameData.handicap/2
    while (x<currHandicap) {
      // console.log(i)
      if (gameArray.find(y=>y.holeNumber == filteredScorecard[i].holeNumber).hcpStrokes) {
        gameArray.find(y=>y.holeNumber == filteredScorecard[i].holeNumber).hcpStrokes = gameArray.find(y=>y.holeNumber == filteredScorecard[i].holeNumber).hcpStrokes+1
      } else {
        // add to adjScore
        gameArray.find(y=>y.holeNumber == filteredScorecard[i].holeNumber).hcpStrokes = 1 // gameArray.find(y=>y.holeNumber == filteredScorecard[i].holeNumber).strokes - 1
      }
      // if i/handicap == 1 reset i else continue
      i >= filteredScorecard.length-1 ? i = 0 : i++
      x++
    }
    console.log(gameArray.filter(w=>w.strokes))

    /*var x = 1
    var currHandicap = holeCount > 9 ? gameData.handicap : gameData.handicap/2
    while (x<=currHandicap) {
      // console.log(gameData)
      if (x>currHandicap) {
        var holeNumb = gameData.scorecard.find(y=>y.slope == x-currHandicap).holeNumber
        pushAdjust[holeNumb-1] = pushAdjust[holeNumb-1]-1
        // console.log(scores[holeNumb-1])
      } else {
        if (gameData.scorecard.find(y=>y.slope == Number(x))) {
          var holeNumb = gameData.scorecard.find(y=>y.slope == x).holeNumber
          var holesToCount = gameArray.filter(w=>w.strokes).map(w=>w.holeNumber)
          pushAdjust[holeNumb-1] = pushScore[holeNumb-1] - 1
          // gameData.scorecard.filter(y=>holesToCount.includes(y.holeNumber ))
          // gameArray.filter(y=>y.holeNumber )
          gameArray.find(y=>y.holeNumber == holeNumb).adjStrokes = gameArray.find(y=>y.holeNumber == holeNumb).strokes - 1
        }
        // console.log(gameData.scorecard.find(y=>y.slope == x).holeNumber)
      }
      // console.log('hole ' + holeNumb  + 'new score is ' + pushAdjust[holeNumb-1] + ' instead of ' +  pushScore[holeNumb-1])
      x++
    }
    console.log(gameArray)*/

    const response = await Axios.patch(`/api/games/${gameData.pin}`, {
      username: gameData.username,
      handicap: gameData.handicap,
      gameArray: pushScore,
      playerData: gameArray.filter(w=>w.strokes),
      // adjustedArray: pushAdjust,
      holes: holeCount
    });
    if (response.data) {

      const addPin = await Axios.patch(`/api/account/${gameData.username}`, {
        newPin: gameData.pin,
      });
      if (addPin.data) {
        // check handicap
        updateHandicap(gameData)
      }
      // Clear session storage on submit and also redirect the user to the game history page
      sessionStorage.removeItem("game_score");
      sessionStorage.removeItem("game_pin");
      history.push("/history");
    }
  };

  return (
    <div className="page-container">
      <div className="scorecard">
        <div className="scorecard-title">
          <span>Game PIN:</span>
          <h1>{gameData.pin}</h1>
        </div>
        <div className="scorecard-info">
          <h2>{gameData.course}</h2>
          <p>{gameData.holes}-Hole Course</p>
        </div>
        <div className="scorecard-sheet">{mapGame}</div>
        <button onClick={() => finishGame()} className="btn-main">
          Finish Game
        </button>
      </div>
    </div>
  );
}

export default Scorecard;
