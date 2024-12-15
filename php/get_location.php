<?php
session_start();
include('db_connection.php');
error_reporting(E_ALL);
ini_set('display_errors', 1);

function fetchGraphCalendarEvents($accessToken)
{
    // Microsoft Graph API URL for fetching events
    $url = "https://graph.microsoft.com/v1.0/me/events?\$select=subject,body,bodyPreview,organizer,attendees,start,end,location";

    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $accessToken",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        throw new Exception('Request Error: ' . curl_error($ch));
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Microsoft Graph API returned status code $httpCode: $response");
    }

    return json_decode($response, true);
}

try {
    $accessToken = $_SESSION['microsoft_access_token'];
    if (!$accessToken) {
        throw new Exception('Access token not available. Please log in.');
    }

    $events = fetchGraphCalendarEvents($accessToken);

    echo json_encode([
        'events' => $events['value'] ?? []
    ]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>