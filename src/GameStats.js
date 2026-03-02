import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Typography from '@mui/material/Typography';
import { BalldontlieAPI } from "@balldontlie/sdk";

const BALLDONTLIE_API_KEY = process.env.REACT_APP_BALLDONTLIE_API_KEY || '';

const api = new BalldontlieAPI({ apiKey: BALLDONTLIE_API_KEY });

const GameStats = ({ GameId, homeTeam, awayTeam, homeTeamId, awayTeamId }) => {
  const [sortedPrevGamesHome, setSortedPrevGamesHome] = useState("");
  const [sortedUpGamesHome, setSortedUpGamesHome] = useState("");
  const [sortedPrevGamesAway, setSortedPrevGamesAway] = useState("");
  const [sortedUpGamesAway, setSortedUpGamesAway] = useState("");
  const [homeTeamRoster, setHomeTeamRoster] = useState("");
  const [awayTeamRoster, setAwayTeamRoster] = useState("");
  const [playersInfo, setPlayersInfo] = useState({}); // keyed by player id
  

  const [value, setValue] = React.useState('1');

  // Throttled fetch to avoid overwhelming API
  const fetchPlayerInfoThrottled = async (players, delayMs = 1000) => {
    console.log(`Starting to fetch ${players.length} players with ${delayMs}ms delay`);
    const results = [];

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.log(`[${i + 1}/${players.length}] Fetching player ${player.id}`);
      try {
        const info = await fetchPlayerInfo(player);
        if (!info) {
          setPlayersInfo(prev => ({ ...prev, [player.id]: { error: true } }));
        }
        results.push(info);
      } catch (err) {
        console.error(`Throttled fetch failed for player ${player.id}:`, err);
        setPlayersInfo(prev => ({ ...prev, [player.id]: { error: true } }));
        results.push(null);
      }

      if (i < players.length - 1) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    console.log(`Finished fetching ${players.length} players`);
    return results;
  };

  const fetchRoster = async (GameId) => {
    try {
      console.log('fetchRoster started for GameId:', GameId);

      // whenever we start a new roster fetch we also clear any previous player info
      setPlayersInfo({});

      const homeTeamId = (await api.nba.getGame(GameId)).data.home_team.id;
      const awayTeamId = (await api.nba.getGame(GameId)).data.visitor_team.id;
      console.log('Team IDs retrieved:', { homeTeamId, awayTeamId });

      const homeRoster = await api.nba.getActivePlayers({ team_ids: [homeTeamId] });
      const awayRoster = await api.nba.getActivePlayers({ team_ids: [awayTeamId] });
      const homePlayers = homeRoster.data.sort((a, b) => a.min - b.min);
      const awayPlayers = awayRoster.data.sort((a, b) => a.min - b.min);
      console.log('Rosters retrieved:', { homeCount: homePlayers.length, awayCount: awayPlayers.length });

      setHomeTeamRoster(homePlayers);
      setAwayTeamRoster(awayPlayers);
      
      // Fetch stats with throttling to avoid API rate limits
      console.log('Starting stats fetch for home team');
      // awaiting allows us to catch unexpected errors, but we still handle them inside
      await fetchPlayerInfoThrottled(homePlayers).catch(e => console.error('Home team stats error:', e));
      console.log('Starting stats fetch for away team');
      await fetchPlayerInfoThrottled(awayPlayers).catch(e => console.error('Away team stats error:', e));
    } catch (e) {
      console.error('Error in fetchRoster:', e.message);
    }
  };

  const fetchPlayerInfo = async (player, retries = 2) => {
    try {
      const playerId = player.id;
      const startTime = performance.now();
      console.log(`[API] Player ${playerId}: Starting fetch`);

      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedTodayDate = today.toISOString().split('T')[0];

      // perform calls one at a time with a pause between each to avoid hitting rate limits
      console.log(`[API] Player ${playerId}: Fetching main stats`);
      const response = await api.nba.getStats({
        player_ids: [playerId],
        start_date: formattedStartDate,
        end_date: formattedTodayDate,
      });
      await new Promise(r => setTimeout(r, 5000));
      
      console.log(`[API] Player ${playerId}: Fetching 2023 season stats`);
      const games2023Res = await api.nba.getStats({ player_ids: [playerId], seasons: [2023], per_page: 100 });
      await new Promise(r => setTimeout(r, 5000));
      
      console.log(`[API] Player ${playerId}: Fetching 2024 season stats`);
      const games2024Res = await api.nba.getStats({ player_ids: [playerId], seasons: [2024], per_page: 100 });
      await new Promise(r => setTimeout(r, 5000));

      let games2023 = (games2023Res.data || []).filter((g) => g.min > 25);
      const numTotalGames2023 = games2023.length;
      const avgPts2023 = numTotalGames2023 > 0 ? Math.round(games2023.reduce((s, g) => s + parseFloat(g.pts || 0), 0) / numTotalGames2023 * 10) / 10 : 0;
      const avgAst2023 = numTotalGames2023 > 0 ? Math.round(games2023.reduce((s, g) => s + parseFloat(g.ast || 0), 0) / numTotalGames2023 * 10) / 10 : 0;
      const avgReb2023 = numTotalGames2023 > 0 ? Math.round(games2023.reduce((s, g) => s + parseFloat(g.reb || 0), 0) / numTotalGames2023 * 10) / 10 : 0;

      let games2024 = (games2024Res.data || []).filter((g) => g.min > 25);
      const numTotalGames2024 = games2024.length;
      const avgPts2024 = numTotalGames2024 > 0 ? Math.round(games2024.reduce((s, g) => s + parseFloat(g.pts || 0), 0) / numTotalGames2024 * 10) / 10 : 0;
      const avgAst2024 = numTotalGames2024 > 0 ? Math.round(games2024.reduce((s, g) => s + parseFloat(g.ast || 0), 0) / numTotalGames2024 * 10) / 10 : 0;
      const avgReb2024 = numTotalGames2024 > 0 ? Math.round(games2024.reduce((s, g) => s + parseFloat(g.reb || 0), 0) / numTotalGames2024 * 10) / 10 : 0;

      const stats = (response.data || []).reduce((acc, curr) => {
        if (curr.min === '00') return acc;
        const date = new Date(curr.game.date).getTime();
        const index = acc.findIndex(item => new Date(item.game.date).getTime() < date);
        if (index === -1) acc.push(curr);
        else acc.splice(index, 0, curr);
        return acc;
      }, []);

      const last10Stats = stats.slice(0, 10);
      const last10StatsLen = last10Stats.length;
      const avgL10Pts = last10StatsLen > 0 ? Math.round(last10Stats.reduce((s, g) => s + parseFloat(g.pts || 0), 0) / last10StatsLen * 10) / 10 : 0;
      const avgL10Ast = last10StatsLen > 0 ? Math.round(last10Stats.reduce((s, g) => s + parseFloat(g.ast || 0), 0) / last10StatsLen * 10) / 10 : 0;
      const avgL10Reb = last10StatsLen > 0 ? Math.round(last10Stats.reduce((s, g) => s + parseFloat(g.reb || 0), 0) / last10StatsLen * 10) / 10 : 0;

      const last5Stats = stats.slice(0, 5);
      const last5StatsLen = last5Stats.length;
      const avgL5Pts = last5StatsLen > 0 ? Math.round(last5Stats.reduce((s, g) => s + parseFloat(g.pts || 0), 0) / last5StatsLen * 10) / 10 : 0;
      const avgL5Ast = last5StatsLen > 0 ? Math.round(last5Stats.reduce((s, g) => s + parseFloat(g.ast || 0), 0) / last5StatsLen * 10) / 10 : 0;
      const avgL5Reb = last5StatsLen > 0 ? Math.round(last5Stats.reduce((s, g) => s + parseFloat(g.reb || 0), 0) / last5StatsLen * 10) / 10 : 0;

      const info = {
        averagesL10: { points: avgL10Pts, assists: avgL10Ast, rebounds: avgL10Reb },
        averagesL5: { points: avgL5Pts, assists: avgL5Ast, rebounds: avgL5Reb },
        hitRate2023: { points: avgPts2023, assists: avgAst2023, rebounds: avgReb2023 },
        hitRate2024: { points: avgPts2024, assists: avgAst2024, rebounds: avgReb2024 },
      };

      const elapsed = performance.now() - startTime;
      console.log(`[API] Player ${playerId}: Completed in ${elapsed.toFixed(0)}ms`);
      setPlayersInfo(prev => ({ ...prev, [playerId]: info }));
      return info;
    } catch (e) {
      if (e.code === 429 && retries > 0) {
        // simple backoff when rate limited
        await new Promise(r => setTimeout(r, 500));
        return fetchPlayerInfo(player, retries - 1);
      }
      console.error(`[API] Error fetching player ${player.id}: ${e.message} - ${e.code || 'unknown'}`);
      return null;
    }
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

  useEffect(() => {
    fetchRoster(GameId);
    fetchRecentGames(homeTeamId);
    fetchRecentGames(awayTeamId);
  }, [GameId, homeTeam, awayTeam]);

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
                  {['F','G','C'].map(pos => (
                    <tr key={pos}>
                      <td>{pos === 'F' ? 'Forward' : pos === 'G' ? 'Guard' : 'Center'}</td>
                      {homeTeamRoster.filter(player => player.position.includes(pos)).map(player => (
                        <td key={player.id} style={{ padding: '10px', borderRight: '1px solid #ddd' }}>
                          <div><b>{player.first_name} {player.last_name}</b></div>
                          {playersInfo[player.id] ? (
                            playersInfo[player.id].error ? (
                              <div style={{ fontSize: '12px', marginTop: '5px', color: 'red', fontStyle: 'italic' }}>
                                Stats unavailable
                              </div>
                            ) : (
                              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                <div>{`L10 - P: ${playersInfo[player.id].averagesL10.points} A: ${playersInfo[player.id].averagesL10.assists} R: ${playersInfo[player.id].averagesL10.rebounds}`}</div>
                                <div>{`L5  - P: ${playersInfo[player.id].averagesL5.points} A: ${playersInfo[player.id].averagesL5.assists} R: ${playersInfo[player.id].averagesL5.rebounds}`}</div>
                                <div>{`2023 - P: ${playersInfo[player.id].hitRate2023.points} A: ${playersInfo[player.id].hitRate2023.assists} R: ${playersInfo[player.id].hitRate2023.rebounds}`}</div>
                                <div>{`2024 - P: ${playersInfo[player.id].hitRate2024.points} A: ${playersInfo[player.id].hitRate2024.assists} R: ${playersInfo[player.id].hitRate2024.rebounds}`}</div>
                              </div>
                            )
                          ) : (
                            <div style={{ fontSize: '12px', marginTop: '5px', color: '#999', fontStyle: 'italic' }}>Loading...</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
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
            {/* Start of away team roster */}
            {awayTeamRoster.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {['F','G','C'].map(pos => (
                    <tr key={pos}>
                      <td>{pos === 'F' ? 'Forward' : pos === 'G' ? 'Guard' : 'Center'}</td>
                      {awayTeamRoster.filter(player => player.position.includes(pos)).map(player => (
                        <td key={player.id} style={{ padding: '10px', borderRight: '1px solid #ddd' }}>
                          <div><b>{player.first_name} {player.last_name}</b></div>
                          {playersInfo[player.id] ? (
                            playersInfo[player.id].error ? (
                              <div style={{ fontSize: '12px', marginTop: '5px', color: 'red', fontStyle: 'italic' }}>
                                Stats unavailable
                              </div>
                            ) : (
                              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                <div>{`L10 - P: ${playersInfo[player.id].averagesL10.points} A: ${playersInfo[player.id].averagesL10.assists} R: ${playersInfo[player.id].averagesL10.rebounds}`}</div>
                                <div>{`L5  - P: ${playersInfo[player.id].averagesL5.points} A: ${playersInfo[player.id].averagesL5.assists} R: ${playersInfo[player.id].averagesL5.rebounds}`}</div>
                                <div>{`2023 - P: ${playersInfo[player.id].hitRate2023.points} A: ${playersInfo[player.id].hitRate2023.assists} R: ${playersInfo[player.id].hitRate2023.rebounds}`}</div>
                                <div>{`2024 - P: ${playersInfo[player.id].hitRate2024.points} A: ${playersInfo[player.id].hitRate2024.assists} R: ${playersInfo[player.id].hitRate2024.rebounds}`}</div>
                              </div>
                            )
                          ) : (
                            <div style={{ fontSize: '12px', marginTop: '5px', color: '#999', fontStyle: 'italic' }}>Loading...</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
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