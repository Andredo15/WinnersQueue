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
import ReactModal from 'react-modal';
import Typography from '@mui/material/Typography';

const GameStats = ({ GameId, homeTeam, awayTeam, homeTeamId, awayTeamId }) => {
  const [rosterData, setRosterData] = useState("");
  const [stats, setStats] = useState("");
  const [statsArray, setStatsArray] = useState("");
  const [playerStats, setPlayerStats] = useState("");
  const [sortedPrevGamesHome, setSortedPrevGamesHome] = useState("");
  const [sortedUpGamesHome, setSortedUpGamesHome] = useState("");
  const [sortedPrevGamesAway, setSortedPrevGamesAway] = useState("");
  const [sortedUpGamesAway, setSortedUpGamesAway] = useState("");
  const [homeTeamRoster, setHomeTeamRoster] = useState("");
  const [awayTeamRoster, setAwayTeamRoster] = useState("");
  const [NBALineData, setNBALineData] = useState("");
  const [holdPlayerId, setHoldPlayerId] = useState("");
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
  };

  const fetchLines = async () => {

    const response = await Axios.get(`https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=d265dba2d2f4dcfa64e3ce0c86008bc7&regions=us&markets=h2h,spreads&oddsFormat=american`);
    
    console.log("fetch lines: ", response.data);

  };

  const fetchRecentGames = async (TeamId) => {

    const response = await Axios.get(`https://www.balldontlie.io/api/v1/games?seasons[]=2022&per_page=100&team_ids[]=${TeamId}`);

    const today = new Date();

    const prevGames = response.data.data.filter(game => new Date(game.date) < new Date(new Date().setDate(new Date().getDate() - 1)));
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchStats = async (playerId) => {
    const response = await Axios.get(`https://www.balldontlie.io/api/v1/stats?seasons[]=2022&player_ids[]=${playerId}&sort=-game.date&per_page=100`);

    setHoldPlayerId(playerId);
        const stats = await response.data.data.reduce((acc, curr) => {
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

  if (!rosterData) {
    return <p>Loading player data...</p>;
  }

  if (!sortedPrevGamesHome) {
    return <p>Loading previous games data...</p>;
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
                  {rosterData && homeTeamRoster.filter(player => player.player.position.includes("F")).map(player => (
                  <td>
                    <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
                          <tr key={stats.id}>
                            <td>{stats.game.date.substring(5,10)}</td>
                            <td>{`Points: ${stats.pts} `}</td>
                            <td>{`Asists: ${stats.ast} `}</td>
                            <td>{`Rebounds: ${stats.reb} `}</td>
                            <td>{`Blocks: ${stats.blk} `}</td>
                            <td>{`Steals: ${stats.stl} `}</td>
                          </tr>
                        ))}
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.player.id)}>
                        {player.player.first_name} {player.player.last_name}
                      </Button>
                    </HtmlTooltip>
                    </td>
                  </td>
                  ))}
                </tr>
                <tr>
                  <td>Guard</td>
                  {rosterData && homeTeamRoster.filter(player => player.player.position.includes("G")).map(player => (
                <td>
                  <td key={player.id}>
                  <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
                          <tr key={stats.id}>
                            <td>{stats.game.date.substring(5,10)}</td>
                            <td>{`Points: ${stats.pts} `}</td>
                            <td>{`Asists: ${stats.ast} `}</td>
                            <td>{`Rebounds: ${stats.reb} `}</td>
                            <td>{`Blocks: ${stats.blk} `}</td>
                            <td>{`Steals: ${stats.stl} `}</td>
                          </tr>
                        ))}
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.player.id)}>
                        {player.player.first_name} {player.player.last_name}
                      </Button>
                    </HtmlTooltip>
                  </td>
              </td>
              ))}
            </tr>
            <tr>
              <td>Center</td>
              {rosterData && homeTeamRoster.filter(player => player.player.position.includes("C")).map(player => (
                <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
                          <tr key={stats.id}>
                            <td>{stats.game.date.substring(5,10)}</td>
                            <td>{`Points: ${stats.pts} `}</td>
                            <td>{`Asists: ${stats.ast} `}</td>
                            <td>{`Rebounds: ${stats.reb} `}</td>
                            <td>{`Blocks: ${stats.blk} `}</td>
                            <td>{`Steals: ${stats.stl} `}</td>
                          </tr>
                        ))}
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.player.id)}>
                        {player.player.first_name} {player.player.last_name}
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
                {rosterData && awayTeamRoster.filter(player => player.player.position.includes("F")).map(player => (
                  <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
                          <tr key={stats.id}>
                            <td>{stats.game.date.substring(5,10)}</td>
                            <td>{`Points: ${stats.pts} `}</td>
                            <td>{`Asists: ${stats.ast} `}</td>
                            <td>{`Rebounds: ${stats.reb} `}</td>
                            <td>{`Blocks: ${stats.blk} `}</td>
                            <td>{`Steals: ${stats.stl} `}</td>
                          </tr>
                        ))}
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.player.id)}>
                        {player.player.first_name} {player.player.last_name}
                      </Button>
                    </HtmlTooltip>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Guard</td>
                {rosterData && awayTeamRoster.filter(player => player.player.position.includes("G")).map(player => (
                  <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
                          <tr key={stats.id}>
                            <td>{stats.game.date.substring(5,10)}</td>
                            <td>{`Points: ${stats.pts} `}</td>
                            <td>{`Asists: ${stats.ast} `}</td>
                            <td>{`Rebounds: ${stats.reb} `}</td>
                            <td>{`Blocks: ${stats.blk} `}</td>
                            <td>{`Steals: ${stats.stl} `}</td>
                          </tr>
                        ))}
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.player.id)}>
                        {player.player.first_name} {player.player.last_name}
                      </Button>
                    </HtmlTooltip>
                </td>
                ))}
              </tr>
              <tr>
                <td>Center</td>
                {rosterData && awayTeamRoster.filter(player => player.player.position.includes("C")).map(player => (
                  <td key={player.id}>
                    <HtmlTooltip
                      title={
                        <React.Fragment>
                          <Typography color="inherit">Last 10 Game Averages</Typography>
                          {Array.isArray(playerStats) && playerStats.slice(playerStats.length-10, playerStats.length).map((stats, index) => (
                          <tr key={stats.id}>
                            <td>{stats.game.date.substring(5,10)}</td>
                            <td>{`Points: ${stats.pts} `}</td>
                            <td>{`Asists: ${stats.ast} `}</td>
                            <td>{`Rebounds: ${stats.reb} `}</td>
                            <td>{`Blocks: ${stats.blk} `}</td>
                            <td>{`Steals: ${stats.stl} `}</td>
                          </tr>
                        ))}
                        </React.Fragment>
                      }>
                      <Button onClick={() => fetchStats(player.player.id)}>
                        {player.player.first_name} {player.player.last_name}
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