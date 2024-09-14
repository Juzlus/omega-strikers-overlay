<?php
    function getStatInfo($username) {
        $url = "https://clarioncorp.net/api/lookup/" . $username;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        if (!$data || isset($data['error']))
            return null;

        $daily = isset($data['rankedStats']['lp_history']) ? array_filter($data['rankedStats']['lp_history'], function($el) {
            return $el[0] > strtotime("today");
        }) : null;

        $strikers = isset($data['characterStats']) ? array_merge($data['characterStats']['forwards'], $data['characterStats']['goalies']) : [];
        $strikers = array_reduce($strikers, function($arr, $el) {
            $elName = substr($el['name'], 3);
            $exist = array_filter($arr, function($p) use ($el) { return $p['name'] === $el['display_name']; });

            if ($exist) {
                $exist[0]['games'] += $el['wins'] + $el['losses'];
            } else {
                $arr[] = [
                    'id' => $elName,
                    'name' => $el['display_name'],
                    'games' => $el['wins'] + $el['losses']
                ];
            }
            return $arr;
        }, []);

        usort($strikers, function($a, $b) {
            return $b['games'] - $a['games'];
        });

        $strikers = array_slice($strikers, 0, 3);

        $stats = [
            [
                'code' => "{games}",
                'value' => isset($data['rankedStats']) ? $data['rankedStats']['wins'] + $data['rankedStats']['losses'] : 0
            ],
            [
                'code' => "{wins}",
                'value' => isset($data['rankedStats']['wins']) ? $data['rankedStats']['wins'] : 0
            ],
            [
                'code' => "{losses}",
                'value' => isset($data['rankedStats']['losses']) ? $data['rankedStats']['losses'] : 0
            ],
            [
                'code' => "{wl}",
                'value' => isset($data['rankedStats']) ? $data['rankedStats']['wins'] . '/' . $data['rankedStats']['losses'] : "0/0"
            ],
            [
                'code' => "{wr}",
                'value' => isset($data['rankedStats']['wins']) && $data['rankedStats']['losses'] > 0 
                            ? round($data['rankedStats']['wins'] / $data['rankedStats']['losses'], 2) . "%" 
                            : "NaN%"
            ],
            [
                'code' => "{scores}",
                'value' => isset($data['overallStats']) 
                            ? $data['overallStats']['forwards']['scores'] + $data['overallStats']['goalies']['scores'] 
                            : 0
            ],
            [
                'code' => "{assists}",
                'value' => isset($data['overallStats']) 
                            ? $data['overallStats']['forwards']['assists'] + $data['overallStats']['goalies']['assists'] 
                            : 0
            ],
            [
                'code' => "{saves}",
                'value' => isset($data['overallStats']) 
                            ? $data['overallStats']['forwards']['saves'] + $data['overallStats']['goalies']['saves'] 
                            : 0
            ],
            [
                'code' => "{knockouts}",
                'value' => isset($data['overallStats']) 
                            ? $data['overallStats']['forwards']['knockouts'] + $data['overallStats']['goalies']['knockouts'] 
                            : 0
            ],
            [
                'code' => "{mvp}",
                'value' => isset($data['overallStats']) 
                            ? $data['overallStats']['forwards']['mvp'] + $data['overallStats']['goalies']['mvp'] 
                            : 0
            ],
            [
                'code' => "{fav_role}",
                'value' => isset($data['rankedStats']['role']) ? $data['rankedStats']['role'] : "Flex"
            ],
            [
                'code' => "{fav_strikers}",
                'value' => count($strikers) ? implode(", ", array_column($strikers, 'name')) : ""
            ],
            [
                'code' => "{daily_wl}",
                'value' => count($daily) 
                            ? count(array_filter($daily, function($el) { return $el[1] > 0; })) . '/' . count(array_filter($daily, function($el) { return $el[1] < 0; }))
                            : "0/0"
            ],
            [
                'code' => "{daily_lp}",
                'value' => count($daily) 
                            ? $daily[0][1] - $daily[count($daily) - 1][1] 
                            : 0
            ],
            [
                'code' => "{daily_games}",
                'value' => count($daily) ? count($daily) : 0
            ],
            [
                'code' => "{rating_display}",
                'value' => isset($data['rankedStats']['rating_display']) ? $data['rankedStats']['rating_display'] : "Inactive/Unranked"
            ],
            [
                'code' => "{username}",
                'value' => isset($data['rankedStats']['username']) ? $data['rankedStats']['username'] : "Unknown"
            ],
            [
                'code' => "{rating}",
                'value' => isset($data['rankedStats']['rating']) ? $data['rankedStats']['rating'] : 0
            ],
            [
                'code' => "{mastery_level}",
                'value' => isset($data['rankedStats']['masteryLevel']) ? $data['rankedStats']['masteryLevel'] : 0
            ],
            [
                'code' => "{rank}",
                'value' => isset($data['rankedStats']['rank']) ? $data['rankedStats']['rank'] : 0
            ],
            [
                'code' => "{top_percent}",
                'value' => isset($data['rankedStats']['toppercent']) ? $data['rankedStats']['toppercent'] : 0
            ],
            [
                'code' => "{last_updated}",
                'value' => isset($data['lastUpdated']) ? date("Y-m-d H:i:s", strtotime($data['lastUpdated'])) : date("Y-m-d H:i:s")
            ]
        ];
        return $stats;
    }


    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        $username = isset($_GET['username']) ? $_GET['username'] : null;
        $view = isset($_GET['view']) ? $_GET['view'] : null;
        
        if (!$username) {
            echo "Player not found!";
            return;
        }

        $stats = getStatInfo($username);
        if (!$stats) {
            echo "Player not found!";
            return;
        }

        if ($view !== null) {
            foreach ($stats as $el) {
                if (isset($el['code'])) {
                    $pattern = '/' . preg_quote($el['code'], '/') . '/i';
                    $view = preg_replace($pattern, $el['value'], $view);
                }
            }
        }

        echo $view;
    }
?>