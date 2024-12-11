<?php
session_start();
include('db_connection.php'); // Use shared connection logic

try {
    // Ensure user_id is provided and valid
    if (!isset($_GET['user_id']) || !is_numeric($_GET['user_id'])) {
        throw new Exception('Invalid user ID');
    }

    // Get the logged-in user ID from the query parameter
    $logged_id = intval($_GET['user_id']);

    // Prepare a query that joins the drives table with the cars table
    $stmt = $conn->prepare("
        SELECT drives.*, cars.plate AS license_plate
        FROM drives
        JOIN cars ON drives.car_id = cars.id
        WHERE drives.user_id = ?
    ");

    // Bind the user ID parameter to the query
    $stmt->bind_param('i', $logged_id);
    $stmt->execute();

    // Fetch the results as an associative array
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // If records exist, return the data as a JSON response
        $drive = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($drive); // Ensure drive_start and drive_end are in the result
    } else {
        // If no records found, return an empty array
        echo json_encode([]);
    }

} catch (Exception $e) {
    // In case of an error, send a 500 error response
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>