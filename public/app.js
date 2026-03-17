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