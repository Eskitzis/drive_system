<?php
// Include your database connection
include('db_connection.php');

// Check if all required fields are received
if (isset($_POST['user_id'], $_POST['car_id'], $_POST['km_start'], $_POST['km_end'], $_POST['km_driven'], $_POST['drive_start'], $_POST['drive_end'], $_POST['drive_date'])) {

    // Sanitize input data (basic sanitization)
    $userId = $_POST['user_id'];
    $carId = $_POST['car_id'];
    $kmStart = $_POST['km_start'];
    $kmEnd = $_POST['km_end'];
    $kmDriven = $_POST['km_driven'];
    $driveStart = $_POST['drive_start'];
    $driveEnd = $_POST['drive_end'];
    $driveDate = $_POST['drive_date'];

    // Prepare the SQL query to insert the new drive record
    $stmt = $conn->prepare("INSERT INTO drives (user_id, car_id, km_start, km_end, km_driven, drive_start, drive_end, drive_date) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iiiiiiss", $userId, $carId, $kmStart, $kmEnd, $kmDriven, $driveStart, $driveEnd, $driveDate);

    // Execute the query
    if ($stmt->execute()) {
        echo "Drive added successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the prepared statement
    $stmt->close();
} else {
    echo "Error: Missing required fields!";
}
?>