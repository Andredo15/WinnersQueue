import React, { useState, useEffect } from "react";
import Axios from 'axios';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { BalldontlieAPI } from "@balldontlie/sdk";

const api = new BalldontlieAPI({ apiKey: "d839a168-2210-4737-af35-1ddd65540aa5" });

const GameStats = ({ GameId, homeTeam, awayTeam, homeTeamId, awayTeamId }) => {
  const [statsArray, setStatsArray] = useState("");
  const [playerStats, setPlayerStats] = useState("");
  const [sortedPrevGamesHome, setSortedPrevGamesHome] = useState("");
  const [sortedUpGamesHome, setSortedUpGamesHome] = useState("");
  const [sortedPrevGamesAway, setSortedPrevGamesAway] = useState("");
  const [sortedUpGamesAway, setSortedUpGamesAway] = useState("");
  const [homeTeamRoster, setHomeTeamRoster] = useState("");
  const [awayTeamRoster, setAwayTeamRoster] = useState("");
  const [averagesL10, setAveragesL10] = useState({
    points: 0,
    assists: 0,
    rebounds: 0,
    blocks: 0,
    steals: 0,
  });
  const [averagesL5, setAveragesL5] = useState({
    points: 0,
    assists: 0,
    rebounds: 0,
    blocks: 0,
    steals: 0,
  });
  const [hitRate2023, sethitRate2023] = useState({
    points: 0,
    assists: 0,
    rebounds: 0,
    blocks: 0,
    steals: 0,
  });
  const [hitRate2024, sethitRate2024] = useState({
    points: 0,
    assists: 0,
    rebounds: 0,
    blocks: 0,
    steals: 0,
  });
  const [playerLines, setPlayerLine] = useState({
    points: 0,
    assists: 0,
    rebounds: 0,
    blocks: 0,
    steals: 0,
  });
  

  const [value, setValue] = React.useState('1');

  const fetchRoster = async (GameId) => {
    const homeTeamId = (await api.nba.getGame(GameId)).data.home_team.id;
    const awayTeamId = (await api.nba.getGame(GameId)).data.visitor_team.id;

    const homeRoster = await api.nba.getActivePlayers({ team_ids: [homeTeamId] });
    const awayRoster = await api.nba.getActivePlayers({ team_ids: [awayTeamId] });

    setHomeTeamRoster(homeRoster.data.sort((a, b) => a.min - b.min));
    setAwayTeamRoster(awayRoster.data.sort((a, b) => a.min - b.min));
    console.log("fetch home team roster: ", homeTeamRoster);
    console.log("fetch away team roster: ", awayTeamRoster);
    console.log("Test stats: ", await api.nba.getStats({ player_ids: [13] }));
    
  };

  const fetchLines = async (firstName, LastName) => {

    const findGame = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/events/?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7`);
    
    const selectedGame = findGame.data.find((game) => game.home_team.includes(homeTeam));
    
    console.log("fetch lines1: ", selectedGame);

    const getPointLineEvent = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/events/${selectedGame.id}/odds?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=player_points&bookmakers=draftkings`);

    const getAsistLinesEvent = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/events/${selectedGame.id}/odds?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=player_assists&bookmakers=draftkings`);

    const getReboundLinesEvent = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/events/${selectedGame.id}/odds?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=player_rebounds&bookmakers=draftkings`);

    const getBlockLinesEvent = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/events/${selectedGame.id}/odds?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=player_blocks&bookmakers=draftkings`);

    const getStealLinesEvent = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/events/${selectedGame.id}/odds?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=player_steals&bookmakers=draftkings`);

    console.log("fetch lines2: ", getPointLineEvent.data.bookmakers[0].markets[0].outcomes, firstName);

    const getPlayerLinePlayer = getPointLineEvent.data.bookmakers[0].markets[0].outcomes.find((line) => line.description.includes(firstName));

    const getAsistLinePlayer = getAsistLinesEvent.data.bookmakers[0].markets[0].outcomes.find((line) => line.description.includes(firstName));

    const getReboundLinePlayer = getReboundLinesEvent.data.bookmakers[0].markets[0].outcomes.find((line) => line.description.includes(firstName));

    const getBlockLinePlayer = getBlockLinesEvent.data.bookmakers[0].markets[0].outcomes.find((line) => line.description.includes(firstName));

    const getStealLinePlayer = getStealLinesEvent.data.bookmakers[0].markets[0].outcomes.find((line) => line.description.includes(firstName));

    //if this is undefined, it is because there is no current market for the selected player
    console.log("fetch lines3: ", getPlayerLinePlayer);

    setPlayerLine({
      points: getPlayerLinePlayer.point.toFixed(2),
      assists: getAsistLinePlayer.point.toFixed(2),
      rebounds: getReboundLinePlayer.point.toFixed(2),
      blocks: getBlockLinePlayer.point.toFixed(2),
      steals: getStealLinePlayer.point.toFixed(2),
    });

  };

  const fetchRecentGames = async (TeamId) => {

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 25); // Subtract 25 days
    const formattedStartDate = startDate.toISOString().split('T')[0]; // Format the start date

    const endDate = new Date();
    endDate.setDate(today.getDate() + 25); // Subtract 25 days
    const formattedendDate = endDate.toISOString().split('T')[0]; // Format the end date

    const response = await api.nba.getGames({
      team_ids: [TeamId],
      start_date: formattedStartDate, // Adjust start date
      end_date: formattedendDate,   // Adjust end date to today's date
    });

    const prevGames = response.data.filter(game => new Date(game.date) < new Date(new Date().setDate(new Date().getDate() - 1)));
    const upcomingGames = response.data.filter(game => new Date(game.date) >= today);
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
    console.log("Upcoming TEAM GAMES: ", sortUpGames);
    if (TeamId == homeTeamId)
    {
      setSortedPrevGamesHome(sortPrevGames);
      setSortedUpGamesHome(sortUpGames);
    }
    if (TeamId == awayTeamId)
    {
      setSortedPrevGamesAway(sortPrevGames);
      setSortedUpGamesAway(sortUpGames)
    }
  };

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const fetchStats = async (playerId, firstName, lastName) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30); // Subtract 25 days
    const formattedStartDate = startDate.toISOString().split('T')[0]; // Format the start date
    const formattedTodayDate = today.toISOString().split('T')[0];

    const response = await api.nba.getStats({ 
      player_ids: [playerId],
      start_date: formattedStartDate, // Adjust start date
      end_date: formattedTodayDate,   // Adjust end date to today's date
     });

    let games2023 = await api.nba.getStats({
      player_ids: [playerId],
      seasons: [2023],
      per_page: 100,
     });
    games2023 = games2023.data.filter((game) => game.min > 25);
    const numTotalGames2023 = games2023.length;
    console.log("test11 ", games2023);
    const hitRate2023 = games2023.filter((game) => game.pts >= playerLines.points);
    console.log("test22 ", hitRate2023, playerLines.points);
    console.log("test33 ", hitRate2023.length*100/numTotalGames2023);
    
    sethitRate2023({
      points: hitRate2023.length*100/numTotalGames2023,
    });

    const games2024 = await api.nba.getStats({
      player_ids: [playerId],
      seasons: [2024],
      per_page: 100,
     });
     const numTotalGames2024 = games2024.length;


    console.log(firstName, " ", lastName, " 2023 games ", games2023);



    console.log(firstName, " ", lastName, " 2024 games ", games2024);

    const fetchPlayerLines = await fetchLines(firstName, lastName);
    console.log("fetch lines for selected player: ", fetchPlayerLines);
    let last10hitRate = 0;
    let last5hitRate = 0;

    const stats = response.data.reduce((acc, curr) => {
      if (curr.min === '00') {
        // Skip stats where the player didn't play
        return acc;
      }
      const date = new Date(curr.game.date).getTime();
      const index = acc.findIndex(item => new Date(item.game.date).getTime() < date);
      if (index === -1) {
        acc.push(curr);
      } else {
        acc.splice(index, 0, curr);
      }
      return acc;
    }, []);

    const last10Stats = stats.slice(0, 10);
    console.log("last 10 games: ", last10Stats);

    const last5Stats = stats.slice(0, 5);
    console.log("last 5 games: ", last5Stats)
    const stats2023 = await api.nba.getSeasonAverages({
      season: 2023,
      player_id: playerId,
    });
    const stats2024 = await api.nba.getSeasonAverages({
      season: 2024,
      player_id: playerId,
    });

    console.log ("2023 stats: ", stats2023);

    const calculateAverages = (statsArray) => {
      const statsKeys = {
        points: "pts",
        assists: "ast",
        rebounds: "reb",
        blocks: "blk",
        steals: "stl",
      };
    
      return Object.fromEntries(
        Object.entries(statsKeys).map(([key, statKey]) => {
          const avg = statsArray.reduce((sum, stats) => sum + (stats[statKey] || 0), 0) / statsArray.length;
          return [key, parseFloat(avg.toFixed(2))];
        })
      );
    };
    
    setAveragesL10(calculateAverages(last10Stats));
    setAveragesL5(calculateAverages(last5Stats));

    sethitRate2024({
      points: parseFloat(stats2024.data[0].pts.toFixed(2)),
      assists: parseFloat(stats2024.data[0].pts.toFixed(2)),
      rebounds: parseFloat(stats2024.data[0].pts.toFixed(2)),
      blocks: parseFloat(stats2024.data[0].pts.toFixed(2)),
      steals: parseFloat(stats2024.data[0].pts.toFixed(2)),
    });

      setStatsArray(Object.values(stats));
      setPlayerStats(statsArray.slice(0, 10));
  };

  useEffect(() => {
    fetchRoster(GameId);
    fetchRecentGames(homeTeamId);
    fetchRecentGames(awayTeamId);
    fetchLines();
  }, [GameId], [homeTeam], [awayTeam]);

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 400,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

  if (!homeTeamRoster || !awayTeamRoster) {
    return <p>Loading player data...</p>;
  }

  return (
    <div>
      <h2 align="center">
        {homeTeam}
      </h2>
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
            {/* Start of last 10 games code */}
            {sortedPrevGamesHome.length > 0 ? (
            <table class="center">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrevGamesHome.map(game => (
                  <tr key={game.id}>
                    <td>{new Date(new Date(game.date).setDate(new Date(game.date).getDate() + 1)).toLocaleDateString()}</td>
                    <td>{game.home_team.name === homeTeam ? game.visitor_team.name : game.home_team.name}</td>
                    <td>
                      {game.home_team.name === homeTeam ? ((game.home_team_score > game.visitor_team_score) ? 'W ' : 'L ') :  ((game.visitor_team_score > game.home_team_score) ? 'W ' : 'L ')}
                      {game.home_team.name === homeTeam ? `${game.home_team_score} - ${game.visitor_team_score}` : `${game.visitor_team_score} - ${game.home_team_score}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Last 10 Games Loading...</p>
          )}
          </TabPanel>
          <TabPanel value="2">
            {/* Start of upcoming games code */}
            {sortedPrevGamesHome.length > 0 ? (
            <table class="center">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {sortedUpGamesHome.map(game => (
                  <tr key={game.id}>
                    <td>{new Date(game.date).toLocaleDateString()}</td>
                    <td>{game.home_team.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Upcoming Games Loading...</p>
          )}
          </TabPanel>
          <TabPanel value="3">
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
                  <td>Forward</td>
                  {homeTeamRoster && homeTeamRoster.filter(player => player.position.includes("F")).map(player => (
                    
                  <td>
                    <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Stats</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, _index) => (
                          <tr key={stats.id}>
                          </tr>
                        ))}
                        {/* Print L10 averages */}
                        <tr>
                          <td><b>L10 Averages:</b></td>
                          <td>{`Points Hit Rate: ${averagesL10.points}`}</td>
                          <td>{`Assists Hit Rate: ${averagesL10.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${averagesL10.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${averagesL10.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${averagesL10.steals}`}</td>
                        </tr>
                        {/* Print L5 averages */}
                        <tr>
                          <td><b>L5 Averages:</b></td>
                          <td>{`Points Hit Rate: ${averagesL5.points}`}</td>
                          <td>{`Assists Hit Rate: ${averagesL5.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${averagesL5.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${averagesL5.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${averagesL5.steals}`}</td>
                        </tr>
                        {/* Print 2023 averages */}
                        <tr>
                          <td><b>2023 Averages:</b></td>
                          <td>{`Points Hit Rate: ${hitRate2023.points}`}</td>
                          <td>{`Assists Hit Rate: ${hitRate2023.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${hitRate2023.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${hitRate2023.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${hitRate2023.steals}`}</td>
                        </tr>
                        {/* Print 2024 averages */}
                        <tr>
                          <td><b>2024 Averages:</b></td>
                          <td>{`Points Hit Rate: ${hitRate2024.points}`}</td>
                          <td>{`Assists Hit Rate: ${hitRate2024.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${hitRate2024.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${hitRate2024.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${hitRate2024.steals}`}</td>
                        </tr>
                        {/* Print Over/Under Lines */}
                        <tr>
                          <td><b>Over/Under Lines:</b></td>
                          <td>{`Points Hit Rate: ${playerLines.points}`}</td>
                          <td>{`Assists Hit Rate: ${playerLines.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${playerLines.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${playerLines.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${playerLines.steals}`}</td>
                        </tr>
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.id, player.first_name, player.last_name)}>
                        {player.first_name} {player.last_name}
                      </Button>
                    </HtmlTooltip>
                    </td>
                  </td>
                  ))}
                </tr>
                <tr>
                  <td>Guard</td>
                  {homeTeamRoster && homeTeamRoster.filter(player => player.position.includes("G")).map(player => (
                <td>
                  <td key={player.id}>
                  <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, _index) => (
                          <tr key={stats.id}>
                          </tr>
                        ))}
                          {/* Print L10 averages */}
                          <tr>
                            <td><b>L10 Averages:</b></td>
                            <td>{`Points Hit Rate: ${averagesL10.points}`}</td>
                            <td>{`Assists Hit Rate: ${averagesL10.assists}`}</td>
                            <td>{`Rebounds Hit Rate: ${averagesL10.rebounds}`}</td>
                            <td>{`Blocks Hit Rate: ${averagesL10.blocks}`}</td>
                            <td>{`Steals Hit Rate: ${averagesL10.steals}`}</td>
                        </tr>
                        {/* Print L5 averages */}
                        <tr>
                          <td><b>L5 Averages:</b></td>
                          <td>{`Points Hit Rate: ${averagesL5.points}`}</td>
                          <td>{`Assists Hit Rate: ${averagesL5.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${averagesL5.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${averagesL5.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${averagesL5.steals}`}</td>
                        </tr>
                        {/* Print 2023 averages */}
                        <tr>
                          <td><b>2023 Averages:</b></td>
                          <td>{`Points Hit Rate: ${hitRate2023.points}`}</td>
                          <td>{`Assists Hit Rate: ${hitRate2023.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${hitRate2023.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${hitRate2023.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${hitRate2023.steals}`}</td>
                        </tr>
                        {/* Print 2024 averages */}
                        <tr>
                          <td><b>2024 Averages:</b></td>
                          <td>{`Points Hit Rate: ${hitRate2024.points}`}</td>
                          <td>{`Assists Hit Rate: ${hitRate2024.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${hitRate2024.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${hitRate2024.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${hitRate2024.steals}`}</td>
                        </tr>
                        {/* Print Over/Under Lines */}
                        <tr>
                          <td><b>Over/Under Lines:</b></td>
                          <td>{`Points Hit Rate: ${playerLines.points}`}</td>
                          <td>{`Assists Hit Rate: ${playerLines.assists}`}</td>
                          <td>{`Rebounds Hit Rate: ${playerLines.rebounds}`}</td>
                          <td>{`Blocks Hit Rate: ${playerLines.blocks}`}</td>
                          <td>{`Steals Hit Rate: ${playerLines.steals}`}</td>
                        </tr>
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.id, player.first_name, player.last_name)}>
                        {player.first_name} {player.last_name}
                      </Button>
                    </HtmlTooltip>
                  </td>
              </td>
              ))}
            </tr>
            <tr>
              <td>Center</td>
              {homeTeamRoster && homeTeamRoster.filter(player => player.position.includes("C")).map(player => (
                <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, _index) => (
                          <tr key={stats.id}>
                          </tr>
                        ))}
                        {/* Print L10 averages */}
                          <tr>
                            <td><b>L10 Averages:</b></td>
                            <td>{`Points: ${averagesL10.points}`}</td>
                            <td>{`Assists: ${averagesL10.assists}`}</td>
                            <td>{`Rebounds: ${averagesL10.rebounds}`}</td>
                            <td>{`Blocks: ${averagesL10.blocks}`}</td>
                            <td>{`Steals: ${averagesL10.steals}`}</td>
                          </tr>
                        {/* Print L5 averages */}
                        <tr>
                          <td><b>L5 Averages:</b></td>
                          <td>{`Points: ${averagesL5.points}`}</td>
                          <td>{`Assists: ${averagesL5.assists}`}</td>
                          <td>{`Rebounds: ${averagesL5.rebounds}`}</td>
                          <td>{`Blocks: ${averagesL5.blocks}`}</td>
                          <td>{`Steals: ${averagesL5.steals}`}</td>
                        </tr>
                        {/* Print 2023 averages */}
                        <tr>
                          <td><b>2023 Averages:</b></td>
                          <td>{`Points: ${hitRate2023.points}`}</td>
                          <td>{`Assists: ${hitRate2023.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2023.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2023.blocks}`}</td>
                          <td>{`Steals: ${hitRate2023.steals}`}</td>
                        </tr>
                        {/* Print 2024 averages */}
                        <tr>
                          <td><b>2024 Averages:</b></td>
                          <td>{`Points: ${hitRate2024.points}`}</td>
                          <td>{`Assists: ${hitRate2024.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2024.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2024.blocks}`}</td>
                          <td>{`Steals: ${hitRate2024.steals}`}</td>
                        </tr>
                        {/* Print Over/Under Lines */}
                        <tr>
                          <td><b>Over/Under Lines:</b></td>
                          <td>{`Points: ${playerLines.points}`}</td>
                          <td>{`Assists: ${playerLines.assists}`}</td>
                          <td>{`Rebounds: ${playerLines.rebounds}`}</td>
                          <td>{`Blocks: ${playerLines.blocks}`}</td>
                          <td>{`Steals: ${playerLines.steals}`}</td>
                        </tr>
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.id, player.first_name, player.last_name)}>
                        {player.first_name} {player.last_name}
                      </Button>
                    </HtmlTooltip>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        ) : (
          <p>Home Team Roster Loading...</p>
        )}
          </TabPanel>
        </TabContext>
      </Box> 

    {/* Start of away team roster */}
    <h2 align="center">
      {awayTeam}
    </h2>
    
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
            {/* Start of last 10 games code */}
            {sortedPrevGamesAway.length > 0 ? (
            <table class="center">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrevGamesAway.map(game => (
                  <tr key={game.id}>
                  <td>{new Date(new Date(game.date).setDate(new Date(game.date).getDate() + 1)).toLocaleDateString()}</td>
                  <td>{game.home_team.name === awayTeam ? game.visitor_team.name : game.home_team.name}</td>
                  <td>
                    {game.home_team.name === awayTeam ? ((game.home_team_score > game.visitor_team_score) ? 'W ' : 'L ') :  ((game.visitor_team_score > game.home_team_score) ? 'W ' : 'L ')}
                    {game.home_team.name === awayTeam ? `${game.home_team_score} - ${game.visitor_team_score}` : `${game.visitor_team_score} - ${game.home_team_score}`}
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Last 10 Games Loading...</p>
          )}
          </TabPanel>
          <TabPanel value="2">
            {/* Start of upcoming games code */}
            {sortedPrevGamesAway.length > 0 ? (
            <table class="center">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {sortedUpGamesAway.map(game => (
                  <tr key={game.id}>
                    <td>{new Date(game.date).toLocaleDateString()}</td>
                    <td>{game.home_team.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Upcoming Games Loading...</p>
          )}
          </TabPanel>
          <TabPanel value="3">
            {/* Start of home team roster */}
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
                <td>Forward</td>
                {awayTeamRoster && awayTeamRoster.filter(player => player.position.includes("F")).map(player => (
                  <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, _index) => (
                          <tr key={stats.id}>
                          </tr>
                        ))}
                          {/* Print L10 averages */}
                          <tr>
                            <td><b>L10 Averages:</b></td>
                            <td>{`Points: ${averagesL10.points}`}</td>
                            <td>{`Assists: ${averagesL10.assists}`}</td>
                            <td>{`Rebounds: ${averagesL10.rebounds}`}</td>
                            <td>{`Blocks: ${averagesL10.blocks}`}</td>
                            <td>{`Steals: ${averagesL10.steals}`}</td>
                          </tr>
                        {/* Print L5 averages */}
                        <tr>
                          <td><b>L5 Averages:</b></td>
                          <td>{`Points: ${averagesL5.points}`}</td>
                          <td>{`Assists: ${averagesL5.assists}`}</td>
                          <td>{`Rebounds: ${averagesL5.rebounds}`}</td>
                          <td>{`Blocks: ${averagesL5.blocks}`}</td>
                          <td>{`Steals: ${averagesL5.steals}`}</td>
                        </tr>
                        {/* Print 2023 averages */}
                        <tr>
                          <td><b>2023 Averages:</b></td>
                          <td>{`Points: ${hitRate2023.points}`}</td>
                          <td>{`Assists: ${hitRate2023.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2023.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2023.blocks}`}</td>
                          <td>{`Steals: ${hitRate2023.steals}`}</td>
                        </tr>
                        {/* Print 2024 averages */}
                        <tr>
                          <td><b>2024 Averages:</b></td>
                          <td>{`Points: ${hitRate2024.points}`}</td>
                          <td>{`Assists: ${hitRate2024.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2024.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2024.blocks}`}</td>
                          <td>{`Steals: ${hitRate2024.steals}`}</td>
                        </tr>
                        {/* Print Over/Under Lines */}
                        <tr>
                          <td><b>Over/Under Lines:</b></td>
                          <td>{`Points: ${playerLines.points}`}</td>
                          <td>{`Assists: ${playerLines.assists}`}</td>
                          <td>{`Rebounds: ${playerLines.rebounds}`}</td>
                          <td>{`Blocks: ${playerLines.blocks}`}</td>
                          <td>{`Steals: ${playerLines.steals}`}</td>
                        </tr>
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.id, player.first_name, player.last_name)}>
                        {player.first_name} {player.last_name}
                      </Button>
                    </HtmlTooltip>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Guard</td>
                {awayTeamRoster && awayTeamRoster.filter(player => player.position.includes("G")).map(player => (
                  <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, _index) => (
                          <tr key={stats.id}>
                          </tr>
                        ))}
                          {/* Print L10 averages */}
                          <tr>
                            <td><b>L10 Averages:</b></td>
                            <td>{`Points: ${averagesL10.points}`}</td>
                            <td>{`Assists: ${averagesL10.assists}`}</td>
                            <td>{`Rebounds: ${averagesL10.rebounds}`}</td>
                            <td>{`Blocks: ${averagesL10.blocks}`}</td>
                            <td>{`Steals: ${averagesL10.steals}`}</td>
                          </tr>
                        {/* Print L5 averages */}
                        <tr>
                          <td><b>L5 Averages:</b></td>
                          <td>{`Points: ${averagesL5.points}`}</td>
                          <td>{`Assists: ${averagesL5.assists}`}</td>
                          <td>{`Rebounds: ${averagesL5.rebounds}`}</td>
                          <td>{`Blocks: ${averagesL5.blocks}`}</td>
                          <td>{`Steals: ${averagesL5.steals}`}</td>
                        </tr>
                        {/* Print 2023 averages */}
                        <tr>
                          <td><b>2023 Averages:</b></td>
                          <td>{`Points: ${hitRate2023.points}`}</td>
                          <td>{`Assists: ${hitRate2023.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2023.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2023.blocks}`}</td>
                          <td>{`Steals: ${hitRate2023.steals}`}</td>
                        </tr>
                        {/* Print 2024 averages */}
                        <tr>
                          <td><b>2024 Averages:</b></td>
                          <td>{`Points: ${hitRate2024.points}`}</td>
                          <td>{`Assists: ${hitRate2024.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2024.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2024.blocks}`}</td>
                          <td>{`Steals: ${hitRate2024.steals}`}</td>
                        </tr>
                        {/* Print Over/Under Lines */}
                        <tr>
                          <td><b>Over/Under Lines:</b></td>
                          <td>{`Points: ${playerLines.points}`}</td>
                          <td>{`Assists: ${playerLines.assists}`}</td>
                          <td>{`Rebounds: ${playerLines.rebounds}`}</td>
                          <td>{`Blocks: ${playerLines.blocks}`}</td>
                          <td>{`Steals: ${playerLines.steals}`}</td>
                        </tr>
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.id, player.first_name, player.last_name)}>
                        {player.first_name} {player.last_name}
                      </Button>
                    </HtmlTooltip>
                </td>
                ))}
              </tr>
              <tr>
                <td>Center</td>
                {awayTeamRoster && awayTeamRoster.filter(player => player.position.includes("C")).map(player => (
                  <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, _index) => (
                          <tr key={stats.id}>
                          </tr>
                        ))}
                          {/* Print L10 averages */}
                          <tr>
                            <td><b>L10 Averages:</b></td>
                            <td>{`Points: ${averagesL10.points}`}</td>
                            <td>{`Assists: ${averagesL10.assists}`}</td>
                            <td>{`Rebounds: ${averagesL10.rebounds}`}</td>
                            <td>{`Blocks: ${averagesL10.blocks}`}</td>
                            <td>{`Steals: ${averagesL10.steals}`}</td>
                          </tr>
                        {/* Print L5 averages */}
                        <tr>
                          <td><b>L5 Averages:</b></td>
                          <td>{`Points: ${averagesL5.points}`}</td>
                          <td>{`Assists: ${averagesL5.assists}`}</td>
                          <td>{`Rebounds: ${averagesL5.rebounds}`}</td>
                          <td>{`Blocks: ${averagesL5.blocks}`}</td>
                          <td>{`Steals: ${averagesL5.steals}`}</td>
                        </tr>
                        {/* Print 2023 averages */}
                        <tr>
                          <td><b>2023 Averages:</b></td>
                          <td>{`Points: ${hitRate2023.points}`}</td>
                          <td>{`Assists: ${hitRate2023.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2023.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2023.blocks}`}</td>
                          <td>{`Steals: ${hitRate2023.steals}`}</td>
                        </tr>
                        {/* Print 2024 averages */}
                        <tr>
                          <td><b>2024 Averages:</b></td>
                          <td>{`Points: ${hitRate2024.points}`}</td>
                          <td>{`Assists: ${hitRate2024.assists}`}</td>
                          <td>{`Rebounds: ${hitRate2024.rebounds}`}</td>
                          <td>{`Blocks: ${hitRate2024.blocks}`}</td>
                          <td>{`Steals: ${hitRate2024.steals}`}</td>
                        </tr>
                        {/* Print Over/Under Lines */}
                        <tr>
                          <td><b>Over/Under Lines:</b></td>
                          <td>{`Points: ${playerLines.points}`}</td>
                          <td>{`Assists: ${playerLines.assists}`}</td>
                          <td>{`Rebounds: ${playerLines.rebounds}`}</td>
                          <td>{`Blocks: ${playerLines.blocks}`}</td>
                          <td>{`Steals: ${playerLines.steals}`}</td>
                        </tr>
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.id, player.first_name, player.last_name)}>
                        {player.first_name} {player.last_name}
                      </Button>
                    </HtmlTooltip>
                </td>
                ))}
              </tr>
            </tbody>
          </table>
          ) : (
            <p>Away Team Roster Loading...</p>
          )}
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  ); 
};

export default GameStats;