function changeColor(color, selector, styleElement) {
    document?.querySelectorAll(selector)?.forEach(el => {
        el.style[styleElement] = color;
    });
};

function setFile(target) {
    if(!target?.files?.length)
    return document.getElementById('playerOverlay').style.backgroundImage = 'none';
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

function changeShape(shapeValue) {
    const element = document.getElementById('playerOverlay');
    if(!element) return;
    element.style.borderRadius = shapeValue == 1 ? '0px' : '10px';
    element.style.transform = `skewX(${shapeValue == 3 ? 10 : shapeValue == 4 ? -10 : 0}deg)`;
    Array.from(document?.getElementsByClassName('label'))?.forEach(el => {
        el.style.transform = `skewX(${shapeValue == 3 ? -10 : shapeValue == 4 ? 10 : 0}deg)`;
    });
};

function changeTrasparency(value) {
    document.getElementById('playerOverlay').style.opacity = `${100 - value}%`;
};

function applyTheme(themeValue, colorsArr) {
    const colors = {
        "dark-blue": ['#000023', '#6b6889', '#ffffff', '#97baff', '#aaabc7', '#aaabc7', '#ffffff'],
        "dark": ['#1c1c1c', '#333333', '#ffffff', '#aaabc7', '#d6d6d6', '#666666', '#f5f5f5'],
        "light": ['#ffffff', '#999999', '#000000', '#7a7dd1', '#60687b', '#5e5e5e', '#000000']
    }

    changeColor(themeValue ? colors[themeValue][0] : `#${colorsArr[0]}`, '#playerOverlay', 'background-color');
    changeColor(themeValue ? colors[themeValue][1] : `#${colorsArr[1]}`, '.borderColor', 'border-color');
    changeColor(themeValue ? colors[themeValue][2] : `#${colorsArr[2]}`, '#username', 'color');
    changeColor(themeValue ? colors[themeValue][3] : `#${colorsArr[3]}`, '.regionColor', 'color');
    changeColor(themeValue ? colors[themeValue][4] : `#${colorsArr[4]}`, '.rankingColor', 'color');
    changeColor(themeValue ? colors[themeValue][5] : `#${colorsArr[5]}`, '.statName', 'color');
    changeColor(themeValue ? colors[themeValue][6] : `#${colorsArr[6]}`, '.statValue', 'color');

    document.querySelectorAll('#colorsPanel input[type="color"]').forEach(el => {
        el.value = colors[themeValue][i];
    });

};

function generateUrl() {
    let data = localStorage.getItem("lastUser");
    if (!data)
        return alert("Player not found!");
    data = JSON.parse(data);
    username = data?.rankedStats?.username;

    let labelConfig = '';
    document?.querySelectorAll('#playerOverlay .statInfo')?.forEach((el, i) => {
        labelConfig += el.getAttribute("labelConfig") || '';
    });

    let colors = '';
    document?.querySelectorAll('input[type="color"]')?.forEach(el => {
        colors += `${el?.value || 'fff'},`;
    });
    colors = colors?.replace(/#/g, '').slice(0, -1);

    const width = document.getElementById('playerOverlay')?.offsetWidth;
    const shape = document?.getElementById('shapeValue')?.value || 2;
    const transparency = document?.getElementById('transparencyValue')?.value || 0;
    const imageUrl = document.getElementById('playerOverlay')?.style?.backgroundImage || 'none';

    window.open(`overlay.html?username=${username}&labelConfig=${labelConfig}&width=${width}&shape=${shape}&transparency=${transparency}&colors=${colors}&imageUrl=${imageUrl}`, '_self');    
};

function updateOverlay(labelConfig=null, session={})
{
    const mainDiv = document.querySelector(labelConfig ? '.statsLabel' : '.statsGrab');
    const stats = getStatInfo(session);
    let mainDivHTML = '';

    stats?.forEach((el, i) => {
        if(el?.element_id) {
            document.getElementById(el.element_id).innerText = el?.value;
            if (el?.element_id == "tier")
                document.getElementById("tierImg").src = `image/RankedTiers/Rank_${el?.value?.includes("Unranked") ? "Low_Rookie" : el?.value?.replace(/ /g, "_")}.webp`;
        }
        else if(!labelConfig)
            mainDivHTML += `<span class="statInfo grabLabel" draggable="true" labelConfig="${String.fromCharCode(i + 65)}"><h2 class="statName">${el?.name}</h2><h2 class="statValue">${el?.value}</h2></span>`;
    });

    labelConfig?.split('')?.forEach(el => {
        const find = document.querySelector(`[labelConfig=${el}]`)
        if (find)
            find.querySelector('h2.statValue').innerHTML = stats[el.charCodeAt(0) - 65]?.value;
        else
            mainDivHTML += `<span class="statInfo grabLabel" draggable="true" labelConfig="${el}"><h2 class="statName">${stats[el.charCodeAt(0) - 65]?.name}</h2><h2 class="statValue">${stats[el.charCodeAt(0) - 65]?.value}</h2></span>`;
    });

    if(mainDiv && mainDivHTML)
        mainDiv.innerHTML = mainDivHTML;
}

async function setupConfiguration() {
    const queryParams = new URLSearchParams(window?.location?.search);
    
    const username = queryParams?.get('username');
    const labelConfig = queryParams?.get('labelConfig');
    
    const width = queryParams?.get('width');
    const shape = queryParams?.get('shape');
    const transparency = queryParams?.get('transparency');
    const colors = queryParams?.get('colors')?.split(',');
    const imageUrl = queryParams?.get('imageUrl');

    const session = {};

    const height = document.getElementById('playerOverlay')?.offsetHeight || 0;
    const lines = document.querySelectorAll(".labelLine");
    const rows = height / 100 - 1;
    lines?.forEach((el, i) => {
      if (i <= rows)
        el.style.display = 'block';
      else
        el.style.display = 'none';
    });

    await $.ajax({ url: `https://clarioncorp.net/api/lookup/${username}`, method: 'GET',
        success: function(response) {
            localStorage.setItem("lastUser", JSON.stringify(response));
        },
        error: function(error) {
            console.error(error);
            alert("Player not found!");
            return window.open("index.html", "_self");
        }
    });

    console.log(new Date(), "UPDATE")
    document.getElementById('playerOverlay').style.width = `${width}px`;
    changeShape(shape || 2);
    changeTrasparency(transparency || 0);
    updateOverlay(labelConfig);
    if (colors?.length) applyTheme(null, colors);
    document.getElementById('playerOverlay').style.backgroundImage = `'${imageUrl || 'none'}'`;

    setInterval(async () => {
        await $.ajax({ url: `https://clarioncorp.net/api/lookup/${username}`, method: 'GET',
            success: function(response) {
                localStorage.setItem("lastUser", JSON.stringify(response));
            },
            error: function(error) {
                console.error(error);
                alert("Player not found!");
                return window.open("index.html", "_self");
            }
        });
        
        if(!session?.wins) {
            let data = localStorage.getItem("lastUser");
            if (data) {
                data = JSON.parse(data);
                session.wins = data?.rankedStats?.wins;
                session.losses = data?.rankedStats?.losses;
                session.lp = data?.rankedStats?.lp_history[0][1];
            }
        }

        console.log(new Date(), "UPDATE")
        updateOverlay(labelConfig, session);
        if (colors?.length) applyTheme(null, colors);
    }, 5 * 60 * 1000);
}

async function convertViewToText(update=false) {
    const queryParams = new URLSearchParams(window?.location?.search);
    const username = queryParams?.get('username');
    let view = queryParams?.get('view');

    if (update)
        await $.ajax({ url: `https://clarioncorp.net/api/lookup/${username}`, method: 'GET',
            success: function(response) {
                localStorage.setItem("lastUser", JSON.stringify(response));
            },
            error: function(error) {
                console.error(error);
                return document.body.innerText = 'Player not found!';
            }
        });

    const stats = getStatInfo();
    stats?.filter(el => el?.code).forEach(el => {
        const re = new RegExp(String.raw`${el?.code}`, "gi");
        view = view.replace(re, el?.value);
    });

    document.body.innerText = view;
}