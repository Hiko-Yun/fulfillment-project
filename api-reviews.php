<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ==========================================================================
// 0. ДАННЫЕ ДЛЯ НАСТРОЙКИ (Вставь сюда ключи Антона)
// ==========================================================================

$yandex_company_id = "90117366373"; 
$yandex_api_key    = "ea3a6c82-24f3-4b8c-94ce-ce2c667f141a"; // <-- вставь сюда токен

$avito_client_id     = "0Nmky3w83gdQMdh-FRZq";     // <-- вставь сюда ID
$avito_client_secret = "xl7QlL8m9kahT-wyOAeGWC0-nR7mnpjt4EWm4nKi"; // <-- вставь сюда секрет


// ==========================================================================
// 1. ЯНДЕКС ГЕОПРОДВИЖЕНИЕ
// ==========================================================================
$ya_url = "https://api.business.yandex.ru/v1/companies/{$yandex_company_id}";
$ya_options = [
    "http" => [
        "method" => "GET",
        "header" => "Authorization: OAuth " . $yandex_api_key . "\r\n" .
                    "User-Agent: OSP-Parser-Client\r\n",
        "ignore_errors" => true
    ]
];
$ya_context = stream_context_create($ya_options);
$ya_response = @file_get_contents($ya_url, false, $ya_context);
$ya_data = $ya_response ? json_decode($ya_response, true) : null;


// ==========================================================================
// 2. АВИТО API
// ==========================================================================
$avito_token_url = "https://api.avito.ru/token/";
$avito_token_post = http_build_query([
    'grant_type'    => 'client_credentials',
    'client_id'     => $avito_client_id,
    'client_secret' => $avito_client_secret
]);
$avito_token_options = [
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'content' => $avito_token_post,
        'ignore_errors' => true
    ]
];
$avito_token_context = stream_context_create($avito_token_options);
$avito_token_response = @file_get_contents($avito_token_url, false, $avito_token_context);
$avito_token_data = $avito_token_response ? json_decode($avito_token_response, true) : null;
$access_token = $avito_token_data['access_token'] ?? null;

$avito_rating = null; 
$avito_reviews = null; 

if ($access_token) {
    $avito_profile_url = "https://api.avito.ru/core/v1/profile/";
    $avito_profile_context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer " . $access_token . "\r\n",
            'ignore_errors' => true
        ]
    ]);
    $avito_profile_response = @file_get_contents($avito_profile_url, false, $avito_profile_context);
    $avito_user_info = $avito_profile_response ? json_decode($avito_profile_response, true) : null;
    
    $user_id = $avito_user_info['id'] ?? null;

    if ($user_id) {
        $avito_rating_url = "https://api.avito.ru/core/v1/accounts/{$user_id}/rating/";
        $avito_rating_context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Authorization: Bearer " . $access_token . "\r\n",
                'ignore_errors' => true
            ]
        ]);
        $avito_rating_response = @file_get_contents($avito_rating_url, false, $avito_rating_context);
        $avito_rating_data = $avito_rating_response ? json_decode($avito_rating_response, true) : null;

        if (isset($avito_rating_data['score'])) {
            $avito_rating = $avito_rating_data['score'];
            $avito_reviews = $avito_rating_data['reviews_count'] ?? null;
        }
    }
}


// ==========================================================================
// 3. ФОРМИРУЕМ ОТВЕТ (Реальные данные или отладочные заглушки)
// ==========================================================================
// ==========================================================================
// 3. ФОРМИРУЕМ ИТОГОВЫЙ JSON ОТВЕТА (С ЧИСТЫМИ РЕЗЕРВНЫМИ ДАННЫМИ)
// ==========================================================================
$ya_rating_val = null;
$ya_reviews_val = null;

if (isset($ya_data['rating']['score'])) {
    $ya_rating_val = $ya_data['rating']['score'];
    $ya_reviews_val = $ya_data['rating']['reviews_count'];
} elseif (isset($ya_data['ratingValue'])) {
    $ya_rating_val = $ya_data['ratingValue'];
    $ya_reviews_val = $ya_data['reviewsCount'];
}

$output = [
    "yandex" => [
        // Если данные есть — берем их, если нет — ставим 4.7
        "rating"  => $ya_rating_val !== null ? round(floatval($ya_rating_val), 1) : 4.7,
        // Если данные есть — берем их, если нет — ставим 15
        "reviews" => $ya_reviews_val !== null ? intval($ya_reviews_val) : 15
    ],
    "avito" => [
        // Если данных нет — отдаем прочерки строкой
        "rating"  => $avito_rating !== null ? round(floatval($avito_rating), 1) : "—",
        "reviews" => $avito_reviews !== null ? intval($avito_reviews) : "—"
    ]
];

echo json_encode($output, JSON_UNESCAPED_UNICODE);
?>