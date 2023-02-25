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
        console.log("Lebron stats: ", response);

        const test1 = response.data.data;
        console.log("Lebron before sort: ", test1);
        const test2 = new Date(response.data.data[0].game.date);
        console.log("Lebron test: ", test2);
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
        console.log("Lebron after sort: ", stats);
        setStats(stats);
        
        // setStats(response.data);
  };

  const getTeamName = async (teamId) => {
    const response = await Axios.get(`https://www.balldontlie.io/api/v1/teams/${teamId}`);
    return response.data.full_name;
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
  console.log("stats: ", stats);
  const playerStats = statsArray.slice(0, 10);
  
  return (
    <div>
      <p>
        {first_name} {last_name}
        {stats[0].id}
      </p>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Points</th>
            <th>Rebounds</th>
            <th>Assists</th>
            <th>Blocks</th>
            <th>Steals</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(playerStats[0]) && playerStats[0].slice(playerStats[0].length-10, playerStats[0].length).map((stats, index) => (
            <tr key={stats.id}>
              <td>{stats.game.date.substring(0,10)}</td>
              <td>{stats.game.opponent}</td>
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