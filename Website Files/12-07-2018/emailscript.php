<?php 
if(isset($_POST['submit'])){
    $to = "branabreo@gmail.com"; // this is your Email address
    $from = "appointment@skinhairyou.com"; // this is the sender's Email address
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $emailid = $_POST['email'];
    $phone = $_POST['telephone'];
    
    $subject = "Form submission";
    $message = $first_name . "  " . $last_name .", Phone number:".$phone.", Email ID ".$emailid. " Wrote the following:" . "\n\n" . $_POST['comments'];
    $headers = "From:" . $from;
    mail($to,$subject,$message,$headers);
//echo "Mail Sent. Thank you " . $first_name . ", we will contact you shortly.";
header('Location: http://skinhairyou.com/thankyou.php');
    // You can also use header('Location: thank_you.php'); to redirect to another page.
    }
?>