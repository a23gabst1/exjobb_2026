function slideToPage(page) {
    const tracker = document.querySelector(".slider_tracker");

    tracker.style.transform = `translateX(-${page * 100}%)`;
}