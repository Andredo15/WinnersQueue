import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Axios from 'axios'
import './App.css';
import GameStats from './GameStats';

function App() {

    const [matchUps, setMatchUps] = useState("");
    const [showStats, setShowStats] = useState(false);
    const [selectedGameId, SetSelectedGameId] = useState("");
    const current = new Date();
    const date = `${current.getFullYear()}-${("0" + (current.getMonth() + 1)).slice(-2)}-${("0" + current.getDate()).slice(-2)}`;

    const getTodaysGames = () => {
        Axios.get(`https://www.balldontlie.io/api/v1/games?start_date=${date}&end_date=${date}`)
            .then((response) => {
                setMatchUps(response.data.data);
            });
    };

    useEffect(() => {
        getTodaysGames();
    }, []);

    const toggleStats = (matchUpId) => {
        setShowStats(true);
        SetSelectedGameId(matchUpId);
        console.log(selectedGameId);
      };
    

    return (
        <div>
            <h1>WINNERS QUEUE</h1>
            {matchUps ? 
                matchUps.map(matchUp => {
                    return(
                       <div key={matchUp.id}>
                            <button onClick={() => toggleStats(matchUp.id)}><Text style={styles.text}>{matchUp.visitor_team.name + " at " + matchUp.home_team.name}</Text></button>
                       </div>
                    )
                }) : <h3>No data yet</h3> }
                {selectedGameId}
            {showStats && <GameStats GameId={selectedGameId}/>}
        </div>
    );

};

const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: 'grey',
    },
    text: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'black',
    },
  });

export default App;
