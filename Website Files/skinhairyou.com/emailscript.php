<?php 
if(isset($_POST['submit'])){
    $to = "branabreo@gmail.com"; // this is your Email address
    $from = "appointment@skinhairyou.com"; // this is the sender's Email address
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $emailid = $_POST['email'];
    $phone = $_POST['telephone'];
    
    $subject = "Form submission";
    $message = $first_name . "  " . $last_name .", Ph Num:".$phone.", Email ID ".$emailid. " Wrote the following:" . "\n\n" . $_POST['comments'];
    $headers = "From:" . $from;
    mail($to,$subject,$message,$headers);
//echo "Mail Sent. Thank you " . $first_name . ", we will contact you shortly.";
header('Location: http://skinhairyou.com/thankyou.php');
    // You can also use header('Location: thank_you.php'); to redirect to another page.
    
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "http://api.msg91.com/api/v2/sendsms",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{ \"sender\": \"SKINHY\", \"route\": \"4\", \"country\": \"91\", \"sms\": [ { \"message\": \"Name: $message\", \"to\": [ \"9819797935\"] } ] }",
  CURLOPT_SSL_VERIFYHOST => 0,
  CURLOPT_SSL_VERIFYPEER => 0,
  CURLOPT_HTTPHEADER => array(
    "authkey: 225630Ar1hgdsrSlWz5b4638fb",
    "content-type: application/json"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}

    }


?>
