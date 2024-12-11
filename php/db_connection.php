<?php
$servername = "localhost";  // Default for XAMPP
$username = "root";  // Default username for XAMPP
$password = "";  // Default password for XAMPP (blank)
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