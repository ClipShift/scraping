import * as cheerio from 'cheerio';
import { writeFile } from 'node:fs';
import getHtml from '../util.js';

const url = 'https://www.yashodahospital.org/opd-schedule'; // Yashoda OPD Link
const detailUrl = 'https://www.yashodahospital.org/contact.php';

// Returns a promise with HTML content of URL

const html = await getHtml(url); // Fetching HTML Content
const $ = cheerio.load(html); // Creating cheerio Object to traverse

// Scraping all the schedules from the webpage

const tableRows = $('table > tbody').children('tr');

const table = [];

for (let i = 0; i < tableRows.length; i += 1) {
  const rowText = [];
  const tableData = $(tableRows[i]).children('td');
  tableData.map((x, e) => rowText.push($(e).text().trim()));
  table.push(rowText);
}

const filteredData = table.filter((r) => Boolean(r.join(''))); // Removing empty rows

for (let i = 2; i < filteredData.length; i += 1) { // Filling blank cells
  if (!filteredData[i][0]) filteredData[i][0] = filteredData[i - 1][0];
  if (!filteredData[i][1]) filteredData[i][1] = filteredData[i - 1][1];
  if (!filteredData[i][2]) filteredData[i][2] = filteredData[i - 1][2];
}

const t1 = filteredData.map((d) => d.join(','));

// Scraping End

// Writing the scraped data to CSV for analysis
writeFile('../raw_schedules/ysdSchedule.csv', t1.join('\n'), (err) => {
  if (err) throw err;
  console.log('Schedule saved successfully');
});
// END

const detailHtml = await getHtml(detailUrl); // Fetching HTML Content
const C = cheerio.load(detailHtml); // Creating cheerio Object to traverse
const details = {};
const d = C('div.col-lg-10.col-md-10.col-9').find('p');
details.name = 'Yashoda Super Speciality Hospitals Pvt. Ltd.';
details.address = C(d[0]).text().trim().replace(/\s\s+/, ' ');
details.number = C(d[2]).text().trim().split(/\s\s+/g)[1];
details.email = C(d[4]).text().trim().split(/\s\s+/g)[0];
details.url = 'https://www.yashodahospital.org/';

writeFile('../hospital_details/ysdDetails.txt', JSON.stringify(details, undefined, 2), (err) => {
  if (err) throw err;
  console.log('Details saved successfully');
});
