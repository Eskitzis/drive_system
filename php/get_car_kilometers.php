<?php
// Include your database connection here
include('db_connection.php');

// Check if the car_id is provided via GET
if (isset($_GET['car_id'])) {
    $car_id = $_GET['car_id'];

    // Prepare the SQL query to fetch the entry with the latest drive date and highest km_end for that day
    $stmt = $conn->prepare("SELECT km_end FROM drives WHERE car_id = ? ORDER BY STR_TO_DATE(drive_date, '%Y-%m-%d') DESC, km_end DESC LIMIT 1");
    $stmt->bind_param("i", $car_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if there is a result
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $km_driven = $row['km_end'];
        // Return the result as JSON
        echo json_encode(['kilometers' => $km_driven]);
    } else {
        // Return a message if no kilometers are found
        echo json_encode(['kilometers' => 'No kilometers found.']);
    }
} else {
    // If car_id is not set
    echo json_encode(['kilometers' => 'Invalid car ID.']);
}
?>