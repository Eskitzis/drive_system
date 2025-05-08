<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css?family=Asap" rel="stylesheet">
    <link rel="stylesheet" href="css/login.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="shortcut icon" href="assets/logo.png" type="image/x-icon">
    <title>Login - Drive</title>
</head>

<body>
    <form class="login" id="loginForm">
        <input type="email" placeholder="E-Mail*" name="mail" id="mail" required autofocus>
        <input type="password" placeholder="Passwort*" name="pass" id="pass" required>

        <!-- Display error message if login failed -->
        <p class="error-message" id="error-message" style="display: none;"></p>

        <a href="reset_login.html">Passwort / E-Mail Zurücksetzen.</a>
        <button type="submit">Login</button>
    </form>

    <a href="https://weblogy.eu/" target="_blank">Powered by Weblogy Antonios Eskitzis</a>

    <script>
        $(document).ready(function () {
            $('#loginForm').on('submit', function (event) {
                event.preventDefault();  // Prevent the form from submitting normally

                // Get form data
                var formData = {
                    mail: $('#mail').val(),
                    pass: $('#pass').val()
                };

                // Send data using AJAX
                $.ajax({
                    type: 'POST',
                    url: 'login_backend.php',
                    data: formData,
                    dataType: 'json',
                    success: function (response) {
                        if (response.success) {
                            // Redirect on successful login
                            window.location.href = 'dashboard.php';
                        } else {
                            // Show error message if login fails
                            $('#error-message').text(response.error).show();
                        }
                    },
                    error: function () {
                        $('#error-message').text("An error occurred. Please try again.").show();
                    }
                });
            });
        });
    </script>
</body>

</html>