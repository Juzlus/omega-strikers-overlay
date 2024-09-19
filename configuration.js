function changeColor(color, selector, styleElement) {
    document?.querySelectorAll(selector)?.forEach(el => {
        el.style[styleElement] = color;
    });
};

function setFile(target) {
    if(!target?.files?.length) {
        document.getElementById('playerOverlay').style.backgroundImage = 'none';
        setLastConfig();
        return;
    }
    const file = target?.files[0];
    const reader = new FileReader();
    reader.onloadend = function() {
        if (reader.result?.length >= 888888)
            return alert("This image is too large!")

        document.getElementById('playerOverlay').style.backgroundImage = `url(${reader.result})`;
        setLastConfig();
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
    element.style.transform = `translate(-50%, -50%) skewX(${shapeValue == 3 ? 10 : shapeValue == 4 ? -10 : 0}deg)`;
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

    document.querySelectorAll('#colorsPanel input[type="color"]').forEach((el, i) => {
        el.value = themeValue ? colors[themeValue][i] : `#${colorsArr[i]}`;
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

    const width = document.getElementById('playerOverlay')?.offsetWidth || 350;
    const shape = document?.getElementById('shapeValue')?.value || 2;
    const transparency = document?.getElementById('transparencyValue')?.value || 0;
    const imageUrl = document.getElementById('playerOverlay')?.style?.backgroundImage || 'none';

    const url = `overlay.html?username=${username}&labelConfig=${labelConfig}&width=${width}&shape=${shape}&transparency=${transparency}&colors=${colors}&imageUrl=${imageUrl}`;
    console.log(url)
    window.open(url, '_self');    
};

function updateOverlay(labelConfig=null, session={})
{
    const mainDiv = document.querySelector('.statsGrab');
    const configDiv = document.querySelector('.statsLabel');
    const stats = getStatInfo(session);
    let mainDivHTML = '';
    let configDivHTML = '';

    stats?.forEach((el, i) => {
        if(el?.element_id) {
            document.getElementById(el.element_id).innerText = el?.value;
            if (el?.element_id == "tier")
                document.getElementById("tierImg").src = `image/RankedTiers/Rank_${el?.value?.includes("Unranked") ? "Low_Rookie" : el?.value?.replace(/ /g, "_")}.webp`;
        }
        else if(!labelConfig.includes(String.fromCharCode(i + 65)))
            mainDivHTML += `<span class="statInfo grabLabel" draggable="true" labelConfig="${String.fromCharCode(i + 65)}"><h2 class="statName">${el?.name}</h2><h2 class="statValue">${el?.value}</h2></span>`;
    });

    labelConfig?.split('')?.forEach(el => {
        const find = document.querySelector(`[labelConfig=${el}]`)
        if (find)
            find.querySelector('h2.statValue').innerHTML = stats[el.charCodeAt(0) - 65]?.value;
        else
            configDivHTML += `<span class="statInfo grabLabel" draggable="true" labelConfig="${el}"><h2 class="statName">${stats[el.charCodeAt(0) - 65]?.name}</h2><h2 class="statValue">${stats[el.charCodeAt(0) - 65]?.value}</h2></span>`;
    });

    if(mainDiv && mainDivHTML)
        mainDiv.innerHTML = mainDivHTML;

    if(configDiv && configDivHTML)
        configDiv.innerHTML = configDivHTML;
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

    const height = document.querySelector('.statsLabel')?.offsetHeight || 0;
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
    document.getElementById('playerOverlay').style.backgroundImage = imageUrl ? imageUrl?.replace(/ /g, '+') : 'none';

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

function convertViewToText(text) {
    const stats = getStatInfo();
    stats?.filter(el => el?.code).forEach(el => {
        const re = new RegExp(String.raw`${el?.code}`, "gi");
        text = text.replace(re, el?.value);
    });

    return text;
}

function setLastConfig() {
    let labelConfig = '';
    document?.querySelectorAll('#playerOverlay .statInfo')?.forEach((el, i) => {
        labelConfig += el.getAttribute("labelConfig") || '';
    });

    let colors = '';
    document?.querySelectorAll('input[type="color"]')?.forEach(el => {
        colors += `${el?.value || 'fff'},`;
    });
    colors = colors?.replace(/#/g, '').slice(0, -1);

    const lastConfigData = {
        labelConfig: labelConfig,
        colors: colors ? colors.split(',') : null,
        width: document.getElementById('playerOverlay')?.offsetWidth || 350,
        shape: document?.getElementById('shapeValue')?.value || 2,
        transparency: document?.getElementById('transparencyValue')?.value || 0,
        imageUrl: document.getElementById('playerOverlay')?.style?.backgroundImage || 'none'
    }

    localStorage.setItem("lastConfig", JSON.stringify(lastConfigData));
}

let maxLength = 500 - 112 - 7;
function previewFormated(e) {
    document.getElementById('streamelementsFormated').value = convertViewToText(e.value);
    document.getElementById("streamelementsLengthCount").innerText = maxLength - document.getElementById('streamelementsRaw')?.value?.length;
    localStorage.setItem("lastView", e.value); 
}

function removeNewLine(e) {
    if(e.keyCode == 13)
        e.preventDefault();
}

function createLinkStreamElements(e) {
    let data = localStorage.getItem("lastUser");
    if (!data) return;
    data = JSON.parse(data); 

    const raw = document.getElementById("streamelementsRaw").value;
    const fetchURL = `http://juzlus-omega-strikers.infinityfreeapp.com/?view=${raw}&username=\$\{pathescape \$\{1\} | ${data?.rankedStats?.username}\}`;
    const link = `\$\{sender\} \$(customapi. '${fetchURL.replace(/'/g, "\\'")}')`;
    navigator.clipboard.writeText(link);

    if (e.innerText != 'COPIED') {
        e.innerText = 'COPIED';
        setTimeout(() => {
            e.innerText = 'COPY LINK';
        }, 1500);
    }
}

function createStatsBlock() {
    const stats = getStatInfo();
    let newHTML = '<p>Available variables</p>';
    stats?.filter(el => el.code)?.forEach(el => newHTML += `<div>${el.name} - <a style="color: var(--panelInputColor)">${el.code}</a></div>` );
    document.getElementById("streamelementsStatCommand").innerHTML = newHTML;
}

function setupLastView() {
    const view = localStorage.getItem("lastView");
    const sRaw = document.getElementById("streamelementsRaw");
    if(view)
        sRaw.value = view;
    else
        sRaw.value = "{username} {rating} LP ({rating_display}), Today's LP balance: {daily_lp}, Matches: {daily_wl} (W/L)";

    let data = localStorage.getItem("lastUser");
    if (!data) {
        data = JSON.parse(data); 
        maxLength = 500 - 112 - data?.rankedStats?.username?.length;
        sRaw.setAttribute("maxlength", maxLength);
    }

    previewFormated(sRaw);
    createStatsBlock();
}