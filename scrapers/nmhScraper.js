import * as cheerio from 'cheerio';
import { writeFile } from 'node:fs';
import getHtml from '../util.js';

const url = 'https://www.nmh.net.in/page/OPD-Schedule'; // Narinder Mohan OPD Link
const detailUrl = 'https://www.nmh.net.in/contact';

// Returns a promise with HTML content of URL

const text = await getHtml(url); // Fetching HTML Content
const $ = cheerio.load(text); // Creating cheerio Object to traverse

// Scraping all the schedules from the webpage

const tableBody = $('table.matter.border2').children();

// Creating Header Row for the data
const final = ['Department,'];
const headerRow = $(tableBody[0]).children('tr');

$(headerRow[1]).children('td').map((y, el) => final.push($(el).text().trim().split(','[0]), ','));
final.pop();
final.push('\n');

// Scraping and adding the core data from webpage to the array
for (let x = 0; x < tableBody.length - 1; x += 1) {
  const array = [];
  const tableRow = $(tableBody[x]).children('tr');

  for (let i = 2; i < tableRow.length; i += 1) {
    if ($($(tableRow[i]).children('td')[0]).text().trim().split('’')[0] !== 'Doctor'.valueOf()) {
      array.push($(tableRow[0]).find('td').text(), ',');
      $(tableRow[i]).children('td').map((z, el) => array.push($(el).text().trim().split(',')[0], ','));
      array.pop();
      array.push('\n');
    }
  }
  final.push(...array);
}
// Scraping End

// Writing the scraped data to CSV for analysis
writeFile('../raw_schedules/nmhSchedule.csv', final.join('').replace(/[-/\u00a0]/g, ''), (err) => {
  if (err) throw err;
  console.log('Schedule saved successfully');
});

// END

const detailHtml = await getHtml(detailUrl); // Fetching HTML Content
const C = cheerio.load(detailHtml); // Creating cheerio Object to traverse

const details = {};

details.name = 'Narinder Mohan Hospital & Heart Centre';
const address = C('div.adr-address');
details.address = C(address[0])
  .text()
  .trim()
  .replace(/\s\s+/g, ' ');

const number = C('div.adr-phone');
details.number = C(number[0])
  .text()
  .trim()
  .replace(/\s+/g, '');

const email = C('div.adr-Email');
[details.email, details.url] = C(email[0])
  .text()
  .trim()
  .replace(/\s/g, '')
  .split(',');

writeFile('../hospital_details/nmhDetails.txt', JSON.stringify(details, undefined, 2), (err) => {
  if (err) throw err;
  console.log('Details saved successfully');
});
