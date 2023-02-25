import React, { useState, useEffect } from "react";
import Axios from 'axios';

const PlayerStats = ({ playerName }) => {
  const [playerData, setPlayerData] = useState(null);
  const [stats, setStats] = useState("");

  const fetchPlayerData = async (playerName) => {
    const response = await Axios.get(`https://www.balldontlie.io/api/v1/players?search=${playerName}`);
    console.log(response);
    setPlayerData(response.data.data);
  };

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

  useEffect(() => {
    fetchPlayerData(playerName);
  }, [playerName]);

  useEffect(() => {
      fetchStats();
  }, [playerData]);

  if (!playerData || !stats) {
    return <p>Loading player data...</p>;
  }

  const { first_name = null, last_name = null, team = null } = playerData[0] || {};
  const statsArray = Object.values(stats);
  console.log("stats array: ", statsArray);
  const playerStats = statsArray.slice(0, 10);
  console.log("Lebron Last 10 games: ", playerStats);
  
  return (
    <div>
      <p>
        {first_name} {last_name} {"(" + playerStats[0].player.position + ")"} Last 10 Games:
      </p>

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

export default PlayerStats;