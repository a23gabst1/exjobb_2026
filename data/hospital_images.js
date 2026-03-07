#!/usr/bin/env node

/*
For reference sfc from stack overflow and practrand
----------=======################========-----------
https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
https://pracrand.sourceforge.net/

https://github.com/LenaSYS/Random-Number-Generator/blob/master/seededrandom.js
*/

import path from "node:path"
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises"
import { createWriteStream } from "node:fs";

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

/**
 * Creates the images collection consisted of colon cancer
 * 
 * Each patient get the same amount of images (uniform)
 * 
 * Each image record is stored in .json file to later imported to the databases
 * 
 * It uses a seed to generate pseudorandom sequence of numbers which could be repeated 
 * 
 * Could be improved
 */
async function createHospitalImages() {
    //Directory with tons of images of colon cancer
    const folderPath = path.join(__dirname, "../lc25000-extracted/LC25000/lung_split/train/colon_aca");
    const numOfPatients = 100_000;
    const numOfImages = parseInt(process.argv[2]); // 9, 49, 99
    const imageStream = createWriteStream(path.join(__dirname, "hospital_images.json"));
    let seedCount = 0;

    try {
        const images = await fs.readdir(folderPath);

        //Outer loop - every patient
        for (let i = 0; i < numOfPatients; i++) {
            Math.setSeed(seedCount);

            //Inner loop - every image for the patient
            for (let j = 0; j < numOfImages; j++) {
                const randomIndex = Math.floor(Math.random() * images.length);

                const imageRecord = {
                    image_id: `I${stringPadding(i)}-${stringPadding(j)}`,
                    patient_id: `P${stringPadding(i)}`,
                    img_src: `/images/colon_aca/${images[randomIndex]}`,
                    disease_type: "colon cancer",
                    content_type: "image/jpeg"
                };

                imageStream.write(JSON.stringify(imageRecord) + "\n");
            }
            seedCount += 1;
        }

        imageStream.end();
    } catch (error) {
        console.error("Error when creating images for hospital dataset", error);
    }
}

await createHospitalImages();

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