<?php

use Aws\Ses\SesClient;

/*
	------------------------------------------------
	SESMailer
	------------------------------------------------
	$ses = SESMailer::sendMail(array(
		'to'=> "'Sketch.IO' <hello@sketch.io>",
		'from'=> "'Muffin' <hello@sketch.io>",
		'replyTo'=> "'Muffin' <muffin@muffin.com>",
		'subject'=> 'Hello world!',
		'message'=> '<h1>Hello world!</h1>,
		'files'=> array(
			array(
				'filepath'=> $file['tmp_name'],
				'name'=> 'myfile.jpeg',
				'mime'=> 'image/jpeg'
			)
		)
	));
*/

class SESMailer {
	const version = "1.0";
	const AWS_KEY = "AKIATOEGPMJXV6IWUAPD"; // miko.art-mailer
	const AWS_SEC = "/r0tcAngZb/aWDQttWkrLEjMbTIgTvA9YxIAUHFb";
	const AWS_REGION = "us-east-1";
	const MAX_ATTACHMENT_NAME_LEN = 60;

	/**
	 * Usage
	 * use $res->success to check if it was successful
	 * use $res->id to check later with Amazon for further processing
	 * use $res->error to look for error text if the task was not successful
	 */
	public static function sendMail($opts) {
		try {
			$to = self::GetParam($opts, 'to', true);
			$from = self::GetParam($opts, 'from', true);
			$replyTo = self::GetParam($opts, 'replyTo');
			$cc = self::GetParam($opts, 'cc');
			$bcc = self::GetParam($opts, 'bcc');
			$subject = self::GetParam($opts, 'subject', true);
			$body = self::GetParam($opts, 'message', true);
			$files = self::GetParam($opts, 'files');

			$res = new SESResultHelper();

			$client = SesClient::factory(array(
				'key'=> self::AWS_KEY,
				'secret'=> self::AWS_SEC,
				'region'=> self::AWS_REGION
			));

			// build the message
			$msg  = self::AddAddress('To', $to, true);
			$msg .= self::AddAddress('From', $from, true);
			$msg .= self::AddAddress('Reply-To', $replyTo);
			$msg .= self::AddAddress('CC', $cc);
			$msg .= self::AddAddress('BCC', $bcc);

			// in case you have funny characters in the subject
			$subject = mb_encode_mimeheader($subject, 'UTF-8');
			$msg .= "Subject: $subject\n";
			$msg .= "MIME-Version: 1.0\n";
			$msg .= "Content-Type: multipart/alternative;\n";
			$boundary = uniqid("_Part_".time(), true); //random unique string
			$msg .= " boundary=\"$boundary\"\n";
			$msg .= "\n";

			// now the actual message
			$msg .= "--$boundary\n";

			// first, the plain text
			$msg .= "Content-Type: text/plain; charset=utf-8\n";
			$msg .= "Content-Transfer-Encoding: 7bit\n";
			$msg .= "\n";
			$msg .= strip_tags($body);
			$msg .= "\n";

			// now, the html text
			$msg .= "--$boundary\n";
			$msg .= "Content-Type: text/html; charset=utf-8\n";
			$msg .= "Content-Transfer-Encoding: 7bit\n";
			$msg .= "\n";
			$msg .= $body;
			$msg .= "\n";

			// add attachments
			if (is_array($files)) {
				$count = count($files);
				foreach ($files as $idx => $file) {
					if ($idx !== 0) $msg .= "\n";
					$msg .= "--$boundary\n";
					$msg .= "Content-Transfer-Encoding: base64\n";
					$clean_filename = mb_substr($file["name"], 0, self::MAX_ATTACHMENT_NAME_LEN);
					$msg .= "Content-Type: {$file['mime']}; name=$clean_filename;\n";
					$msg .= "Content-Disposition: attachment; filename=$clean_filename;\n";
					$msg .= "\n";
					$msg .= base64_encode(file_get_contents($file['filepath']));
					if (($idx + 1) === $count) $msg .= "==\n";
					$msg .= "--$boundary";
				}
				// close email
				$msg .= "--\n";
			}

			// now send the email out
			$ses_result = $client->sendRawEmail(
				array(
					'RawMessage'=> array(
						'Data'=> base64_encode($msg)
					)
				),
				array(
					'Source'=> $from,
					'Destinations'=> $to
				)
			);
			if ($ses_result) {
				$res->id = $ses_result->get('MessageId');
			} else {
				$res->success = false;
				$res->error = "Amazon SES did not return a MessageId";
			}
		} catch (Exception $e) {
			$res->success = false;
			$res->error = $e->getMessage();
		}
		return $res;
	}

	private static function GetParam($opts, $param, $required = false) {
		$value = isset($opts[$param]) ? $opts[$param] : null;
		if ($required && empty($value)) {
			throw new Exception('"' . $param . '" parameter is required.');
		} else {
			return $value;
		}
	}
	
	private static function AddAddress($kind, $address, $required = false) {
		if ($address) {
			if (is_array($address)) {
				$address = rtrim(implode(',', $address), ',');
			}
			return $kind . ": $address\n";
		} else if ($required) {
			throw new Exception($kind . ' address is required.');
		} else {
			return "";
		}
	}
}

class SESResultHelper {
	public $success = true;
	public $error = "";
	public $id = "";
}