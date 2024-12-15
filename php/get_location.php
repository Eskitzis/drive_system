<?php
session_start();
include('db_connection.php');
function fetchGraphCalendarEvents($accessToken, $dateDrive)
{
    $startDateTime = $dateDrive . "T00:00:00Z";
    $endDateTime = $dateDrive . "T23:59:59Z";
    $url = "https://graph.microsoft.com/v1.0/me/events?\$select=location,start,end&\$filter=start/dateTime ge '$startDateTime' and end/dateTime le '$endDateTime'";

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
    $dateDrive = $_POST['drive_date'];
    if (!$dateDrive) {
        throw new Exception('Drive date is required');
    }

    $accessToken = $_SESSION['microsoft_access_token'];
    if (!$accessToken) {
        throw new Exception('Access token not available. Please log in.');
    }

    $events = fetchGraphCalendarEvents($accessToken, $dateDrive);

    if (!empty($events['value'])) {
        // Assuming we use the first event for the day
        $eventLocation = $events['value'][0]['location']['displayName'] ?? 'Unknown location';

        echo json_encode([
            'addr_start' => $eventLocation, // Default addr_start
            'addr_end' => $eventLocation    // Default addr_end
        ]);
    } else {
        echo json_encode([
            'addr_start' => '',
            'addr_end' => ''
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>