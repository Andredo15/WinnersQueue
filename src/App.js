import React, { useEffect, useState } from "react";
import { Card } from 'antd';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Axios from 'axios'
import Button from 'react-bootstrap/Button';
import GameStats from './GameStats';
import * as NBAIcons from 'react-nba-logos';
import './App.css';

const { Meta } = Card;

const teamMappings = require('./LogoConversion');

function App() {

    const [matchUps, setMatchUps] = useState("");
    const [showStats, setShowStats] = useState(false);
    const [selectedGameId, SetSelectedGameId] = useState("");
    const [homeTeam, SetHomeTeam] = useState("");
    const [awayTeam, SetAwayTeam] = useState("");

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

    // Define the function to get the corresponding icon for a team
    const getIconForTeam = (teamName) => {
        console.log(teamName);
        const teamKey = teamMappings[teamName];
        if (teamKey) {
            const Icon = NBAIcons[teamKey];
            console.log(Icon);
            return <Icon />;
        }
        return null; // Return null if the team name is not found in the teamMappings object
    };

    const toggleStats = (matchUpId, homeTeam, awayTeam) => {
        setShowStats(true);
        SetSelectedGameId(matchUpId);
        SetHomeTeam(homeTeam);
        SetAwayTeam(awayTeam);
        console.log(selectedGameId);
      };
      const Icon = NBAIcons[teamMappings.Wizards];

    return (
        <div>
            <div id="landing-page"></div>
            <h1>WINNERS QUEUE</h1>
            {matchUps ? 
                matchUps.map(matchUp => {
                    return(
                       <div className="parent" key={matchUp.id}>
                            <Card 
                                onClick={() => toggleStats(matchUp.id, matchUp.home_team.name, matchUp.visitor_team.name)}
                                hoverable
                                style={{ width: 240 }}
                                cover={
                                    <div className="game-card-cover">
                                    {getIconForTeam(matchUp.visitor_team.name)}
                                    <span className="at-symbol">@</span>
                                    {getIconForTeam(matchUp.home_team.name)}
                                    </div>
                                }>
                                <Meta title={`${matchUp.visitor_team.name} vs ${matchUp.home_team.name}`} description={`Time: ${matchUp.date}`} />
                            </Card>
                       </div>
                    )
                }) : <h3>No data yet</h3> }

            {showStats && <GameStats GameId={selectedGameId} homeTeam={homeTeam} awayTeam={awayTeam}/>}
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
