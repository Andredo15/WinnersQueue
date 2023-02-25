import Axios from 'axios'
import React, { useEffect, useState } from "react";
import PlayerStats from './PlayerStats';
import './App.css';

function App() {

    const [matchUps, setMatchUps] = useState("");

    const playerName = "Lebron James";

    const getTodaysGames = () => {
        Axios.get("http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard")
            .then((response) => {
                console.log(response);
                setMatchUps(response.data.events);
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
                         <h3>{matchUps.name}</h3>
                       </div>
                    )
                }) : <h3>No data yet</h3> }
            <PlayerStats playerName={playerName} />
        </div>
    );

};

export default App;
