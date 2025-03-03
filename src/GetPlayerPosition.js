fetch("https://v2.nba.api-sports.io/players/statistics?season=2020&id=734", {
    "method": "GET",
    "headers": {
        "x-rapidapi-host": "v2.nba.api-sports.io",
        "x-rapidapi-key": "d19131405dmsh2ad1103b8ab2b26p1701ecjsnce7ee8752ba2"
    }
})
.then(response => response.json()) // Parse the response as JSON
.then(data => {
    console.log(data); // Output the JSON data
})
.catch(err => {
    console.error(err);
});
