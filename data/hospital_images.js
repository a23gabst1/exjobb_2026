#!/usr/bin/env node

/*
For reference sfc from stack overflow and practrand
----------=======################========-----------
https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
https://pracrand.sourceforge.net/

https://github.com/LenaSYS/Random-Number-Generator/blob/master/seededrandom.js
*/

import path, { dirname, join } from "node:path"
import { fileURLToPath } from "node:url";
import fs, { createWriteStream } from "node:fs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function jsf32(a, b, c, d) {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = a - (b << 23 | b >>> 9) | 0;
    a = b ^ (c << 16 | c >>> 16) | 0;
    b = c + (d << 11 | d >>> 21) | 0;
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
}

Math.random = function () {
    var ran = jsf32(0xF1EA5EED, Math.randSeed + 6871, Math.randSeed + 1889, Math.randSeed + 56781);
    Math.randSeed += Math.floor(ran * 37237);
    return (ran)
}

Math.setSeed = function (seed) {
    Math.randSeed = seed;
    for (var i = 0; i < 7; i++) Math.random();
}

const countOfImages = [];
const imgStorage = [];

(function () {
    for (let i = 1; i <= 50; i++) {
        countOfImages.push(i);
    }
})();

function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomImageCount(imgList, distribution) {
    if (distribution) {
        let idx = getRandomNum(0, imgList.length);
        return countOfImages[idx];
    }
    else {
        let idx = getRandomNum(0, imgList.length + 1);
        idx = getRandomNum(0, idx);
        return imgList[idx];
    }
}

for (let i = 0; i < 500; i++) {
    Math.setSeed(i);
    imgStorage.push(randomImageCount(countOfImages, 0));
}

/**
 * Generates the dataset to be imported to the database clusters 
 * 
 * It creates either 1M, 5M or 10M documents which are hospital images related to a patient 
 */
function generateData() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let dataVolume = parseInt(process.argv[2]);
    let retryCounter = 0;
    let fileStream = fs.createWriteStream(join(__dirname, "hospital_images.json"));
    let medicalImgs = fs.readdirSync(join(__dirname, "../lc25000-extracted/LC25000/lung_split/train/colon_aca"));

    const amountOfDocs = {
        10: 10_000_000,
        5: 5_000_000,
        1: 1_000_000
    };

    let documentWatcher = amountOfDocs[dataVolume];

    for (let i = 0; documentWatcher > 0; i++) {
        retryCounter = 0;
        Math.setSeed(i);

        while (retryCounter < 5) {
            const idx = randomImageCount(countOfImages, 0);
            let diff = documentWatcher - idx;

            if (diff < 0 && retryCounter != 4) {
                retryCounter += 1;
                continue;
            }
            else if (diff < 0 && retryCounter === 4) {
                const fixedIdx = 1;
                for (let j = 0; j < fixedIdx; j++) {
                    const randomIdx = Math.floor(Math.random() * medicalImgs.length);

                    const imgRecord = {
                        img_id: `${stringPadding(i)}-${stringPadding(j)}`,
                        patient_id: `P${stringPadding(i)}`,
                        img_src: `/images/colon_aca/${medicalImgs[randomIdx]}`,
                        disease_type: "colon cancer",
                        content_type: "image/jpeg"
                    };

                    fileStream.write(JSON.stringify(imgRecord) + "\n");
                }
                documentWatcher -= fixedIdx;
                break;
            }
            else {
                for (let j = 0; j < idx; j++) {
                    const randomIdx = Math.floor(Math.random() * medicalImgs.length);
                    const imgRecord = {
                        img_id: `${stringPadding(i)}-${stringPadding(j)}`,
                        patient_id: `P${stringPadding(i)}`,
                        img_src: `/images/colon_aca/${medicalImgs[randomIdx]}`,
                        disease_type: "colon cancer",
                        content_type: "image/jpeg"
                    };

                    fileStream.write(JSON.stringify(imgRecord) + "\n");
                }
                documentWatcher -= idx;
                break;
            }
        }
    }

    fileStream.close();
}

generateData();

/**
 * Adds a 0 in front of every number from 1-9
 * Example: 
 * 01, 02, ...
 * 
 * @param {number} num 
 * @returns {string}
 */
function stringPadding(num) {
    return `${num < 10 ? num.toString().padStart(2, "0") : num.toString()}`;
}