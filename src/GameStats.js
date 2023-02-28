import React, { useState, useEffect } from "react";
import Axios from 'axios';

const GameStats = ({ GameId }) => {
  const [rosterData, setRosterData] = useState(null);
  const [stats, setStats] = useState("");

  const fetchRoster = async (GameId) => {
      const response = await Axios.get(`https://www.balldontlie.io/api/v1/stats?game_ids[]=${GameId}&starters=true`);
    console.log(response.data.data);
    setRosterData(response.data.data);
  };

/*
  const fetchStats = async () => {
    const response = await Axios.get(`https://www.balldontlie.io/api/v1/stats?seasons[]=2022&player_ids[]=${playerData[0].id}&sort=-game.date`);

        const stats = response.data.data.reduce((acc, curr) => {
          const date = new Date(curr.game.date).getTime();
          const index = acc.findIndex(item => new Date(item.game.date).getTime() < date);
          if (index === -1) {
            acc.push(curr);
          } else {
            acc.splice(index, 0, curr);
          }
          return acc;
        }, []);
        setStats(stats);
  };
*/
  useEffect(() => {
    fetchRoster(GameId);
  }, [GameId]);
/*
  useEffect(() => {
      fetchStats();
  }, [playerData]);
*/
  if (!rosterData) {
    return <p>Loading player data...</p>;
  }

  const statsArray = Object.values(stats);
  console.log("stats array: ", statsArray);
  const playerStats = statsArray.slice(0, 10);
  console.log("Lebron Last 10 games: ", playerStats);
  
  return (
    <div>

<table>
  <thead>
    <tr>
      <th>Position</th>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>F</td>
      {rosterData && rosterData.filter(player => player.player.position.includes("F")).map(player => (
        <td>
          <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
      </td>
      ))}
    </tr>
    <tr>
      <td>G</td>
      {rosterData && rosterData.filter(player => player.player.position.includes("G")).map(player => (
        <td>
          <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
      </td>
      ))}
    </tr>
    <tr>
      <td>C</td>
      {rosterData && rosterData.filter(player => player.player.position.includes("C")).map(player => (
        <td>
          <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
        </td>
      ))}
    </tr>
  </tbody>
</table>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Points</th>
            <th>Rebounds</th>
            <th>Assists</th>
            <th>Blocks</th>
            <th>Steals</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
            <tr key={stats.id}>
              <td>{stats.game.date.substring(0,10)}</td>
              <td>{stats.pts}</td>
              <td>{stats.reb}</td>
              <td>{stats.ast}</td>
              <td>{stats.blk}</td>
              <td>{stats.stl}</td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
};

export default GameStats;