const mainElement = document.querySelector("main");
const navLinks = document.querySelectorAll('#mainnav ul li a');
let myFilms = [];

async function getFilms(){
    const filmPromise = await fetch("https://ghibliapi.vercel.app/films");
    const films = await filmPromise.json();
    myFilms = films;

    setSort(myFilms);
    addCards(myFilms , 'films');
    document.getElementById('sortorder').removeAttribute('disabled');
}
getFilms();

function addCards(cardData , cardType) {
    if (cardType === 'films') {
        myFilms = cardData;
        setSort(cardData);
        document.getElementById('sortorder').removeAttribute('disabled');
    }else{
        document.getElementById('sortorder').setAttribute('disabled' , 'disabled');
    }
    cardData.forEach(card => {
        createCard(card , cardType);
    });
}

document.getElementById('sortorder').addEventListener('change', function () {
    mainElement.innerHTML = '';
    setSort(myFilms);
    addCards(myFilms , 'films');
});

navLinks.forEach(anchor => {
    anchor.addEventListener('click' , async function(event){
        event.preventDefault();
        mainElement.innerHTML = '';
        const myPromise = await fetch("https://ghibliapi.vercel.app/" + anchor.innerHTML.toLowerCase());
        const myItem = await myPromise.json();
        addCards(myItem , anchor.innerHTML.toLowerCase());
        console.log(myItem);
    })
});

function setSort(array) {
    const sortOrder = document.getElementById('sortorder').value;
    switch (sortOrder) {
        case 'title': array.sort((a, b) => (a.title > b.title) ? 1 : -1); break;
        case 'release_date': array.sort((a, b) => (a.release_date > b.release_date) ? 1 : -1); break;
        case 'rt_score': array.sort((a, b) => (parseInt(a.rt_score) > parseInt(b.rt_score)) ? -1 : 1); break;
    }
}

async function createCard(data , type) {
    const card = document.createElement('article');

    switch (type) {
        case 'films':
            card.innerHTML = filmCardContents(data);
            break;

        case 'people':
            card.innerHTML = await peopleCardContents(data);
            break;

        case 'locations':
            card.innerHTML = await locationCardContents(data);
            break;

        case 'species':
            card.innerHTML = await speciesCardContents(data);
            break;  

        case 'vehicles':
            card.innerHTML = await vehicleCardContents(data);
            break;  
    
        default:
            break;
    }
    mainElement.appendChild(card);
}

function filmCardContents(data) {
    let html = `<h2>${data.title}</h2>`;
    html += `<p><strong>Director:</strong> ${data.director}</p>`;
    html += `<p><strong>Released:</strong> ${data.release_date}</p>`;
    html += `<p>${data.description}</p>`;
    html += `<p><strong>Rotten Tomatoes Score:</strong> ${data.rt_score}</p>`;
    return html;
}

async function peopleCardContents(data) {
    const thefilms = data.films;
    let filmtitles = [];
    for (eachFilm of thefilms) {
        const filmTitle = await indivItem(eachFilm, 'title');
        filmtitles.push(filmTitle);
    }
    const species = await indivItem(data.species, 'name');

    let html = `<h2>${data.name}</h2>`;
    html += `<p><strong>Details:</strong> gender ${data.gender}, age ${data.age}, eye color
    ${data.eye_color}, hair color ${data.hair_color}</p>`;
    html += `<p><strong>Films:</strong> ${filmtitles.join(', ')}</p>`;
    html += `<p><strong>Species:</strong> ${species}</p>`;

    return html;
}

async function locationCardContents(data) {
    const regex = 'https?:\/\/';
    const theResidents = data.residents;
    let residentNames = [];
    for (eachResident of theResidents) {
        if(eachResident.match(regex)){
            const resName = await indivItem(eachResident, 'name');
            residentNames.push(resName);
        }
        else {
            residentNames[0]='no data available';
        }
    }

    const thefilms = data.films;
    let filmtitles = [];
    for (eachFilm of thefilms) {
        const filmTitle = await indivItem(eachFilm, 'title');
        filmtitles.push(filmTitle);
    }

    let html = `<h2>${data.name}</h2>`;
    html += `<p><strong>Details:</strong> climate ${data.climate}, terrain ${data.terrain}, surface water
    ${data.surface_water}%</p>`;
    html += `<p><strong>Residents:</strong> ${residentNames.join(', ')}</p>`;
    html += `<p><strong>Films:</strong> ${filmtitles.join(', ')}</p>`;

    return html;
}

async function speciesCardContents(data) {
    const people = data.people;
    let peopleNames = [];
    for (eachPerson of people) {
        const personName = await indivItem(eachPerson, 'name');
        peopleNames.push(personName);
    }

    const thefilms = data.films;
    let filmtitles = [];
    for (eachFilm of thefilms) {
        const filmTitle = await indivItem(eachFilm, 'title');
        filmtitles.push(filmTitle);
    }

    let html = `<h2>${data.name}</h2>`;
    html += `<p><strong>Classification:</strong> ${data.classification}</p>`;
    html += `<p><strong>Eye Colors:</strong> ${data.eye_colors}</p>`;
    html += `<p><strong>Hair Colors:</strong> ${data.hair_colors}</p>`;
    html += `<p><strong>People:</strong> ${peopleNames.join(', ')}</p>`;
    html += `<p><strong>Films:</strong> ${filmtitles.join(', ')}</p>`;

    return html;
}

async function vehicleCardContents(data) {
    let html = `<h2>${data.name}</h2>`;
    html += `<p><strong>Description:</strong> ${data.description}</p>`;
    html += `<p><strong>Vehicle Class:</strong> ${data.vehicle_class}</p>`;
    html += `<p><strong>Length:</strong> ${data.length} feet</p>`;
    html += `<p><strong>Pilot:</strong> ${await indivItem(data.pilot, 'name')}</p>`;
    html += `<p><strong>Film:</strong> ${await indivItem(data.films, 'title')}</p>`;
    return html;
}

async function indivItem(url, item) {
    var theItem;
    try{
        const itemPromise = await fetch(url);
        const data = await itemPromise.json();
        theItem = data[item];
    } catch(err){
        theItem = "no data available";
    } finally{
        return theItem;
    }
}