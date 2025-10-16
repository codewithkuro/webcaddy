document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('activatePrivateStorageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('activatePrivateStorageForm submitted');
        let firstname = getInputText('firstnametf');
        let lastname = getInputText('lastnametf');
        let phone = getInputText('phonetf');
        let email = getInputText('emailtf');
        let address = getInputText('addresstf');
        let city = getInputText('citytf');
        let country = getInputText('countrytf');

        console.log(`${firstname} ${lastname} ${phone} ${email} ${address} ${city} ${country}`);

    });

    // document.getElementById('activatePrivateStorageSubmitBtn').addEventListener('click', () => {
    //     console.log("Activating private storage ..");
    // });
});

function clearInput(id) {
    let formInput = document.getElementById(id);
    if (formInput) formInput.value = "";
}

function getInputText(name) {
    let val;
    let element = document.getElementById(name);
    if(element) val = element.value;
    
    return val;
}function clearInput(id: string) {
    const emailInput = document.getElementById(id) as HTMLInputElement;
    if (emailInput) emailInput.value = "";
  }