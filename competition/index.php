<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=1">
	<meta name="apple-mobile-web-app-capable" content="yes"
	/>
	<title>X-Framework Competition: Team Submission</title>
	
	
	

	<link rel="stylesheet" href="../styles/xf.css">

</head>
	<body>
		<?php
			if ($_POST['ok']) {
				$myFile = "members.txt";
				$br = "\n\n-------------------------\n";

				$fh = fopen($myFile, 'a') or print "Can't open file";
				if (fwrite($fh, $br . $_POST['members'])) {
					print "Thank you. You will receive an email with your repository credentials as soon as we will receive all the submissions.";
				}
				fclose($fh);
			}

		?>
		<br/>
		<form method="post">
			<input type="text" name="members" />
			<input type="submit" name="ok" value="Submit" />
		</form>
	</body>
</html>
