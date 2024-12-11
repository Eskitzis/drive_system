<?php
session_start();
include('db_connection.php'); // Use shared connection logic

try {
    $logged_id = intval($_GET['user_id']);
    $stmt = $conn->prepare("
            SELECT *
            FROM drives
            WHERE user_id = ?
        ");
    $stmt->bind_param('i', $logged_id); // Use parameterized queries
    $stmt->execute();
    $result = $stmt->get_result();
    $drive = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($drive);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>