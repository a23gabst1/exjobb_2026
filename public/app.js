/**
 * Function that is responsible for switching pages
 * 
 * @param {number} page 
 */
function slideToPage(page) {
    const tracker = document.querySelector(".slider_tracker");

    tracker.style.transform = `translateX(-${page * 100}%)`;
}

const page1 = document.getElementById("page_step_0");
let selectedDatabase = null;

/**
 * Function that is the handler of all click events on the page
 * 
 * @param {Event} event 
 */
function handlePage1Click(event) {
    const element = event.target;

    if (!element.classList.contains("mongodb") && !element.classList.contains("couchdb")) {
        console.log("Nope");
        return;
    }

    selectedDatabase = element.classList.contains("mongodb") ? "MongoDB" : "CouchDB";
    slideToPage(1);
}

page1.addEventListener("click", handlePage1Click);

const startExperimentBtn = document.querySelector("#page_step_1 input[type='button']");

let experimentTrials = null;
/**
 * Function that handles all click events on the start button
 * 
 * @param {Event} event 
 */
async function handleStartBtnClick(event) {
    const trialInput = event.currentTarget.previousElementSibling;
    const numOfTrials = parseInt(trialInput.value.trim());

    if (numOfTrials < 0 || numOfTrials === 0 || trialInput.value === "") {
        alert("Trials cannot be under or equal to 0, or empty!");
        return;
    }

    experimentTrials = numOfTrials;

    const { msg, start } = await initializeExperiment();

    if (start) {
        slideToPage(2);
        setTimeout(async () => {
            await sendRequest();
        }, 4000);
    }
}

/**
 * Function that more or less decide whether the experiment could begin or not
 * 
 * @returns An object response which indicate whether to the experiment and start measuring 
 */
async function initializeExperiment() {
    try {
        const url = `http://localhost:3000/init_experiment?database=${selectedDatabase}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            return { msg: "Something went wrong!", start: false };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error when trying to initialize experiment", error);
    }
}

startExperimentBtn.addEventListener("click", handleStartBtnClick);

/**
 * Function that sends requests to the database endpoint chosen for the experiment
 * 
 * The function is recursive to simulate multiple calls being made by making it call itself
 * 
 * @param {number} currentIteration 
 */
async function sendRequest(currentIteration = 0) {
    /* 
        Important - Base case to make the recursive function stop to prevent stack overflows
    */
    if (currentIteration >= experimentTrials) {
        alert("Experiment is done!");
        slideToPage(0);
        return;
    }

    Math.setSeed(currentIteration);

    try {
        const numOfPatients = 100_000;
        const randomPatient = Math.floor(Math.random() * numOfPatients);

        const database = selectedDatabase.toLowerCase();
        const patientID = `P${stringPadding(randomPatient)}`;

        const url = `http://localhost:3000/${database}/${patientID}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        createView(data, patientID);

        setTimeout(async () => {
            await sendRequest(currentIteration + 1);
        }, 3000);
    } catch (error) {
        console.error(`Error when sending request to '/${database}' endpoint`, error);
    }
}

/**
 * Function that adds a 0 to numbers from 0-9 to make it look like this: 00, 01, .. , 09
 * 
 * @param {number} num 
 * @returns 
 */
function stringPadding(num) {
    return num < 10 ? num.toString().padStart(2, "0") : num.toString();
}

/**
 * Function that is responsible for creating the view by rendering the patient ID and the images related to the patient
 * 
 * @param {Object} data 
 * @param {string} patientID 
 */
function createView(data, patientID) {
    const { msg, images } = data;

    const patientIDText = document.querySelector(".patient_id_txt");
    const imageWrapper = document.querySelector(".medic_image_wrapper");

    patientIDText.textContent = patientID;

    imageWrapper.innerHTML = "";
    const n = images.length;
    for (let i = 0; i < n; i++) {
        const img = document.createElement("img");

        /* 
            Relative Path
            It is in public since the server sends static assets which include images
        */
        img.src = `/public/${images[i].img_src}`;
        img.alt = "Image of an possible disease";

        imageWrapper.append(img);
    }
}