#!/usr/bin/env node

/*
For reference sfc from stack overflow and practrand
----------=======################========-----------
https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
https://pracrand.sourceforge.net/

https://github.com/LenaSYS/Random-Number-Generator/blob/master/seededrandom.js
*/

import { createWriteStream } from "node:fs";
import path from "node:path"
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker"

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a random birthdate such as 2001-02-24
 * 
 * @returns {string}
 */
function createBirthdate() {
    const min = 1900;
    const max = new Date().getFullYear();

    //Random  year between 1900 - the current year (2026)
    const year = Math.floor(Math.random() * (max - min)) + min;

    // Random month 1 - 12
    const month = Math.floor(Math.random() * 12) + 1;

    const daysInMonth = {
        "01": 31,
        "02": 28,
        "03": 31,
        "04": 30,
        "05": 31,
        "06": 30,
        "07": 31,
        "08": 31,
        "09": 30,
        "10": 31,
        "11": 30,
        "12": 31
    };

    /* 
        Creates a random day between 1 - the maximum days in that specific month (daysInMonth)
    */
    const day = Math.floor(Math.random() * daysInMonth[stringPadding(month)] + 1);

    return `${year}-${stringPadding(month)}-${stringPadding(day)}`;
}

/**
 * Creates the random age of the person by calculating its age
 * 
 * @param {string} year 
 * @returns {number}
 */
function createAge(year) {
    const birthYear = year.split("-")[0];
    return new Date().getFullYear() - birthYear;
}

/**
 * Creates the patient collection and storing it in a .json file
 * 
 * It consists of two seeds to generate pseudorandom numbers which could controlled to generate the same set of fake patients
 * 
 */
function createPatients() {
    const numOfPatients = 100_000;
    const dataFile = "patients.json";
    const patientStream = createWriteStream(path.join(__dirname, dataFile));
    let seedCount = 0;

    for (let i = 0; i < numOfPatients; i++) {
        //The seeds to generate pseudorandom sequences
        faker.seed(seedCount);
        Math.setSeed(seedCount);

        const lastFourNum = Math.floor(Math.random() * 10_000);

        const patientBirthdate = createBirthdate();
        const patientAge = createAge(patientBirthdate);

        const patientRecord = {
            patient_id: `P${stringPadding(i)}`,
            ssn: `${patientBirthdate.replaceAll("-", "")}${lastFourNum}`,
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            age: patientAge,
            gender: faker.person.gender()
        };

        patientStream.write(JSON.stringify(patientRecord) + "\n");

        seedCount += 1;
    }

    patientStream.end();
}

createPatients();

/**
 * Adds a 0 in front of every number from 1-9
 * Example: 
 * 01, 02, ...
 * 
 * @param {number} num 
 * @returns {string}
 */
function stringPadding(num) {
    return `${num < 10 ? num.toString().padStart(2, "0") : num}`;
}