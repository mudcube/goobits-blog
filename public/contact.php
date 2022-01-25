<?php

require_once("./inc/aws.phar");
require_once("./inc/aws-mailer.php");

$toName = 'Miko.art';
$toEmail = 'hello@miko.art';
$fromName = 'Muffin';
$fromEmail = 'muffin@muffin.com';
$message = 'Hello world!';

SESMailer::sendMail(array(
    "to" => "\"$toName\" <$toEmail>",
    "from" => "\"$fromName\" <$fromEmail>",
    "replyTo" => $fromEmail,
    "subject" => "Your Sketchpad for Education Download",
    "message" => $message
));

