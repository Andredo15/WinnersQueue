import React, { useEffect, useState } from "react";
import { Card } from 'antd';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Axios from 'axios'
import Button from 'react-bootstrap/Button';
import GameStats from './GameStats';
import * as NBAIcons from 'react-nba-logos';
import './App.css';
import { BalldontlieAPI } from "@balldontlie/sdk";

const api = new BalldontlieAPI({ apiKey: "d839a168-2210-4737-af35-1ddd65540aa5" });

const { Meta } = Card;

const teamMappings = require('./LogoConversion');

function App() {

    const [matchUps, setMatchUps] = useState("");
    const [showStats, setShowStats] = useState(false);
    const [selectedGameId, SetSelectedGameId] = useState("");
    const [homeTeam, SetHomeTeam] = useState("");
    const [awayTeam, SetAwayTeam] = useState("");
    const [homeTeamId, setHomeTeamId] = useState("");
    const [awayTeamId, setAwayTeamId] = useState("");

    const current = new Date();
    const date = `${current.getFullYear()}-${("0" + (current.getMonth() + 1)).slice(-2)}-${("0" + current.getDate()).slice(-2)}`;

    console.log("Todays games: ", api.nba.getGames({ start_date: date, end_date: date }));

    const getTodaysGames = () => {
        api.nba.getGames({ start_date: date, end_date: date })
            .then((response) => {
                setMatchUps(response.data);
            });
    };
    console.log("Todays games 2: ", matchUps);
    useEffect(() => {
        getTodaysGames();
    }, []);

    // Function to get the corresponding icon for a team
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

    const toggleStats = (matchUpId, homeTeam, awayTeam, homeTeamId, awayTeamId) => {
        setShowStats(true);
        SetSelectedGameId(matchUpId);
        SetHomeTeam(homeTeam);
        SetAwayTeam(awayTeam);
        setHomeTeamId(homeTeamId);
        setAwayTeamId(awayTeamId);
        console.log(selectedGameId);
      };

    return (
        <div>

            <div id="landing-page"></div>
            <img src={ require('./logo.png') } />
            <br/>
            <div className="match-ups-container">
                {matchUps ? 
                    matchUps.map(matchUp => {
                        return(
                        <div className="parent" key={matchUp.id}>
                                <Card 
                                    onClick={() => toggleStats(matchUp.id, matchUp.home_team.name, matchUp.visitor_team.name, matchUp.home_team.id, matchUp.visitor_team.id)}
                                    hoverable
                                    cover={
                                        <div className="game-card-cover">
                                            {getIconForTeam(matchUp.visitor_team.name)}
                                            <span className="at-symbol">@</span>
                                            {getIconForTeam(matchUp.home_team.name)}
                                        </div>
                                    }>
                                    <Meta title={`${matchUp.visitor_team.name} vs ${matchUp.home_team.name}`} description={matchUp.status.includes('Qtr') ? `${matchUp.time} ${matchUp.home_team_score}-${matchUp.visitor_team_score}` : matchUp.status} />
                                </Card>
                        </div>
                        )
                    }) : <h3>No data yet</h3> }
            </div>
            {showStats && <GameStats GameId={selectedGameId} homeTeam={homeTeam} awayTeam={awayTeam} homeTeamId={homeTeamId} awayTeamId={awayTeamId}/>}
        </div>
    );

};

export default App;
