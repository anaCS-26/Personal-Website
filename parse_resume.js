const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:/Users/asadn/Desktop/Projects/Personal Website/AsadResume.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error("Error parsing PDF:", err);
});
