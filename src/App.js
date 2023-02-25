import Axios from 'axios'
import React, { useEffect, useState } from "react";
import PlayerStats from './PlayerStats';
import './App.css';

function App() {

    const [matchUps, setMatchUps] = useState("");

    const playerName = "Lebron James";

    const getTodaysGames = () => {
        Axios.get("https://www.balldontlie.io/api/v1/games?start_date=2023-02-25&end_date=2023-02-25")
            .then((response) => {
                console.log("NEW API CALL: ", response);
                setMatchUps(response.data.data);
            });
    };

    useEffect(() => {
        getTodaysGames();
    }, []);

    return (
        <div>
            {matchUps ? 
                matchUps.map(matchUps => {
                    return(
                       <div className="data" key={matchUps.id}>
                         <h3>{matchUps.visitor_team.name + " at " + matchUps.home_team.name }</h3>
                       </div>
                    )
                }) : <h3>No data yet</h3> }
            <PlayerStats playerName={playerName} />
        </div>
    );

};

export default App;
