document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('activatePrivateStorageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('activatePrivateStorageForm submitted');
    });

    document.getElementById('activatePrivateStorageSubmitBtn').addEventListener('click', () => {
        console.log("Activating private storage ..");
    });
});