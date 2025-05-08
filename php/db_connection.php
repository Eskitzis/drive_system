<?php
$servername = "v2202208181594198845.nicesrv.de";  // Default for XAMPP
$username = "eskitzis";  // Default username for XAMPP
$password = "Makaroni_1!";  // Default password for XAMPP (blank)
$database = "drive_db";  // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    //echo "Connection successful!";
}
?>