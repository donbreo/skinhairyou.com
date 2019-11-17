<html>
<head>	
<title>SKIN HAIR & YOU | Home</title>
<link href="css/bootstrap.css" rel="stylesheet" type="text/css" media="all" />
<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<!--<script src="js/jquery.min.js"></script>-->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<!-- Custom Theme files -->
<!--theme-style-->
<link href="css/style.css" rel="stylesheet" type="text/css" media="all" />	
<!--//theme-style-->
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="Fashion plus Responsive web template, Bootstrap Web Templates, Flat Web Templates, Andriod Compatible web template, 
Smartphone Compatible web template, free webdesigns for Nokia, Samsung, LG, SonyErricsson, Motorola web design" />
<script type="application/x-javascript"> addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false); function hideURLbar(){ window.scrollTo(0,1); } </script>
<!--script-->
<link href="css/animate.css" rel="stylesheet" type="text/css" media="all">
<script src="js/wow.min.js"></script>
<script>
 	new WOW().init();
</script>
<!--//script-->
</head>
<body>
<div class="top-header about-header">
			<h1><a href="index.html">Fashion<span>+</span></a></h1>
			<img class="img-responsive" src="images/li.png">
		</div>	
<div class="header">
					<div class="sticky-navigation">
					<div class="fixed-header">
						<div class="container">
						    <div class="navbar-header">
                              <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                              <span class="icon-bar"></span>
                              <span class="icon-bar"></span>
                              <span class="icon-bar"></span>                        
                              </button>
                              <a class="navbar-brand" href="index.html"><img src="images/logo.jpg" class="img-responsive"></a>
                            </div>
							<div class="top-menu collapse navbar-collapse" id="myNavbar">
								<span class="menu"><img src="images/menu1.png"> </span>
					            <ul class="nav navbar-nav">
					            	<li ><a href="index.html">Home</a></li>
					                 <li><a href="about.html">About Us</a></li>
					                <li class="dropdown">
                                      <a class="dropdown-toggle" data-toggle="dropdown" href="#">Services <span class="caret"></span></a>
                                       <ul class="dropdown-menu">
                                          <li><a href="hair_disorder.html">Hair Disorder</a></li>
					                  	<li><a href="hair_transplant.html">Hair Transplant (FUE)</a></li>
					                  	<li><a href="nail_disorder.html">Nail Disorder</a></li>
					                  	<li><a href="std.html">STD/HIV</a></li>
										<li><a href="skin_disorders.html">Skin Disorders</a></li>
                                       </ul>
                                    </li>
				                    <li><a href="#">Results</a></li>
				                  <li><a href="contact.html">Contact Us</a></li>
					            </ul>
				            </div>
							<script>
								$("span.menu").click(function(){
									$(".top-menu ul").slideToggle(500, function(){
									});
								});
							</script>
				            <!-- search-->
<!--
				            <div class="top-search">
				            	<form>
				            		<input type="text">
				            		<input type="submit" value="" />
				            	</form>
				            </div>
				            <div class="clearfix"> </div>
-->
				            <!-- search-->
				          </div>
						  </div>
			        </div>
				</div>
				<div class="text-center col-xs-12 " style="font-size:30px; padding-top:20px;">
				<?php

require 'connection.php';
$conn    = Connect();
$name    = $conn->real_escape_string($_POST['u_name']);
$email   = $conn->real_escape_string($_POST['u_email']);
$subj    = $conn->real_escape_string($_POST['subj']);
$message = $conn->real_escape_string($_POST['message']);
$query   = "INSERT into tb_cform (u_name,u_email,subj,message) VALUES('" . $name . "','" . $email . "','" . $subj . "','" . $message . "')";
$success = $conn->query($query);



echo "Thank You For Contacting Us ! <br>";

$conn->close();

?>
</div>
</body>
</html>