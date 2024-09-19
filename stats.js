
function getStatInfo(session = {}) {
    data = localStorage.getItem("lastUser");
    if (!data) return;

    data = JSON.parse(data);
    const daily = data?.rankedStats ? data?.rankedStats?.lp_history?.filter(el => el[0] > new Date().setHours(0, 0, 0)) : null;
    const strikers = data?.characterStats ? [...data?.characterStats?.forwards, ...data?.characterStats?.goalies]
        ?.map(el => ({ id: el.name.slice(3), name: el.display_name, games: el.wins + el.losses }) )
        ?.reduce((arr, el) => {
            const exist = arr.find(p => p.name === el.name);
            if (exist)
                exist.games += el.games;
            else
                arr.push({ ...el });
            return arr;
        }, [])
        ?.sort((a, b) => b.games - a.games).slice(0, 3) : null;

    return [
        {
            name: "Games",
            code: "{games}",
            value: `${data?.rankedStats ? data?.rankedStats?.wins + data?.rankedStats?.losses : 0}`
        },
        {
            name: "Wins",
            code: "{wins}",
            value: `${data?.rankedStats?.wins || 0}`
        },
        {
            name: "Losses",
            code: "{losses}",
            value: `${data?.rankedStats?.losses || 0}`
        },
        {
            name: "W/L",
            code: "{wl}",
            value: `${data?.rankedStats ? `${data?.rankedStats?.wins}/${data?.rankedStats?.losses}` : "0/0"}`
        },
        {
            name: "WR",
            code: "{wr}",
            value: `${data?.rankedStats ? ((data?.rankedStats?.wins/data?.rankedStats?.losses).toFixed(2)) : "NaN" }%`
        },
        {
            name: "Scores",
            code: "{scores}",
            value: `${data?.overallStats ? data?.overallStats?.forwards?.scores + data?.overallStats?.goalies?.scores : 0}`
        },
        {
            name: "Assists",
            code: "{assists}",
            value: `${data?.overallStats ? data?.overallStats?.forwards?.assists + data?.overallStats?.goalies?.assists : 0}`
        },
        {
            name: "Saves",
            code: "{saves}",
            value: `${data?.overallStats ? data?.overallStats?.forwards?.saves + data?.overallStats?.goalies?.saves : 0}`
        },
        {
            name: "Knockouts",
            code: "{knockouts}",
            value: `${data?.overallStats ? data?.overallStats?.forwards?.knockouts + data?.overallStats?.goalies?.knockouts : 0}`
        },
        {
            name: "MVP",
            code: "{mvp}",
            value: `${data?.overallStats ? data?.overallStats?.forwards?.mvp + data?.overallStats?.goalies?.mvp : 0}`
        },
        {
            name: "Fav. Role",
            code: "{fav_role}",
            value: `${data?.rankedStats?.role || "Flex"}`
        },
        {
            name: "Fav. Strikers",
            code: "{fav_strikers}",
            value: `${strikers?.length ? strikers?.map(el => el.name)?.join(", ") : ""}`
        },
        {
            name: "Fav. Strikers",
            value: `<span id="favStrikersList">${strikers?.map(el => el.id)?.length >= 1 ? `<img class="borderColor" src="https://clarioncorp.net/_next/image?url=%2Fi%2Fcharacter%2Fportrait%2FT_UI_Portrait_CloseUp_${strikers?.map(el => el.id)[0]}.png&w=128&q=75">` : ''}${strikers?.map(el => el.id)?.length >= 2 ? `<img class="borderColor" src="https://clarioncorp.net/_next/image?url=%2Fi%2Fcharacter%2Fportrait%2FT_UI_Portrait_CloseUp_${strikers?.map(el => el.id)[1]}.png&w=128&q=75">` : ''}${strikers?.map(el => el.id)?.length >= 3 ? `<img class="borderColor" src="https://clarioncorp.net/_next/image?url=%2Fi%2Fcharacter%2Fportrait%2FT_UI_Portrait_CloseUp_${strikers?.map(el => el.id)[2]}.png&w=128&q=75">` : ''}</span><div id="favStrikersDiv">.</div>`.replace("MagicalPlaymaker", "MagicalPlaymaker_Default")
        },
        {
            name: "Session W/L",
            value: `${session?.wins ? `${data?.rankedStats?.wins - session?.wins}/${data?.rankedStats?.losses - session?.losses}` : "0/0"}`
        },
        {
            name: "Session Gain LP",
            value: `${data?.rankedStats?.lp_history[0][1] - session?.lp || 0}`
        },
        {
            name: "Session Games",
            value: `${session?.wins ? (data?.rankedStats?.wins - session?.wins) + (data?.rankedStats?.losses - session?.losses) : 0}`
        },
        {
            name: "Daily W/L",
            code: "{daily_wl}",
            value: `${daily?.length ? `${daily.filter((el, i, arr) => (i < arr.length - 1 && arr[i + 1][1] > el[1] ))?.length}/${daily.filter((el, i, arr) => (i > 0 && arr[i - 1][1] < el[1] ))?.length}` : "0/0"}`
        },
        {
            name: "Daily Gain LP",
            code: "{daily_lp}",
            value: `${daily?.length ? daily[0][1] - daily[daily.length - 1][1] : 0}`
        },
        {
            name: "Daily Games",
            code: "{daily_games}",
            value: `${daily?.length ? daily.filter((el, i, arr) => (i < arr.length - 1 && arr[i + 1][1] > el[1] ))?.length + daily.filter((el, i, arr) => (i > 0 && arr[i - 1][1] < el[1] ))?.length : 0}`
        },
        {
            name: "Rating Display",
            code: "{rating_display}",
            element_id: "tier",
            value: `${data?.rankedStats?.rating_display || "Inactive/Unranked"}`
        },
        {
            name: "Username",
            code: "{username}",
            element_id: "username",
            value: `${data?.rankedStats?.username || "Unknown"}`
        },
        {
            name: "Rating",
            code: "{rating}",
            element_id: "rating",
            value: `${data?.rankedStats?.rating || 0}`
        },
        {
            name: "Mastery Level",
            code: "{mastery_level}",
            value: `${data?.rankedStats?.masteryLevel || 0}`
        },
        {
            name: "Rank",
            code: "{rank}",
            element_id: "ranking",
            value: `${data?.rankedStats?.rank || 0}`
        },
        {
            name: "Top Percent",
            code: "{top_percent}",
            element_id: "topPercent",
            value: `${data?.rankedStats?.toppercent || 0}`
        },
        {
            name: "Last Updated",
            code: "{last_updated}",
            value: `${data?.lastUpdated ? new Date(data?.lastUpdated).toISOString().slice(0, 19).replace("T", " ") : new Date().toUTCString().slice(0, 19).replace("T", " ")} UTC`
        }
    ]
}