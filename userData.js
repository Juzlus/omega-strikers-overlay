function noUser(noBack) {
    if(noBack) return;
    alert("User could not be found. Back to main page.")
    window?.open('index.html', '_self');
};

const queryParams = new URLSearchParams(window?.location?.search);
const username = queryParams?.get('username');
const usernameRegion = queryParams?.get('region');
if(!username || !usernameRegion) noUser();

let games = 0;
let wins = 0;
let losses = 0;
let scores = 0;
let assists = 0;
let saves = 0;
let knockouts = 0;
let mvp = 0;
let forward = 0;
let goalie = 0;
let lp = 0;
let region;
let tier;
let favStrikers = {};

let lastWins = 0;
let lastLosses = 0;
let lastLP = 0;
let lastGames = 0;

function refreshData(labelConfig, noBack, session) {
    const query = `
        query {
            ensurePlayer(name: "${username}", refresh: true, region: "${usernameRegion}") {
                characterRatings {
                    assists
                    character
                    createdAt
                    gamemode
                    games
                    id
                    knockouts
                    losses
                    mvp
                    playerId
                    role
                    saves
                    scores
                    wins
                }
                nameplateId
                ratings {
                    createdAt
                    id
                    rank
                    rating
                }
                region
                username
            }
        }
        `;

    const apiUrl = 'https://api.strikr.gg';
    const url = `${apiUrl}?query=${encodeURIComponent(query)}`;

    $.ajax({
            url: url,
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
        },
        success: function(response) {
            const data = response?.data?.ensurePlayer;
            if(!data) return noUser(noBack);

            const rating = data?.ratings[data?.ratings?.length - 1];
            if(!data?.characterRatings?.length) return noUser(noBack);

            switch(data?.region) {
                case "Asia":
                    region = "AS";
                    break;
                case "NorthAmerica":
                    region = "NA";
                    break;
                case "SouthAmerica":
                    region = "SA";
                    break;
                case "Europe":
                    region = "EU";
                    break;
                case "Oceania":
                    region = "OC";
                    break;
                case "Japanese":
                    region = "JP";
                    break;
                default:
                    region = "GL";
                    break;
            }

            lp = rating?.rating || 0;
            if(lp >= 3000)
                tier = "Pro League";
            else if(lp >= 2900)
                tier = "Omega";

            else if(lp >= 2800)
                tier = "High Challenger";
            else if(lp >= 2700)
                tier = "Mid Challenger";
            else if(lp >= 2600)
                tier = "Low Challenger";

            else if(lp >= 2500)
                tier = "High Diamond";
            else if(lp >= 2400)
                tier = "Mid Diamond";
            else if(lp >= 2300)
                tier = "Low Diamond";

            else if(lp >= 2200)
                tier = "High Platinum";
            else if(lp >= 2100)
                tier = "Mid Platinum";
            else if(lp >= 2000)
                tier = "Low Platinum";

            else if(lp >= 1900)
                tier = "High Gold";
            else if(lp >= 1800)
                tier = "Mid Gold";
            else if(lp >= 1700)
                tier = "Low Gold";

            else if(lp >= 1600)
                tier = "High Silver";
            else if(lp >= 1500)
                tier = "Mid Silver";
            else if(lp >= 1400)
                tier = "Low Silver";

            else if(lp >= 1300)
                tier = "High Bronze";
            else if(lp >= 1200)
                tier = "Mid Bronze";
            else if(lp >= 1100)
                tier = "Low Bronze";

            else if(lp >= 1000)
                tier = "High Rookie";
            else if(lp >= 9000)
                tier = "Mid Rookie";
            else
                tier = "Low Rookie";

            let characterRatings = data?.characterRatings?.filter((el) => { return el?.gamemode == 'RankedInitial' });
            characterRatings = characterRatings?.sort((a, b) => { return b.createdAt - a.createdAt });
            characterRatings = characterRatings?.filter((value, index, self) =>
                index === self?.findIndex((t) => (
                    t?.character === value?.character && t?.role == value?.role
                ))
            );
            characterRatings?.forEach(el => {
                games += el?.games || 0;
                wins += el?.wins || 0;
                losses += el?.losses || 0;
                scores += el?.scores || 0;
                assists += el?.assists || 0;
                saves += el?.saves || 0;
                knockouts += el?.knockouts || 0;
                mvp += el?.mvp || 0;
                forward += el?.role == "Forward" ? 1 : 0;
                goalie += el?.role == "Goalie" ? 1 : 0;

                const strikerName = el?.character?.slice(3)?.replace('MagicalPlaymaker', 'MagicalPlaymaker_Default')?.replace('EDMOni', 'AN_EDMOni');
                if(strikerName)
                    favStrikers[strikerName] = favStrikers[strikerName] ? + favStrikers[strikerName] + el?.games : el?.games;
            });
            favStrikers = Object.fromEntries(
                Object.entries(favStrikers).sort(([,a],[,b]) => b-a)
            );
            
            document.getElementById('username').innerText = data?.username || "unknown";
            document.getElementById('region').innerText = region;
            document.getElementById('ranking').innerText = `#${rating?.rank || 0}`;
            document.getElementById('rating').innerText = lp;
            document.getElementById('tier').innerText = tier;
            document.getElementById('tierImg').src = `image/RankedTiers/Rank_${tier?.replace(/ /g, '_')}.webp`;

            if(session) {
                lastWins = wins;
                lastLosses = losses;
                lastLP = lp;
                lastGames = games;
            }

            displayUserData(labelConfig);
        },
        error: function(error) {
            console.error(error);
            noUser(noBack);
        }
    });
};

function displayUserData(labelConfig, position) {
    if(!labelConfig) return;
    labelConfig?.split('')?.forEach((el, i) => {
        let value, name;
        switch(el) {
            case '1': // Games
                name = "Games";
                value = games;
                break;
            case '2': // Wins
                name = "Wins";
                value = wins;
                break;
            case '3': // Losses
                name = "Losses"
                value = losses;
                break;
            case '4': // W/L
                name = "W/L";
                value = `${wins}/${losses}`;
                break;
            case '5': // WR
                name = "WR";
                value = `${((wins / games || 1) * 100)?.toFixed(1) || 0.0}%`;
                break;
            case '6': // Scores
                name = "Scores";
                value = scores;
                break;
            case '7': // Assists
                name = "Assists";
                value = assists;
                break;
            case '8': // Saves
                name = "Saves";
                value = saves;
                break;
            case '9': // Knockouts
                name = "KOS";
                value = knockouts;
                break;
            case 'A': // MVP
                name = "MVP";
                value = mvp;
                break;
            case 'B': // Fav. Role
                name = "Fav. Role";
                value = forward >= goalie ? 'Forward' : 'Goalie';
                break;
            case 'C': // Fav. Strikers
                name = "Fav. Strikers";
                value = `<span id="favStrikersList">${Object?.keys(favStrikers)[0] ? `<img class="borderColor" src="https://strikr.gg/_next/image?url=https%3A%2F%2Fstatic.strikr.gg%2Ffile%2FStrikr%2Fcharacter%2Fportrait%2FT_UI_Portrait_CloseUp_${Object?.keys(favStrikers)[0]}.png&w=128&q=75">` : ''}${Object?.keys(favStrikers)[1] ? `<img class="borderColor" src="https://strikr.gg/_next/image?url=https%3A%2F%2Fstatic.strikr.gg%2Ffile%2FStrikr%2Fcharacter%2Fportrait%2FT_UI_Portrait_CloseUp_${Object?.keys(favStrikers)[1]}.png&w=128&q=75">` : ''}${Object?.keys(favStrikers)[2] ? `<img class="borderColor" src="https://strikr.gg/_next/image?url=https%3A%2F%2Fstatic.strikr.gg%2Ffile%2FStrikr%2Fcharacter%2Fportrait%2FT_UI_Portrait_CloseUp_${Object?.keys(favStrikers)[2]}.png&w=128&q=75">` : ''}</span><div id="favStrikersDiv">.</div>`;
                break;
            case 'D': // Session W/L
                name = "W/L";
                value = `${wins - lastWins}/${losses - lastLosses}`;
                break;
            case 'E': // Session Gain LP
                name = "Gain LP";
                value = lp - lastLP;
                break;
            case 'F': // Session Games
                name = "Games";
                value = games - lastGames;
                break;
            default: // None
                break;
        };
        
        const statsDiv = document.getElementsByClassName('statInfo')[position || i];
        if(!statsDiv) return;
        if(!name) return statsDiv.style.display = 'none';
        else statsDiv.style.display = 'block';
        statsDiv.getElementsByClassName('statName')[0].innerText = name;
        statsDiv.getElementsByClassName('statValue')[0].innerHTML = value;
    });
    document.getElementById('playerOverlay').style.display = 'inline-block';
};

function showStats(target) {
    document.getElementsByClassName(target.name)[0].style.display = target.checked ? 'flex' : 'none';
};

function changeColor(color, selector, styleElement) {
    document?.querySelectorAll(selector)?.forEach(el => {
        el.style[styleElement] = color;
    });
};

function setFile(target) {
    if(!target?.files?.length) return document.getElementById('playerOverlay').style.backgroundImage = 'none';;
    const file = target?.files[0];
    const reader = new FileReader();
    reader.onloadend = function() {
        document.getElementById('playerOverlay').style.backgroundImage = `url(${reader.result})`;
    };
    if(file)
        reader.readAsDataURL(file);
    else
        document.getElementById('playerOverlay').style.backgroundImage = 'none';
};

function changeTrasparency(value) {
    document.getElementById('playerOverlay').style.opacity = `${100 - value}%`;
};

function changeShape(shapeValue) {
    const element = document.getElementById('playerOverlay');
    if(!element) return;
    element.style.borderRadius = shapeValue == 1 ? '0px' : '10px';
    element.style.transform = `skewX(${shapeValue == 3 ? 10 : shapeValue == 4 ? -10 : 0}deg)`;
    Array.from(document?.getElementsByClassName('label'))?.forEach(el => {
        el.style.transform = `skewX(${shapeValue == 3 ? -10 : shapeValue == 4 ? 10 : 0}deg)`;
    });
};

function applyTheme(themeValue) {
    const colors = {
        "dark-blue": ['#000023', '#6b6889', '#ffffff', '#97baff', '#aaabc7', '#aaabc7', '#ffffff'],
        "dark": ['#1c1c1c', '#333333', '#ffffff', '#aaabc7', '#d6d6d6', '#666666', '#f5f5f5'],
        "light": ['#ffffff', '#999999', '#000000', '#7a7dd1', '#60687b', '#5e5e5e', '#000000']
    }

    changeColor(colors[themeValue][0], '#playerOverlay', 'background-color');
    changeColor(colors[themeValue][1], '.borderColor', 'border-color');
    changeColor(colors[themeValue][2], '#username', 'color');
    changeColor(colors[themeValue][3], '.regionColor', 'color');
    changeColor(colors[themeValue][4], '.rankingColor', 'color');
    changeColor(colors[themeValue][5], '.statName', 'color');
    changeColor(colors[themeValue][6], '.statValue', 'color');

    for(i = 0; i < 7; i++) {
        document.querySelectorAll('#colorsPanel input[type="color"]')[i].value = colors[themeValue][i];
    };
};

function generateUrl() {
    let labelConfig = '';
    document?.querySelectorAll('#labelConf input[type=checkbox]')?.forEach((el, i) => {
        if(el?.checked)
            document?.querySelectorAll(`#labelConf .selectDiv.label-${i+1} select`)?.forEach(el2 => {
                labelConfig += el2?.value;
            });
        else labelConfig += '0000';
    });

    let colors = '';
    document?.querySelectorAll('input[type="color"]')?.forEach(el => {
        colors += `${el?.value || 'fff'},`;
    });
    colors = colors?.replace(/#/g, '').slice(0, -1);

    const shape = document?.getElementById('shapeValue')?.value || 2;
    const transparency = document?.getElementById('transparencyValue')?.value || 0;
    const imageUrl = document.getElementById('playerOverlay')?.style?.backgroundImage || 'none';

    window.open(`overlay.html?username=${username}&region=${usernameRegion}&labelConfig=${labelConfig}&shape=${shape}&transparency=${transparency}&colors=${colors}&imageUrl=${imageUrl}`, '_self');    
};

function setupConfiguration() {
    const labelConfig = queryParams?.get('labelConfig') || '000000000000';
    const shape = queryParams?.get('shape') || 2;
    const transparency = queryParams?.get('transparency') || 0;
    const colors = queryParams?.get('colors')?.split(',');
    const imageUrl = queryParams?.get('imageUrl') || 'none';

    changeShape(shape);
    changeTrasparency(transparency);
    changeColor(`#${colors[0]}`, '#playerOverlay', 'background-color');
    changeColor(`#${colors[1]}`, '.borderColor', 'border-color');
    changeColor(`#${colors[2]}`, '#username', 'color');
    changeColor(`#${colors[3]}`, '.regionColor', 'color');
    changeColor(`#${colors[4]}`, '.rankingColor', 'color');
    changeColor(`#${colors[5]}`, '.statName', 'color');
    changeColor(`#${colors[6]}`, '.statValue', 'color');
    document.getElementById('playerOverlay').style.backgroundImage = `'${imageUrl}'`;
    if(labelConfig?.slice(0, 4) == "0000")
        document.getElementsByClassName('firstLabel')[0].style.display = 'none';
    if(labelConfig?.slice(4, 8) == "0000")
        document.getElementsByClassName('secondLabel')[0].style.display = 'none';
    if(labelConfig?.slice(8, 12) == "0000")
        document.getElementsByClassName('thirdLabel')[0].style.display = 'none';
    refreshData(labelConfig, false, true);

    setInterval(() => {
        games = 0;
        wins = 0;
        losses = 0;
        scores = 0;
        assists = 0;
        saves = 0;
        knockouts = 0;
        mvp = 0;
        forward = 0;
        goalie = 0;
        region = '';
        tier = '';
        favStrikers = {};

        refreshData(labelConfig, true);
    }, 5 * 60 * 1000);
}

if(window?.location?.href?.includes('labelConfig'))
    setupConfiguration();
else
    refreshData('145A6789DEC0');
