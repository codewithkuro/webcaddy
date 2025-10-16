const getStartedBtn = document.getElementById("getStartedBtn");

getStartedBtn.addEventListener('click', () => {
    console.log('btn clicked.');
    chrome.tabs.create({
        url: 'settings/index.html'
    });
});