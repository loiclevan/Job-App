<?php
$query = $_GET['q'];
$userip = $_SERVER['REMOTE_ADDR'];
$useragent = $_SERVER['HTTP_USER_AGENT'];
$agent = rawurlencode($useragent);

$url = "http://api.indeed.com/ads/apisearch?publisher=8399567412478479&q=".$query."&l=&sort=&radius=&st=&jt=&start=0&limit=10&fromage=&filter=&latlong=1&co=be&chnl=&userip=".$userip."&useragent=".$agent."&v=2";

$document = new DOMDocument();
$document->load($url);
echo $document->saveXML();

?>