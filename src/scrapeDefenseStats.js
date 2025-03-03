const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log("Navigating to the page...");
    await page.goto('https://hashtagbasketball.com/nba-defense-vs-position', {
        waitUntil: 'networkidle2',
    });

    console.log("Checking for the presence of the table...");
    const tableExists = await page.evaluate(() => !!document.querySelector('table.stats_table'));
    if (!tableExists) {
        console.error("Table not found on initial load.");
        await browser.close();
        return;
    }

    console.log("Table found, scrolling down to load content...");
    for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Waiting for the stats table...");
    try {
        await page.waitForSelector('table.stats_table', { timeout: 30000 });
        console.log("Table found!");
    } catch (error) {
        console.error("Table not found after scrolling.");
        await browser.close();
        return;
    }

    console.log("Extracting data...");
    const data = await page.evaluate(() => {
        const table = document.querySelector('table.stats_table');
        if (!table) return [];

        return Array.from(table.querySelectorAll('tbody tr')).map(row => {
            const columns = row.querySelectorAll('td');
            return {
                team: columns[0]?.innerText.trim() || 'N/A',
                points: columns[2]?.innerText.trim() || 'N/A',
                rebounds: columns[3]?.innerText.trim() || 'N/A',
                assists: columns[4]?.innerText.trim() || 'N/A'
            };
        });
    });

    console.log("Extracted Data: ", data);

    await new Promise(resolve => setTimeout(resolve, 5000)); // Keep browser open longer for debugging
    await browser.close();
})();
