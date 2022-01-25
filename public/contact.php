<?php

require_once("./inc/aws.phar");
require_once("./inc/aws-mailer.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $toName = 'Miko.art';
    $toEmail = 'hello@miko.art';
    $fromName = $_POST['name'];
    $fromEmail = $_POST['email'];
    $message = $_POST['message'];

    SESMailer::sendMail(array(
        "to" => "\"$toName\" <$toEmail>",
        "from" => "\"$fromName\" <$fromEmail>",
        "replyTo" => $fromEmail,
        "subject" => "General inquiry",
        "message" => $message
    ));
}