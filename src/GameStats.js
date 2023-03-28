import React, { useState, useEffect } from "react";
import Axios from 'axios';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const GameStats = ({ GameId, homeTeam, awayTeam, homeTeamId, awayTeamId }) => {
  const [rosterData, setRosterData] = useState("");
  const [stats, setStats] = useState("");
  const [sortedPrevGames, setSortedPrevGames] = useState("");
  const [sortedUpGames, setSortedUpGames] = useState("");
  const [homeTeamRoster, setHomeTeamRoster] = useState("");
  const [awayTeamRoster, setAwayTeamRoster] = useState("");
  const [NBALineData, setNBALineData] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [value, setValue] = React.useState('1');
  var splitHomePlayers = [];
  var splitAwayPlayers = [];

  const fetchRoster = async (GameId) => {

    const response = await Axios.get(`https://www.balldontlie.io/api/v1/stats?game_ids[]=${GameId}&starters=true`);
    console.log("fetch roaster: ", response.data.data);
    setRosterData(response.data.data);
    
    console.log(homeTeam);
    await response.data.data.forEach(element => {
      if (element.team.name === homeTeam)
      {
        console.log(element.team.name);
        splitHomePlayers.push(element);
      }
      else
      {
        splitAwayPlayers.push(element);
      }
    });

    setHomeTeamRoster(splitHomePlayers);
    setAwayTeamRoster(splitAwayPlayers);

    console.log("home team: ", homeTeamRoster);
    console.log("away team: ", awayTeamRoster);
  };

  const fetchLines = async () => {

    const response = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=h2h,spreads&oddsFormat=american`);
    
    console.log("fetch lines: ", response.data);

  };

  const PlayerStatsTooltip = ({ stats }) => {
    setIsHovering(true);
    console.log("HOVERING");
    return (
      <div className="recentStats">
        <div>Last 10 games stats:</div>
        <div>Points:</div>
        <div>Rebounds:</div>
        <div>Assists:</div>
        <div>Steals:</div>
        <div>Blocks:</div>
      </div>
    );
  };

  const fetchRecentGames = async (TeamId) => {

    const response = await Axios.get(`https://www.balldontlie.io/api/v1/games?seasons[]=2022&per_page=100&team_ids[]=${TeamId}`);
     
    console.log("fetch recent game: ", response.data.data);

    const today = new Date();

    const prevGames = response.data.data.filter(game => new Date(game.date) < today);
    const upcomingGames = response.data.data.filter(game => new Date(game.date) >= today);
    const sortPrevGames = prevGames.sort((game1, game2) => {
      const date1 = new Date(game1.date).getTime();
      const date2 = new Date(game2.date).getTime();
      return date2 - date1;
    }).slice(0, 10);

    const sortUpGames = upcomingGames.sort((game1, game2) => {
      const date1 = new Date(game1.date).getTime();
      const date2 = new Date(game2.date).getTime();
      return date2 - date1;
    }).reverse();

    setSortedPrevGames(sortPrevGames);
    setSortedUpGames(sortUpGames);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
    fetchRecentGames(homeTeamId);
    fetchLines();
  }, [GameId], [homeTeam]);
/*
  useEffect(() => {
      fetchStats();
  }, [playerData]);
*/

console.log('homeTeamRoster length:', homeTeamRoster.length);

  if (!rosterData) {
    return <p>Loading player data...</p>;
  }

  if (!sortedPrevGames) {
    return <p>Loading previous games data...</p>;
  }

  const statsArray = Object.values(stats);
  console.log("stats array: ", statsArray);
  const playerStats = statsArray.slice(0, 10);
  console.log("Lebron Last 10 games: ", playerStats);

  return (
    <div>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example" centered>
              <Tab label="Last 10 Games" value="1" />
              <Tab label="Upcoming Games" value="2" />
              <Tab label="Team Roster" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1">
            {/* Start of home team schedule */}
            {homeTeam}
            {homeTeamRoster.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
            <tr>
              <td>C</td>
              {rosterData && homeTeamRoster.filter(player => player.player.position.includes("C")).map(player => (
                <td>
                  <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        ) : (
          <p>Home Team Roster Loading...</p>
        )}
          </TabPanel>
          <TabPanel value="2">
            {/* Start of home team roster */}
            {homeTeamRoster.length > 0 ? (
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
                  {rosterData && homeTeamRoster.filter(player => player.player.position.includes("F")).map(player => (
                  <td>
                    <td key={player.id} onMouseOver={() => PlayerStatsTooltip(player)}>{player.player.first_name} {player.player.last_name}</td>
                  </td>
                  ))}
                  {isHovering && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 5px rgba(0,0,0,0.3)', zIndex: 999 }}>
                      <div className="recentStats">
                        <div>Last 10 games stats:</div>
                        <div>Points:</div>
                        <div>Rebounds:</div>
                        <div>Assists:</div>
                        <div>Steals:</div>
                        <div>Blocks:</div>
                      </div>
                    </div>
                  )}
                </tr>
                <tr>
                  <td>G</td>
                  {rosterData && homeTeamRoster.filter(player => player.player.position.includes("G")).map(player => (
                <td>
                  <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
              </td>
              ))}
            </tr>
            <tr>
              <td>C</td>
              {rosterData && homeTeamRoster.filter(player => player.player.position.includes("C")).map(player => (
                <td>
                  <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        ) : (
          <p>Home Team Roster Loading...</p>
        )}
          </TabPanel>
          <TabPanel value="3">Item Three</TabPanel>
        </TabContext>
      </Box>

    {/* Start of away team roster */}
    {awayTeam}
    {awayTeamRoster.length > 0 ? (
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
          {rosterData && awayTeamRoster.filter(player => player.player.position.includes("F")).map(player => (
            <td>
              <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
          </td>
          ))}
        </tr>
        <tr>
          <td>G</td>
          {rosterData && awayTeamRoster.filter(player => player.player.position.includes("G")).map(player => (
            <td>
              <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
          </td>
          ))}
        </tr>
        <tr>
          <td>C</td>
          {rosterData && awayTeamRoster.filter(player => player.player.position.includes("C")).map(player => (
            <td>
              <td key={player.id}>{player.player.first_name} {player.player.last_name}</td>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
    ) : (
      <p>Away Team Roster Loading...</p>
    )}

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