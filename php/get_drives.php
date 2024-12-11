<?php
// Include the database connection
include 'db_connection.php'; // Ensure this path is correct

// Check if car_id is provided in the URL query parameters
if (isset($_GET['car_id'])) {
    $car_id = (int) $_GET['car_id']; // Sanitize the car_id to an integer

    // Query to get all drives for the selected car and fetch the plate from cars
    $query = "
        SELECT 
            drives.drive_date, 
            drives.km_start, 
            drives.km_end, 
            cars.plate
        FROM 
            drives
        JOIN 
            cars ON drives.car_id = cars.id
        WHERE 
            drives.car_id = ? ORDER BY STR_TO_DATE(drives.drive_date, '%Y-%m-%d') DESC, drives.km_end DESC"; // Using prepared statements for security

    // Prepare the query
    if ($stmt = $conn->prepare($query)) {
        // Bind the car_id parameter
        $stmt->bind_param("i", $car_id);

        // Execute the query
        $stmt->execute();

        // Bind the result to variables
        $stmt->bind_result($drive_date, $km_start, $km_end, $plate);

        // Fetch the results and store them in an array
        $drives = [];
        while ($stmt->fetch()) {
            $drives[] = [
                'drive_date' => $drive_date,
                'km_start' => $km_start,
                'km_end' => $km_end,
                'plate' => $plate
            ];
        }

        // Close the statement
        $stmt->close();

        // Return the result as JSON
        echo json_encode($drives);
    } else {
        echo json_encode(['error' => 'Failed to prepare statement']);
    }
} else {
    // Return error if car_id is not provided
    echo json_encode(['error' => 'Car ID is required']);
}

// Close the database connection
$conn->close();
?>