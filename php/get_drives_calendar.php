<?php
session_start();
include('db_connection.php');

/**
 * Fetch all events from Microsoft Graph API with proper pagination and time range filtering.
 */
function fetchAllGraphCalendarEvents($accessToken)
{
    $startDateTime = urlencode(date('c', strtotime('-2 years'))); // 2 years in the past
    $endDateTime = urlencode(date('c', strtotime('+2 years')));  // 2 years in the future

    $url = "https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=$startDateTime&endDateTime=$endDateTime&\$select=subject,body,bodyPreview,organizer,attendees,start,end,location";
    $allEvents = [];

    do {
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

        $data = json_decode($response, true);

        // Merge current page of events into allEvents array
        $allEvents = array_merge($allEvents, $data['value']);

        // Check for pagination link
        $url = $data['@odata.nextLink'] ?? null;
    } while ($url);

    return $allEvents;
}

try {
    if (!isset($_GET['user_id']) || !is_numeric($_GET['user_id'])) {
        throw new Exception('Invalid user ID');
    }

    $logged_id = intval($_GET['user_id']);

    // Fetch drives from the database
    $stmt = $conn->prepare("SELECT drives.*, cars.plate AS license_plate FROM drives JOIN cars ON drives.car_id = cars.id WHERE drives.user_id = ?");
    $stmt->bind_param('i', $logged_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $drives = [];
    if ($result->num_rows > 0) {
        $drives = $result->fetch_all(MYSQLI_ASSOC);
    }

    // Fetch Outlook events from Microsoft Graph
    $accessToken = $_SESSION['microsoft_access_token'];
    if (!$accessToken) {
        throw new Exception('Access token not available. Please log in.');
    }

    $outlookEvents = fetchAllGraphCalendarEvents($accessToken);

    // Transform database events to match FullCalendar format
    $dbEvents = array_map(function ($drive) {
        return [
            'id' => $drive['id'],
            'title' => $drive['license_plate'],
            'start' => $drive['drive_date'],
            'end' => $drive['drive_date'], // Assuming one-day events
            'color' => '#f45b69',
            'textColor' => 'white',
            'description' => "{$drive['drive_start']} nach {$drive['drive_end']}",
            'kmDriven' => $drive['km_driven'],
            'kmStart' => $drive['km_start'],
            'kmEnd' => $drive['km_end'],
            'driveDate' => $drive['drive_date'],
        ];
    }, $drives);

    // Transform Outlook events to match FullCalendar format
    $graphEvents = array_map(function ($event) {
        return [
            'id' => $event['id'],
            'title' => $event['subject'],
            'start' => $event['start']['dateTime'],
            'end' => $event['end']['dateTime'],
            'location' => $event['location']['displayName'] ?? null,
            'description' => $event['bodyPreview'],
        ];
    }, $outlookEvents);

    // Merge both sources
    $mergedEvents = array_merge($dbEvents, $graphEvents);

    // Output merged events in JSON format
    echo json_encode($mergedEvents);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>