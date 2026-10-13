<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(int $code, array $data): never { http_response_code($code); echo json_encode($data); exit; }
set_exception_handler(function(Throwable $e){error_log('Blocky API: '.$e->getMessage());reply(500,['error'=>'The save server is unavailable. Please try again.']);});
if ($_SERVER['REQUEST_METHOD']==='POST' && ($_SERVER['HTTP_X_BLOCKY_REQUEST']??'')!=='1') reply(403,['error'=>'Please use the game sign-in screen.']);
if (isset($_SERVER['HTTP_ORIGIN']) && parse_url($_SERVER['HTTP_ORIGIN'],PHP_URL_HOST)!==explode(':',$_SERVER['HTTP_HOST'])[0]) reply(403,['error'=>'Origin not allowed.']);
$secure=(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off');
session_name('blocky_student');
session_set_cookie_params(['lifetime'=>0,'path'=>'/blocky/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
ini_set('session.use_strict_mode','1'); session_start();
$dir=getenv('BLOCKY_DATA_DIR') ?: dirname(__DIR__,3).'/blocky-private';
if(!is_dir($dir) && !mkdir($dir,0700,true)) throw new RuntimeException('Cannot create data directory');
$db=new PDO('sqlite:'.$dir.'/students.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->exec('PRAGMA busy_timeout=5000');
$db->exec('CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY,name TEXT NOT NULL UNIQUE COLLATE NOCASE,pin TEXT NOT NULL,state TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,updated INTEGER NOT NULL)');
$db->exec('CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,started INTEGER NOT NULL)');
function fresh(): array {return ['adventure'=>['version'=>1,'unlocked'=>1,'completed'=>0],'economy'=>['version'=>1,'heroCoins'=>0,'collected'=>[]]];}
function result(array $r): array {return ['user'=>['id'=>(int)$r['id'],'name'=>$r['name']],'state'=>json_decode($r['state'],true),'revision'=>(int)$r['revision']];}
$action=$_GET['action']??'me';
$raw=file_get_contents('php://input'); if(strlen($raw)>65536) reply(413,['error'=>'Save too large.']);
$body=$raw!==''?json_decode($raw,true):[]; if(!is_array($body))reply(400,['error'=>'Invalid request.']);
if(in_array($action,['register','login','logout','save'],true) && $_SERVER['REQUEST_METHOD']!=='POST')reply(405,['error'=>'POST required.']);
if($action==='register'||$action==='login'){
 $name=trim((string)($body['name']??''));$pin=(string)($body['pin']??'');
 if(!preg_match('/^[a-zA-Z0-9_-]{2,16}$/D',$name)||!preg_match('/^[0-9]{4,8}$/D',$pin))reply(400,['error'=>'Use a nickname of 2–16 letters or numbers and a PIN of 4–8 digits.']);
 $key=hash('sha256',strtolower($name).'|'.($_SERVER['REMOTE_ADDR']??''));
 $db->prepare('DELETE FROM attempts WHERE started < ?')->execute([time()-900]);
 $db->prepare('INSERT INTO attempts(key,count,started) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1')->execute([$key,time()]);
 $q=$db->prepare('SELECT count FROM attempts WHERE key=?');$q->execute([$key]);if((int)$q->fetchColumn()>15)reply(429,['error'=>'Too many tries. Ask your teacher or wait 15 minutes.']);
 $q=$db->prepare('SELECT * FROM students WHERE name=? COLLATE NOCASE');$q->execute([$name]);$row=$q->fetch(PDO::FETCH_ASSOC);
 if($action==='register'){
  if($row)reply(409,['error'=>'That nickname is taken. Choose another, or use Log in.']);
  try{$db->prepare('INSERT INTO students(name,pin,state,updated) VALUES(?,?,?,?)')->execute([$name,password_hash($pin,PASSWORD_DEFAULT),json_encode(fresh()),time()]);}
  catch(PDOException $e){if($e->getCode()==='23000')reply(409,['error'=>'That nickname is taken.']);throw $e;}
  $id=(int)$db->lastInsertId();$q=$db->prepare('SELECT * FROM students WHERE id=?');$q->execute([$id]);$row=$q->fetch(PDO::FETCH_ASSOC);
 }elseif(!$row||!password_verify($pin,$row['pin']))reply(401,['error'=>'Check your nickname and PIN, then try again.']);
 session_regenerate_id(true);$_SESSION['uid']=(int)$row['id'];$_SESSION['last']=time();
 $db->prepare('DELETE FROM attempts WHERE key=?')->execute([$key]);reply(200,result($row));
}
if($action==='logout'){$_SESSION=[];session_destroy();reply(200,['ok'=>true]);}
if(!isset($_SESSION['uid'])||time()-($_SESSION['last']??0)>43200)reply(401,['error'=>'Please log in again to save your adventure.']);
$_SESSION['last']=time();
$q=$db->prepare('SELECT * FROM students WHERE id=?');$q->execute([$_SESSION['uid']]);$row=$q->fetch(PDO::FETCH_ASSOC);if(!$row)reply(401,['error'=>'Please log in again.']);
if($action==='me')reply(200,result($row));
if($action==='save'){
 $s=$body['state']??null;$a=$s['adventure']??null;$e=$s['economy']??null;
 if(!is_array($a)||!is_array($e)||($a['version']??0)!==1||($e['version']??0)!==1||!is_int($a['unlocked']??null)||$a['unlocked']<1||$a['unlocked']>10||!is_int($a['completed']??null)||$a['completed']<0||$a['completed']>$a['unlocked']||!is_int($e['heroCoins']??null)||$e['heroCoins']<0||$e['heroCoins']>100000||!is_array($e['collected']??null)||count($e['collected'])>1000)reply(400,['error'=>'Invalid progress data.']);
 $ids=[];foreach($e['collected'] as $c){if(!is_array($c)||!is_string($c['id']??null)||strlen($c['id'])>100||isset($ids[$c['id']])||!is_string($c['roomId']??null)||strlen($c['roomId'])>40||!in_array($c['type']??'', ['coin','heartShard','memoryCrystal'],true))reply(400,['error'=>'Invalid collectible data.']);$ids[$c['id']]=true;}
 if(!is_int($body['revision']??null))reply(400,['error'=>'Invalid save version.']);
 $q=$db->prepare('UPDATE students SET state=?,revision=revision+1,updated=? WHERE id=? AND revision=?');
 $q->execute([json_encode(['adventure'=>$a,'economy'=>$e]),time(),$row['id'],$body['revision']]);
 if($q->rowCount()!==1)reply(409,['error'=>'This account was saved on another tab or device. Reload to load its latest progress.']);
 reply(200,['revision'=>$body['revision']+1,'ok'=>true]);
}
reply(404,['error'=>'Not found.']);
