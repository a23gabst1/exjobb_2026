/*
For reference sfc from stack overflow and practrand
----------=======################========-----------
https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
https://pracrand.sourceforge.net/

https://github.com/LenaSYS/Random-Number-Generator/blob/master/seededrandom.js
*/

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