# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.5.5-10.6.7-MariaDB-2ubuntu1)
# Database: binopt
# Generation Time: 2022-07-08 11:03:05 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table _sample_created_updated
# ------------------------------------------------------------

DROP TABLE IF EXISTS `_sample_created_updated`;

CREATE TABLE `_sample_created_updated` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table assets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `assets`;

CREATE TABLE `assets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `name` varchar(40) DEFAULT NULL,
  `symbol` varchar(40) DEFAULT NULL,
  `baseAsset` varchar(40) DEFAULT NULL,
  `targetAsset` varchar(40) DEFAULT NULL,
  `tickerSrc` varchar(40) DEFAULT NULL,
  `group` varchar(40) DEFAULT NULL COMMENT '1: crypto, 2:forex, 3:stock',
  `groupstr` varchar(40) DEFAULT NULL,
  `uuid` varchar(60) DEFAULT NULL,
  `imgurl` varchar(80) DEFAULT NULL,
  `dispSymbol` varchar(20) DEFAULT NULL,
  `APISymbol` varchar(20) DEFAULT NULL,
  `currentPrice` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;

INSERT INTO `assets` (`id`, `createdat`, `updatedat`, `name`, `symbol`, `baseAsset`, `targetAsset`, `tickerSrc`, `group`, `groupstr`, `uuid`, `imgurl`, `dispSymbol`, `APISymbol`, `currentPrice`)
VALUES
	(1,'2022-06-03 05:57:30','2022-07-05 03:31:08','Bitcoin','BTC_USDT','BTC','USDT','Binance','1','crypto','ec97a519-e311-11ec-803f-0a03fa82da02','https://s1.bycsi.com/assets/image/coins/dark/btc.svg','BTCUSDT','BTC-USD',NULL),
	(2,'2022-06-03 05:58:34','2022-07-05 03:30:54','Ethereum','ETH_USDT','ETH','USDT','Binance','1','crypto','ec97a761-e311-11ec-803f-0a03fa82da02','https://s1.bycsi.com/assets/image/coins/dark/eth.svg','ETHUSDT','ETH-USD',NULL),
	(3,'2022-06-03 06:00:43','2022-07-05 03:30:52','Ripple','XRP_USDT','XRP','USDT','Binance','1','crypto','ec97a7e6-e311-11ec-803f-0a03fa82da02','https://s1.bycsi.com/assets/image/coins/dark/xrp.svg','XRPUSDT','XRP-USD',NULL),
	(4,'2022-06-03 06:02:31','2022-07-05 03:30:11','EUR/USD','EUR_USD','EUR','USD','Forex','2','forex','ec97a844-e311-11ec-803f-0a03fa82da02','https://cloud.xm-cdn.com/static/research-portal/instruments_icons/eurusd.svg','EURUSD','EURUSD=X',NULL),
	(5,'2022-06-03 06:03:13','2022-07-05 03:29:57','USD/JPY','USD_JPY','USD','JPY','Forex','2','forex','ec97a8a1-e311-11ec-803f-0a03fa82da02','https://cloud.xm-cdn.com/static/research-portal/instruments_icons/usdjpy.svg','USDJPY','JPY=X',NULL),
	(6,'2022-06-03 06:03:49','2022-07-05 03:29:46','GBP/USD','GBP_USD','CBP','USD','Forex','2','forex','ec97a8f6-e311-11ec-803f-0a03fa82da02','https://cloud.xm-cdn.com/static/research-portal/instruments_icons/gbpusd.svg','GBPUSD','GBPUSD=X',NULL),
	(7,'2022-06-03 06:04:10','2022-07-05 03:29:36','USD/CAD','USD_CAD','USD','CAD','Forex','2','forex','ec97a94a-e311-11ec-803f-0a03fa82da02','https://cloud.xm-cdn.com/static/research-portal/instruments_icons/usdcad.svg','USDCAD','CAD=X',NULL),
	(8,'2022-06-03 06:04:33','2022-07-05 03:29:26','USD/CHF','USD_CHF','USD','CHF','Forex','2','forex','ec97a99c-e311-11ec-803f-0a03fa82da02','https://cloud.xm-cdn.com/static/research-portal/instruments_icons/usdchf.svg','USDCHF','CHF=X',NULL),
	(9,'2022-06-13 05:53:16','2022-07-05 03:29:05','Alibaba','BABA','BABA','CNY',NULL,'3','stock',NULL,NULL,'9988','9988.HK',NULL),
	(10,'2022-06-13 05:55:56','2022-07-05 03:28:53','Industrial_Commercial_Bank','ICBC','ICBC','CNY',NULL,'3','stock',NULL,NULL,'601398','601398.SS',NULL),
	(11,'2022-06-13 05:58:05','2022-07-05 03:28:42','Argicultural_Bank','AGBNK','AGBNK','CNY',NULL,'3','stock',NULL,NULL,'601288','601288.SS',NULL),
	(12,'2022-06-13 05:58:47','2022-07-05 03:27:33','Tencent','TCEHY','TCEHY','CNY',NULL,'3','stock',NULL,NULL,'0700','0700.HK',NULL),
	(13,'2022-06-13 06:02:48','2022-07-05 03:28:32','Kweichow_Moutai_Co','KMC','KMC','CNY',NULL,'3','stock',NULL,NULL,'600519','600519.SS',NULL);

/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table balances
# ------------------------------------------------------------

DROP TABLE IF EXISTS `balances`;

CREATE TABLE `balances` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(11) unsigned NOT NULL,
  `total` bigint(20) DEFAULT 0,
  `locked` bigint(20) DEFAULT 0,
  `avail` bigint(20) DEFAULT 0,
  `typestr` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_users_uid` (`uid`),
  CONSTRAINT `FK_users_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `balances` WRITE;
/*!40000 ALTER TABLE `balances` DISABLE KEYS */;

INSERT INTO `balances` (`id`, `uid`, `total`, `locked`, `avail`, `typestr`)
VALUES
	(123,81,0,0,0,'DEMO'),
	(124,81,330000500,0,330000500,'LIVE'),
	(125,82,0,0,0,'DEMO'),
	(126,82,0,0,0,'LIVE'),
	(129,84,100,0,100,'DEMO'),
	(130,84,0,0,0,'LIVE'),
	(133,86,1000000000,0,1000000000,'DEMO'),
	(134,86,3090000400,2770,3089997630,'LIVE'),
	(135,87,12,0,12,'DEMO'),
	(136,87,18,0,18,'LIVE'),
	(147,93,0,0,0,'DEMO'),
	(148,93,0,0,0,'LIVE'),
	(149,94,0,0,0,'DEMO'),
	(150,94,0,0,0,'LIVE'),
	(151,95,0,0,0,'DEMO'),
	(152,95,200000000,0,200000000,'LIVE'),
	(157,98,0,0,0,'DEMO'),
	(158,98,0,0,0,'LIVE'),
	(159,99,0,0,0,'DEMO'),
	(160,99,700000000,6700,699993300,'LIVE'),
	(161,100,0,0,0,'DEMO'),
	(162,100,0,0,0,'LIVE'),
	(163,101,0,0,0,'DEMO'),
	(164,101,0,0,0,'LIVE'),
	(167,105,0,0,0,'DEMO'),
	(168,105,100,0,100,'LIVE'),
	(173,108,0,0,0,'DEMO'),
	(174,108,0,0,0,'LIVE'),
	(175,110,0,0,0,'DEMO'),
	(176,110,100000100,0,100000100,'LIVE'),
	(177,111,10000,0,10000,'DEMO'),
	(178,111,800000,0,800000,'LIVE'),
	(179,112,0,0,0,'DEMO'),
	(180,112,400000,0,400000,'LIVE'),
	(181,113,0,0,0,'DEMO'),
	(182,113,0,0,0,'LIVE'),
	(183,114,0,0,0,'DEMO'),
	(184,114,230,0,230,'LIVE');

/*!40000 ALTER TABLE `balances` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table betlogs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `betlogs`;

CREATE TABLE `betlogs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) unsigned NOT NULL,
  `assetId` int(11) unsigned NOT NULL,
  `amount` bigint(20) unsigned DEFAULT NULL,
  `starting` bigint(20) unsigned NOT NULL,
  `expiry` bigint(20) unsigned NOT NULL,
  `startingPrice` varchar(20) DEFAULT NULL,
  `endingPrice` varchar(20) DEFAULT NULL,
  `side` varchar(20) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` int(11) unsigned DEFAULT NULL,
  `betId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_betlog_uid` (`uid`),
  KEY `FK_betlog_assetId` (`assetId`),
  CONSTRAINT `FK_betlog_assetId` FOREIGN KEY (`assetId`) REFERENCES `assets` (`id`),
  CONSTRAINT `FK_betlog_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `betlogs` WRITE;
/*!40000 ALTER TABLE `betlogs` DISABLE KEYS */;

INSERT INTO `betlogs` (`id`, `createdat`, `updatedat`, `uid`, `assetId`, `amount`, `starting`, `expiry`, `startingPrice`, `endingPrice`, `side`, `type`, `status`, `betId`)
VALUES
	(43,'2022-07-06 05:15:00',NULL,99,1,100,1657084440,1657084500,'0.9085353221838506','0.09221796227866141','HIGH','LIVE',0,NULL),
	(44,'2022-07-06 05:20:00',NULL,99,1,100,1657084740,1657084800,'0.9879598355152812','0.28855878548523917','LOW','LIVE',1,NULL),
	(45,'2022-07-06 05:24:00',NULL,86,1,100,1657084980,1657085040,'0.7420930888778563','0.9102234464016352','HIGH','LIVE',1,NULL),
	(46,'2022-07-06 06:00:00',NULL,99,1,200,1657087140,1657087200,'0.5211503324569906','0.7772713705549525','HIGH','LIVE',1,NULL),
	(47,'2022-07-06 06:02:00',NULL,99,1,200,1657087260,1657087320,'0.9572325709553378','0.20478720873757017','LOW','LIVE',1,NULL),
	(48,'2022-07-06 06:02:00',NULL,99,1,200,1657087260,1657087320,'0.9572325709553378','0.20478720873757017','LOW','LIVE',1,NULL),
	(49,'2022-07-06 06:06:00',NULL,99,1,200,1657087500,1657087560,'0.31406117153934643','0.03293130159311075','LOW','LIVE',1,NULL),
	(50,'2022-07-06 06:06:00',NULL,99,1,300,1657087500,1657087560,'0.31406117153934643','0.03293130159311075','LOW','LIVE',1,NULL),
	(51,'2022-07-06 06:30:00',NULL,99,1,200,1657088940,1657089000,'0.29763650850087053','0.17245193213572652','LOW','LIVE',1,NULL),
	(52,'2022-07-06 06:32:00',NULL,99,1,200,1657089060,1657089120,'0.1489767476671937','0.03803067755384393','LOW','LIVE',1,NULL),
	(53,'2022-07-06 06:33:00',NULL,99,1,200,1657089120,1657089180,'0.03803067755384393','0.37018535662700325','LOW','LIVE',0,NULL),
	(54,'2022-07-06 06:34:00',NULL,99,1,300,1657089180,1657089240,'0.37018535662700325','0.48925122040279345','HIGH','LIVE',1,NULL),
	(55,'2022-07-06 06:39:00',NULL,99,1,300,1657089480,1657089540,'0.9357158669629502','0.5765013144915283','LOW','LIVE',1,NULL),
	(56,'2022-07-06 06:41:01',NULL,99,1,300,1657089600,1657089660,'0.34326044944598744','0.4254339792358137','LOW','LIVE',0,NULL),
	(57,'2022-07-06 06:42:00',NULL,99,1,400,1657089660,1657089720,'0.4254339792358137','0.7310892476679918','LOW','LIVE',0,NULL),
	(58,'2022-07-06 06:45:00',NULL,99,1,400,1657089840,1657089900,'0.18664855184436657','0.3106498353754823','LOW','LIVE',0,NULL),
	(59,'2022-07-06 07:13:00',NULL,99,1,300,1657091520,1657091580,'0.016608721541816696','0.5808808433235548','LOW','LIVE',0,NULL),
	(60,'2022-07-06 07:36:00',NULL,99,1,100,1657092900,1657092960,'0.07829146295613576','0.8298617935017198','LOW','LIVE',0,NULL),
	(61,'2022-07-06 07:37:00',NULL,86,1,100,1657092960,1657093020,'0.8298617935017198','0.27303754203627784','HIGH','LIVE',0,NULL),
	(62,'2022-07-06 07:37:00',NULL,86,1,100,1657092960,1657093020,'0.8298617935017198','0.27303754203627784','HIGH','LIVE',0,NULL),
	(63,'2022-07-06 07:38:00',NULL,99,1,400,1657093020,1657093080,'0.27303754203627784','0.4785914876842847','LOW','LIVE',0,NULL),
	(64,'2022-07-06 08:02:00',NULL,99,1,100,1657094340,1657094520,'0.005385808828940908','0.7954426761926225','LOW','LIVE',0,NULL),
	(65,'2022-07-06 08:05:00',NULL,99,1,100,1657094640,1657094700,'0.6626847781692824','0.44712392629878184','LOW','LIVE',1,NULL),
	(66,'2022-07-06 08:13:00',NULL,99,1,100,1657095120,1657095180,'0.4679073777424685','0.2750506254285803','LOW','LIVE',1,NULL),
	(67,'2022-07-06 08:52:00',NULL,99,1,100,1657097460,1657097520,'0.773595903326421','0.37434316754167907','HIGH','LIVE',0,NULL),
	(68,'2022-07-06 08:52:00',NULL,99,1,100,1657097460,1657097520,'0.773595903326421','0.37434316754167907','LOW','LIVE',1,NULL),
	(69,'2022-07-06 08:55:00',NULL,99,1,100,1657097640,1657097700,'0.700594553718696','0.700869949154016','LOW','LIVE',0,NULL),
	(70,'2022-07-06 08:57:00',NULL,99,1,100,1657097760,1657097820,'0.5353041182480713','0.9658862170553015','LOW','LIVE',0,NULL),
	(71,'2022-07-06 08:59:00',NULL,99,1,100,1657097880,1657097940,'0.10195549785023861','0.6751487886069678','HIGH','LIVE',1,NULL),
	(72,'2022-07-06 09:02:00',NULL,99,1,100,1657098060,1657098120,'0.2286030154416312','0.8035796618966176','LOW','LIVE',0,NULL),
	(73,'2022-07-06 09:04:00',NULL,99,1,100,1657098180,1657098240,'0.3667806297292733','0.576363651573875','HIGH','LIVE',1,NULL),
	(74,'2022-07-06 09:07:00',NULL,99,1,100,1657098360,1657098420,'0.684250597335418','0.716737428147026','HIGH','LIVE',1,NULL),
	(75,'2022-07-06 09:09:00',NULL,99,1,100,1657098480,1657098540,'0.18874205110366615','0.2563082827382308','HIGH','LIVE',1,NULL),
	(76,'2022-07-06 09:11:00',NULL,99,1,100,1657098600,1657098660,'0.05292180924289802','0.3696215902216895','HIGH','LIVE',1,NULL),
	(77,'2022-07-06 09:11:00',NULL,99,1,100,1657098600,1657098660,'0.05292180924289802','0.3696215902216895','LOW','LIVE',0,NULL),
	(78,'2022-07-06 09:14:00',NULL,99,1,100,1657098780,1657098840,'0.9617946786846931','0.3939735796017467','HIGH','LIVE',0,NULL),
	(79,'2022-07-06 09:16:00',NULL,99,1,100,1657098900,1657098960,'0.202674904268473','0.5904480526032456','HIGH','LIVE',1,NULL),
	(80,'2022-07-06 09:16:00',NULL,99,1,100,1657098900,1657098960,'0.202674904268473','0.5904480526032456','LOW','LIVE',0,NULL),
	(81,'2022-07-06 09:19:00',NULL,99,1,100,1657099080,1657099140,'0.21196204335119795','0.9686988650869499','HIGH','LIVE',1,NULL),
	(82,'2022-07-06 09:20:00',NULL,99,1,100,1657099080,1657099200,'0.21196204335119795','0.08760803409956974','LOW','LIVE',1,NULL),
	(83,'2022-07-06 09:25:00',NULL,99,1,100,1657099440,1657099500,'0.5823804615320944','0.21897946689656722','HIGH','LIVE',0,NULL),
	(84,'2022-07-06 09:27:00',NULL,86,1,100,1657099560,1657099620,'0.4504992256951288','0.5528043062906016','HIGH','LIVE',1,NULL),
	(85,'2022-07-06 09:33:00',NULL,86,1,100,1657099920,1657099980,'0.5578533599558049','0.46396210064354126','HIGH','LIVE',0,NULL),
	(86,'2022-07-06 09:35:00',NULL,86,1,100,1657100040,1657100100,'0.9927381559677908','0.39803568151707847','HIGH','LIVE',0,NULL),
	(87,'2022-07-06 09:42:00',NULL,86,5,10,1657100460,1657100520,'0.7795859414071773','0.1096160535147983','HIGH','LIVE',0,NULL),
	(88,'2022-07-06 09:42:00',NULL,86,5,10,1657100460,1657100520,'0.7795859414071773','0.1096160535147983','HIGH','LIVE',0,NULL),
	(89,'2022-07-06 09:43:00',NULL,86,5,10,1657100520,1657100580,'0.1096160535147983','0.5231951569555116','HIGH','LIVE',1,NULL),
	(90,'2022-07-06 09:44:00',NULL,86,5,10,1657100580,1657100640,'0.5231951569555116','0.5895345429111913','HIGH','LIVE',1,NULL),
	(91,'2022-07-06 09:45:00',NULL,86,5,10,1657100640,1657100700,'0.5895345429111913','0.30516230140485767','HIGH','LIVE',0,NULL),
	(92,'2022-07-06 09:45:00',NULL,86,5,10,1657100640,1657100700,'0.5895345429111913','0.30516230140485767','HIGH','LIVE',0,NULL),
	(93,'2022-07-06 09:46:00',NULL,86,1,100,1657100700,1657100760,'0.9332638543673555','0.9921221924881365','HIGH','LIVE',1,NULL),
	(94,'2022-07-06 09:46:00',NULL,86,5,10,1657100700,1657100760,'0.30516230140485767','0.15305509484061042','HIGH','LIVE',0,NULL),
	(95,'2022-07-06 09:48:00',NULL,86,1,100,1657100820,1657100880,'0.349091879806223','0.3623242619235787','HIGH','LIVE',1,NULL),
	(96,'2022-07-06 09:49:00',NULL,86,1,100,1657100880,1657100940,'0.3623242619235787','0.05305439440034143','HIGH','LIVE',0,NULL),
	(97,'2022-07-06 09:49:00',NULL,86,1,100,1657100880,1657100940,'0.3623242619235787','0.05305439440034143','HIGH','LIVE',0,NULL),
	(98,'2022-07-06 09:50:00',NULL,86,1,100,1657100940,1657101000,'0.05305439440034143','0.5903701136682353','HIGH','LIVE',1,NULL),
	(99,'2022-07-06 09:50:00',NULL,86,1,100,1657100940,1657101000,'0.05305439440034143','0.5903701136682353','HIGH','LIVE',1,NULL),
	(100,'2022-07-06 09:50:00',NULL,86,1,100,1657100940,1657101000,'0.05305439440034143','0.5903701136682353','HIGH','LIVE',1,NULL),
	(101,'2022-07-06 09:52:00',NULL,86,1,100,1657101060,1657101120,'0.448151770402452','0.009209064573537207','HIGH','LIVE',0,NULL),
	(102,'2022-07-06 09:52:00',NULL,86,1,100,1657101060,1657101120,'0.448151770402452','0.009209064573537207','HIGH','LIVE',0,NULL),
	(103,'2022-07-06 09:54:00',NULL,86,1,100,1657101180,1657101240,'0.35169482584613254','0.3948788220879629','HIGH','LIVE',1,NULL),
	(104,'2022-07-06 09:54:00',NULL,86,1,100,1657101180,1657101240,'0.35169482584613254','0.3948788220879629','HIGH','LIVE',1,NULL),
	(105,'2022-07-06 09:56:00',NULL,86,1,100,1657101300,1657101360,'0.4441668417233533','0.2721350313474771','HIGH','LIVE',0,NULL);

/*!40000 ALTER TABLE `betlogs` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table bets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bets`;

CREATE TABLE `bets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) unsigned NOT NULL,
  `assetId` int(11) unsigned NOT NULL,
  `amount` bigint(20) unsigned DEFAULT NULL,
  `starting` bigint(20) unsigned NOT NULL,
  `expiry` bigint(20) unsigned NOT NULL,
  `startingPrice` varchar(20) DEFAULT NULL,
  `side` varchar(20) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table bookmarks
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bookmarks`;

CREATE TABLE `bookmarks` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) unsigned DEFAULT NULL,
  `assetsId` int(11) unsigned DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `typestr` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_assets_bookmark` (`assetsId`),
  KEY `FK_users_bookmark` (`uid`),
  CONSTRAINT `FK_assets_bookmark` FOREIGN KEY (`assetsId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_users_bookmark` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;

INSERT INTO `bookmarks` (`id`, `createdat`, `updatedat`, `uid`, `assetsId`, `active`, `typestr`)
VALUES
	(35,'2022-06-29 07:54:10',NULL,81,6,NULL,'ASSETS'),
	(39,'2022-06-30 05:04:52',NULL,86,4,NULL,'ASSETS'),
	(41,'2022-06-30 05:04:57',NULL,86,1,NULL,'ASSETS'),
	(42,'2022-06-30 06:57:58',NULL,99,4,NULL,'ASSETS'),
	(43,'2022-07-05 02:04:13',NULL,86,3,NULL,'ASSETS'),
	(44,'2022-07-05 02:09:26',NULL,81,4,NULL,'ASSETS'),
	(45,'2022-07-05 02:19:14',NULL,86,13,NULL,'ASSETS'),
	(46,'2022-07-05 02:19:17',NULL,86,10,NULL,'ASSETS'),
	(47,'2022-07-05 08:20:50',NULL,111,4,NULL,'ASSETS'),
	(48,'2022-07-05 08:20:51',NULL,111,5,NULL,'ASSETS'),
	(49,'2022-07-05 08:20:52',NULL,111,6,NULL,'ASSETS'),
	(50,'2022-07-05 08:20:52',NULL,111,7,NULL,'ASSETS'),
	(51,'2022-07-05 08:20:53',NULL,111,8,NULL,'ASSETS'),
	(52,'2022-07-05 08:20:54',NULL,111,1,NULL,'ASSETS'),
	(53,'2022-07-05 08:20:54',NULL,111,2,NULL,'ASSETS'),
	(54,'2022-07-05 08:20:55',NULL,111,3,NULL,'ASSETS'),
	(55,'2022-07-05 08:20:56',NULL,111,9,NULL,'ASSETS'),
	(56,'2022-07-05 08:20:57',NULL,111,10,NULL,'ASSETS');

/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table country_code
# ------------------------------------------------------------

DROP TABLE IF EXISTS `country_code`;

CREATE TABLE `country_code` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dialcode` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `country_code` WRITE;
/*!40000 ALTER TABLE `country_code` DISABLE KEYS */;

INSERT INTO `country_code` (`id`, `name`, `dialcode`, `code`)
VALUES
	(1,'Afghanistan','+93','AF'),
	(2,'Aland Islands','+358','AX'),
	(3,'Albania','+355','AL'),
	(4,'Algeria','+213','DZ'),
	(5,'Andorra','+376','AD'),
	(6,'Angola','+244','AO'),
	(7,'Anguilla','+1264','AI'),
	(8,'Antarctica','+672','AQ'),
	(9,'Antigua and Barbuda','+1268','AG'),
	(10,'AmericanSamoa','+1684','AS'),
	(11,'Argentina','+54','AR'),
	(12,'Aruba','+297','AW'),
	(13,'Armenia','+374','AM'),
	(14,'Australia','+61','AU'),
	(15,'Austria','+43','AT'),
	(16,'Azerbaijan','+994','AZ'),
	(17,'Bahamas','+1242','BS'),
	(18,'Bahrain','+973','BH'),
	(19,'Bangladesh','+880','BD'),
	(20,'Barbados','+1246','BB'),
	(21,'Belarus','+375','BY'),
	(22,'Belgium','+32','BE'),
	(23,'Belize','+501','BZ'),
	(24,'Benin','+229','BJ'),
	(25,'Bermuda','+1441','BM'),
	(26,'Bhutan','+975','BT'),
	(27,'Bolivia, Plurinational State of','+591','BO'),
	(28,'Bosnia and Herzegovina','+387','BA'),
	(29,'Brunei Darussalam','+673','BN'),
	(30,'Botswana','+267','BW'),
	(31,'Brazil','+55','BR'),
	(32,'British Indian Ocean Territory','+246','IO'),
	(33,'Bulgaria','+359','BG'),
	(34,'Burkina Faso','+226','BF'),
	(35,'Burundi','+257','BI'),
	(36,'Cambodia','+855','KH'),
	(37,'Cameroon','+237','CM'),
	(38,'Canada','+1','CA'),
	(39,'Cape Verde','+238','CV'),
	(40,'Cayman Islands','+ 345','KY'),
	(41,'Central African Republic','+236','CF'),
	(42,'Chad','+235','TD'),
	(43,'Chile','+56','CL'),
	(44,'China','+86','CN'),
	(45,'Christmas Island','+61','CX'),
	(46,'Cocos (Keeling) Islands','+61','CC'),
	(47,'Colombia','+57','CO'),
	(48,'Comoros','+269','KM'),
	(49,'Congo','+242','CG'),
	(50,'Congo, The Democratic Republic of the Congo','+243','CD'),
	(51,'Cook Islands','+682','CK'),
	(52,'Costa Rica','+506','CR'),
	(53,'Cote d\'Ivoire','+225','CI'),
	(54,'Croatia','+385','HR'),
	(55,'Cuba','+53','CU'),
	(56,'Czech Republic','+420','CZ'),
	(57,'Denmark','+45','DK'),
	(58,'Djibouti','+253','DJ'),
	(59,'Dominica','+1767','DM'),
	(60,'Dominican Republic','+1849','DO'),
	(61,'Cyprus','+357','CY'),
	(62,'Ecuador','+593','EC'),
	(63,'Egypt','+20','EG'),
	(64,'El Salvador','+503','SV'),
	(65,'Equatorial Guinea','+240','GQ'),
	(66,'Estonia','+372','EE'),
	(67,'Ethiopia','+251','ET'),
	(68,'Falkland Islands (Malvinas)','+500','FK'),
	(69,'Faroe Islands','+298','FO'),
	(70,'Finland','+358','FI'),
	(71,'Fiji','+679','FJ'),
	(72,'France','+33','FR'),
	(73,'French Guiana','+594','GF'),
	(74,'Gambia','+220','GM'),
	(75,'French Polynesia','+689','PF'),
	(76,'Georgia','+995','GE'),
	(77,'Germany','+49','DE'),
	(78,'Gibraltar','+350','GI'),
	(79,'Ghana','+233','GH'),
	(80,'Eritrea','+291','ER'),
	(81,'Gabon','+241','GA'),
	(82,'Greece','+30','GR'),
	(83,'Greenland','+299','GL'),
	(84,'Grenada','+1473','GD'),
	(85,'Guadeloupe','+590','GP'),
	(86,'Guam','+1671','GU'),
	(87,'Guernsey','+44','GG'),
	(88,'Guinea','+224','GN'),
	(89,'Guinea-Bissau','+245','GW'),
	(90,'Guatemala','+502','GT'),
	(91,'Guyana','+595','GY'),
	(92,'Haiti','+509','HT'),
	(93,'Holy See (Vatican City State)','+379','VA'),
	(94,'Honduras','+504','HN'),
	(95,'Hong Kong','+852','HK'),
	(96,'Hungary','+36','HU'),
	(97,'Iceland','+354','IS'),
	(98,'India','+91','IN'),
	(99,'Indonesia','+62','ID'),
	(100,'Iran, Islamic Republic of Persian Gulf','+98','IR'),
	(101,'Iraq','+964','IQ'),
	(102,'Japan','+81','JP'),
	(103,'Ireland','+353','IE'),
	(104,'Israel','+972','IL'),
	(105,'Isle of Man','+44','IM'),
	(106,'Italy','+39','IT'),
	(107,'Jamaica','+1876','JM'),
	(108,'Jersey','+44','JE'),
	(109,'Jordan','+962','JO'),
	(110,'Kazakhstan','+77','KZ'),
	(111,'Kenya','+254','KE'),
	(112,'Kiribati','+686','KI'),
	(113,'Korea, Democratic People\'s Republic of Korea','+850','KP'),
	(114,'Korea, Republic of South Korea','+82','KR'),
	(115,'Kuwait','+965','KW'),
	(116,'Laos','+856','LA'),
	(117,'Latvia','+371','LV'),
	(118,'Kyrgyzstan','+996','KG'),
	(119,'Lebanon','+961','LB'),
	(120,'Lesotho','+266','LS'),
	(121,'Liberia','+231','LR'),
	(122,'Libyan Arab Jamahiriya','+218','LY'),
	(123,'Liechtenstein','+423','LI'),
	(124,'Lithuania','+370','LT'),
	(125,'Luxembourg','+352','LU'),
	(126,'Macao','+853','MO'),
	(127,'Macedonia','+389','MK'),
	(128,'Malawi','+265','MW'),
	(129,'Malaysia','+60','MY'),
	(130,'Maldives','+960','MV'),
	(131,'Mali','+223','ML'),
	(132,'Madagascar','+261','MG'),
	(133,'Malta','+356','MT'),
	(134,'Marshall Islands','+692','MH'),
	(135,'Martinique','+596','MQ'),
	(136,'Mauritania','+222','MR'),
	(137,'Mauritius','+230','MU'),
	(138,'Mayotte','+262','YT'),
	(139,'Mexico','+52','MX'),
	(140,'Micronesia, Federated States of Micronesia','+691','FM'),
	(141,'Monaco','+377','MC'),
	(142,'Mongolia','+976','MN'),
	(143,'Montenegro','+382','ME'),
	(144,'Moldova','+373','MD'),
	(145,'Montserrat','+1664','MS'),
	(146,'Morocco','+212','MA'),
	(147,'Mozambique','+258','MZ'),
	(148,'Myanmar','+95','MM'),
	(149,'Namibia','+264','NA'),
	(150,'Nauru','+674','NR'),
	(151,'Nepal','+977','NP'),
	(152,'Netherlands','+31','NL'),
	(153,'Netherlands Antilles','+599','AN'),
	(154,'New Caledonia','+687','NC'),
	(155,'New Zealand','+64','NZ'),
	(156,'Nicaragua','+505','NI'),
	(157,'Niger','+227','NE'),
	(158,'Nigeria','+234','NG'),
	(159,'Niue','+683','NU'),
	(160,'Norfolk Island','+672','NF'),
	(161,'Northern Mariana Islands','+1670','MP'),
	(162,'Norway','+47','NO'),
	(163,'Oman','+968','OM'),
	(164,'Pakistan','+92','PK'),
	(165,'Palau','+680','PW'),
	(166,'Palestinian Territory, Occupied','+970','PS'),
	(167,'Panama','+507','PA'),
	(168,'Papua New Guinea','+675','PG'),
	(169,'Paraguay','+595','PY'),
	(170,'Peru','+51','PE'),
	(171,'Pitcairn','+872','PN'),
	(172,'Poland','+48','PL'),
	(173,'Philippines','+63','PH'),
	(174,'Portugal','+351','PT'),
	(175,'Puerto Rico','+1939','PR'),
	(176,'Qatar','+974','QA'),
	(177,'Romania','+40','RO'),
	(178,'Russia','+7','RU'),
	(179,'Rwanda','+250','RW'),
	(180,'Saint Barthelemy','+590','BL'),
	(181,'Saint Helena, Ascension and Tristan Da Cunha','+290','SH'),
	(182,'Reunion','+262','RE'),
	(183,'Saint Kitts and Nevis','+1869','KN'),
	(184,'Saint Lucia','+1758','LC'),
	(185,'Saint Martin','+590','MF'),
	(186,'Saint Pierre and Miquelon','+508','PM'),
	(187,'Saint Vincent and the Grenadines','+1784','VC'),
	(188,'Samoa','+685','WS'),
	(189,'San Marino','+378','SM'),
	(190,'Sao Tome and Principe','+239','ST'),
	(191,'Saudi Arabia','+966','SA'),
	(192,'Senegal','+221','SN'),
	(193,'Serbia','+381','RS'),
	(194,'Seychelles','+248','SC'),
	(195,'Sierra Leone','+232','SL'),
	(196,'Singapore','+65','SG'),
	(197,'Slovakia','+421','SK'),
	(198,'Slovenia','+386','SI'),
	(199,'Solomon Islands','+677','SB'),
	(200,'Somalia','+252','SO'),
	(201,'South Africa','+27','ZA'),
	(202,'South Sudan','+211','SS'),
	(203,'Spain','+34','ES'),
	(204,'Sri Lanka','+94','LK'),
	(205,'South Georgia and the South Sandwich Islands','+500','GS'),
	(206,'Suriname','+597','SR'),
	(207,'Svalbard and Jan Mayen','+47','SJ'),
	(208,'Swaziland','+268','SZ'),
	(209,'Sweden','+46','SE'),
	(210,'Sudan','+249','SD'),
	(211,'Switzerland','+41','CH'),
	(212,'Syrian Arab Republic','+963','SY'),
	(213,'Taiwan','+886','TW'),
	(214,'Tajikistan','+992','TJ'),
	(215,'Tanzania, United Republic of Tanzania','+255','TZ'),
	(216,'Thailand','+66','TH'),
	(217,'Timor-Leste','+670','TL'),
	(218,'Togo','+228','TG'),
	(219,'Tokelau','+690','TK'),
	(220,'Tonga','+676','TO'),
	(221,'Trinidad and Tobago','+1868','TT'),
	(222,'Tunisia','+216','TN'),
	(223,'Turkey','+90','TR'),
	(224,'Turkmenistan','+993','TM'),
	(225,'Turks and Caicos Islands','+1649','TC'),
	(226,'Tuvalu','+688','TV'),
	(227,'Ukraine','+380','UA'),
	(228,'Uganda','+256','UG'),
	(229,'United Arab Emirates','+971','AE'),
	(230,'United Kingdom','+44','GB'),
	(231,'United States','+1','US'),
	(232,'Uruguay','+598','UY'),
	(233,'Uzbekistan','+998','UZ'),
	(234,'Vanuatu','+678','VU'),
	(235,'Vietnam','+84','VN'),
	(236,'Virgin Islands, British','+1284','VG'),
	(237,'Venezuela, Bolivarian Republic of Venezuela','+58','VE'),
	(238,'Virgin Islands, U.S.','+1340','VI'),
	(239,'Wallis and Futuna','+681','WF'),
	(240,'Yemen','+967','YE'),
	(241,'Zambia','+260','ZM'),
	(242,'Zimbabwe','+263','ZW');

/*!40000 ALTER TABLE `country_code` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table logfeepayer
# ------------------------------------------------------------

DROP TABLE IF EXISTS `logfeepayer`;

CREATE TABLE `logfeepayer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) DEFAULT NULL,
  `branch_uid` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



# Dump of table loginhistories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `loginhistories`;

CREATE TABLE `loginhistories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) DEFAULT NULL,
  `ipaddress` varchar(300) DEFAULT NULL,
  `deviceos` varchar(500) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `loginhistories` WRITE;
/*!40000 ALTER TABLE `loginhistories` DISABLE KEYS */;

INSERT INTO `loginhistories` (`id`, `createdat`, `updatedat`, `uid`, `ipaddress`, `deviceos`, `browser`, `country`, `status`)
VALUES
	(24,'2022-06-23 09:18:49',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(25,'2022-06-23 09:23:54',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(26,'2022-06-23 09:26:43',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(27,'2022-06-23 09:55:58',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(28,'2022-06-23 09:57:21',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(29,'2022-06-23 09:58:33',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(30,'2022-06-23 10:00:01',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(31,'2022-06-23 10:47:15',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(32,'2022-06-23 10:58:22',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(33,'2022-06-23 11:13:47',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(34,'2022-06-23 11:45:44',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(35,'2022-06-23 11:47:29',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(36,'2022-06-24 05:28:16',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(37,'2022-06-24 05:40:19',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(38,'2022-06-24 07:00:25',NULL,43,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(39,'2022-06-24 09:42:20',NULL,44,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(40,'2022-06-24 09:47:15',NULL,45,'121.134.16.118','Android / Linux','Chrome','KR','Gangnam-gu'),
	(41,'2022-06-24 09:55:41',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(42,'2022-06-24 09:56:38',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(43,'2022-06-24 10:04:55',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(44,'2022-06-27 03:33:06',NULL,47,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(45,'2022-06-27 03:36:33',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(46,'2022-06-27 03:41:29',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(47,'2022-06-27 03:42:39',NULL,48,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(48,'2022-06-27 03:47:46',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(49,'2022-06-27 04:01:29',NULL,31,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(50,'2022-06-27 04:01:51',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(51,'2022-06-27 04:03:17',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(52,'2022-06-27 04:03:43',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(53,'2022-06-27 04:04:49',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(54,'2022-06-27 04:05:01',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(55,'2022-06-27 04:05:40',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(56,'2022-06-27 04:06:06',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(57,'2022-06-27 04:07:56',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(58,'2022-06-27 04:08:37',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(59,'2022-06-27 04:09:10',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(60,'2022-06-27 04:11:26',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(61,'2022-06-27 04:11:53',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(62,'2022-06-27 04:12:09',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(63,'2022-06-27 04:12:39',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(64,'2022-06-27 04:14:22',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(65,'2022-06-27 04:15:08',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(66,'2022-06-27 04:15:23',NULL,31,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(67,'2022-06-27 04:39:36',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(68,'2022-06-27 04:40:10',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(69,'2022-06-27 04:51:46',NULL,53,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(70,'2022-06-27 04:59:51',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(71,'2022-06-27 05:00:03',NULL,54,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(72,'2022-06-27 05:00:18',NULL,55,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(73,'2022-06-27 05:00:36',NULL,56,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(74,'2022-06-27 05:24:58',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(75,'2022-06-27 05:42:03',NULL,58,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(76,'2022-06-27 05:44:13',NULL,59,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(77,'2022-06-27 05:44:41',NULL,59,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(78,'2022-06-27 06:08:12',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(79,'2022-06-27 06:08:40',NULL,59,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(80,'2022-06-27 07:57:41',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(81,'2022-06-27 08:45:04',NULL,35,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(82,'2022-06-27 08:46:39',NULL,60,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(83,'2022-06-27 08:52:20',NULL,60,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(84,'2022-06-27 08:55:48',NULL,61,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(85,'2022-06-27 08:57:44',NULL,62,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(86,'2022-06-27 08:58:00',NULL,62,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(87,'2022-06-27 08:59:43',NULL,62,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(88,'2022-06-27 09:07:37',NULL,64,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(89,'2022-06-27 09:08:04',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(90,'2022-06-27 09:13:46',NULL,31,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(91,'2022-06-27 09:15:30',NULL,31,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(92,'2022-06-27 09:59:10',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(93,'2022-06-27 10:25:31',NULL,65,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(94,'2022-06-27 10:32:47',NULL,65,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(95,'2022-06-27 10:45:28',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(96,'2022-06-27 11:30:06',NULL,66,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(97,'2022-06-27 11:30:36',NULL,67,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(98,'2022-06-27 11:32:05',NULL,68,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(99,'2022-06-27 11:34:38',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(100,'2022-06-27 11:42:32',NULL,67,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(101,'2022-06-27 11:48:41',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(102,'2022-06-27 11:54:55',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(103,'2022-06-27 11:56:21',NULL,69,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(104,'2022-06-27 11:57:13',NULL,68,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(105,'2022-06-27 12:22:35',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(106,'2022-06-27 12:28:33',NULL,46,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(107,'2022-06-27 15:00:14',NULL,69,'180.64.75.100','Microsoft Windows / Windows 10.0','Chrome','KR','Anyang-si'),
	(108,'2022-06-27 23:58:18',NULL,70,'117.111.17.150','iPhone / OS X','Safari','KR','Gwanak-gu'),
	(109,'2022-06-28 01:28:29',NULL,31,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(110,'2022-06-28 01:28:53',NULL,70,'110.70.15.40','iPhone / OS X','Safari','KR','Seoul'),
	(111,'2022-06-28 01:31:56',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(112,'2022-06-28 01:48:48',NULL,70,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(113,'2022-06-28 02:47:47',NULL,45,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(114,'2022-06-28 02:49:25',NULL,31,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(115,'2022-06-28 03:42:58',NULL,69,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(116,'2022-06-28 05:26:44',NULL,74,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(117,'2022-06-28 05:45:11',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(118,'2022-06-28 06:23:22',NULL,81,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(119,'2022-06-28 06:36:41',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(120,'2022-06-28 06:57:22',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(121,'2022-06-28 07:06:46',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(122,'2022-06-28 07:21:57',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(123,'2022-06-28 07:26:45',NULL,84,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(124,'2022-06-28 09:16:49',NULL,85,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(125,'2022-06-28 09:37:47',NULL,85,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(126,'2022-06-28 09:38:39',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(127,'2022-06-28 09:43:42',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(128,'2022-06-28 10:41:04',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(129,'2022-06-28 10:42:31',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(130,'2022-06-29 00:52:26',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(131,'2022-06-29 03:07:38',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(132,'2022-06-29 03:12:34',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(133,'2022-06-29 03:18:01',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(134,'2022-06-29 03:18:04',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(135,'2022-06-29 03:20:12',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(136,'2022-06-29 03:21:23',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(137,'2022-06-29 03:25:08',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(138,'2022-06-29 03:50:24',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(139,'2022-06-29 05:35:00',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(140,'2022-06-29 05:38:54',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(141,'2022-06-29 07:30:50',NULL,87,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(142,'2022-06-29 10:58:49',NULL,86,'211.234.181.82','Apple Mac / OS X','Chrome','KR',''),
	(143,'2022-06-29 10:59:13',NULL,86,'211.234.181.82','Apple Mac / OS X','Chrome','KR',''),
	(144,'2022-06-29 10:59:39',NULL,86,'211.234.181.82','Apple Mac / OS X','Chrome','KR',''),
	(145,'2022-06-30 00:52:56',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(146,'2022-06-30 00:53:10',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(147,'2022-06-30 00:55:13',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(148,'2022-06-30 01:06:11',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(149,'2022-06-30 01:08:55',NULL,94,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(150,'2022-06-30 01:16:20',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(151,'2022-06-30 02:10:55',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(152,'2022-06-30 02:11:48',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(153,'2022-06-30 03:22:10',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(154,'2022-06-30 03:22:30',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(155,'2022-06-30 03:26:13',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(156,'2022-06-30 03:39:54',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(157,'2022-06-30 03:40:09',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(158,'2022-06-30 03:41:06',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(159,'2022-06-30 03:41:48',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(160,'2022-06-30 03:42:58',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(161,'2022-06-30 03:45:45',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(162,'2022-06-30 03:46:24',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(163,'2022-06-30 03:47:18',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(164,'2022-06-30 03:48:50',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(165,'2022-06-30 03:50:45',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(166,'2022-06-30 03:51:23',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(167,'2022-06-30 03:52:55',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(168,'2022-06-30 03:56:07',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(169,'2022-06-30 03:59:53',NULL,96,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(170,'2022-06-30 04:04:01',NULL,97,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(171,'2022-06-30 04:05:38',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(172,'2022-06-30 04:06:36',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(173,'2022-06-30 04:06:53',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(174,'2022-06-30 04:07:49',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(175,'2022-06-30 04:08:36',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(176,'2022-06-30 04:10:54',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(177,'2022-06-30 04:11:08',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(178,'2022-06-30 04:11:26',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(179,'2022-06-30 04:11:42',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(180,'2022-06-30 04:14:00',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(181,'2022-06-30 04:14:15',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(182,'2022-06-30 04:15:37',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(183,'2022-06-30 04:16:10',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(184,'2022-06-30 04:16:59',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(185,'2022-06-30 04:17:13',NULL,98,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(186,'2022-06-30 04:18:50',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(187,'2022-06-30 04:19:35',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(188,'2022-06-30 04:21:23',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(189,'2022-06-30 04:26:12',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(190,'2022-06-30 04:28:26',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(191,'2022-06-30 04:28:49',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(192,'2022-06-30 04:29:18',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(193,'2022-06-30 04:30:06',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(194,'2022-06-30 04:32:19',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(195,'2022-06-30 04:32:38',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(196,'2022-06-30 04:33:05',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(197,'2022-06-30 04:33:10',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(198,'2022-06-30 04:33:18',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(199,'2022-06-30 04:33:20',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(200,'2022-06-30 04:34:13',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(201,'2022-06-30 04:34:33',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(202,'2022-06-30 04:35:10',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(203,'2022-06-30 04:37:28',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(204,'2022-06-30 04:39:11',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(205,'2022-06-30 04:39:24',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(206,'2022-06-30 04:42:56',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(207,'2022-06-30 04:43:06',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(208,'2022-06-30 04:44:56',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(209,'2022-06-30 04:47:17',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(210,'2022-06-30 04:47:27',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(211,'2022-06-30 04:50:14',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(212,'2022-06-30 05:03:25',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(213,'2022-06-30 05:08:44',NULL,94,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(214,'2022-06-30 05:33:14',NULL,87,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(215,'2022-06-30 05:56:45',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(216,'2022-06-30 06:56:08',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(217,'2022-06-30 07:50:02',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(218,'2022-06-30 09:29:08',NULL,101,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(219,'2022-06-30 09:29:08',NULL,101,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(220,'2022-06-30 09:40:16',NULL,105,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(221,'2022-06-30 09:40:16',NULL,105,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(222,'2022-06-30 09:47:16',NULL,107,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(223,'2022-06-30 09:47:16',NULL,107,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(224,'2022-06-30 09:51:18',NULL,110,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(225,'2022-06-30 09:51:18',NULL,110,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(226,'2022-07-01 00:37:05',NULL,87,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(227,'2022-07-01 05:40:10',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(228,'2022-07-01 09:57:32',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(229,'2022-07-03 02:58:36',NULL,87,'118.33.44.60','Microsoft Windows / Windows 10.0','Chrome','KR','Seoul'),
	(230,'2022-07-04 00:18:31',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(231,'2022-07-04 00:21:22',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(232,'2022-07-04 00:24:04',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(233,'2022-07-04 01:23:22',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(234,'2022-07-04 02:09:41',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(235,'2022-07-04 02:10:36',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(236,'2022-07-04 03:28:56',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(237,'2022-07-04 03:35:40',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(238,'2022-07-04 03:37:05',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(239,'2022-07-04 03:37:24',NULL,95,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(240,'2022-07-04 03:45:59',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(241,'2022-07-04 04:07:58',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(242,'2022-07-04 04:25:30',NULL,81,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(243,'2022-07-04 04:26:40',NULL,81,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(244,'2022-07-04 04:33:43',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(245,'2022-07-04 04:33:50',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(246,'2022-07-04 07:13:32',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(247,'2022-07-04 07:30:13',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(248,'2022-07-05 02:01:08',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(249,'2022-07-05 02:01:08',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(250,'2022-07-05 02:01:41',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(251,'2022-07-05 02:02:06',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(252,'2022-07-05 02:02:50',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(253,'2022-07-05 02:03:40',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(254,'2022-07-05 02:05:39',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(255,'2022-07-05 02:05:49',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(256,'2022-07-05 02:06:33',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(257,'2022-07-05 02:08:35',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(258,'2022-07-05 02:10:21',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(259,'2022-07-05 02:11:56',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(260,'2022-07-05 02:12:07',NULL,81,'121.134.16.118','unknown / unknown','PostmanRuntime','KR','Gangnam-gu'),
	(261,'2022-07-05 02:13:18',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(262,'2022-07-05 02:15:45',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(263,'2022-07-05 02:31:17',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(264,'2022-07-05 04:39:40',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(265,'2022-07-05 04:40:37',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(266,'2022-07-05 04:40:59',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(267,'2022-07-05 04:41:34',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(268,'2022-07-05 04:54:00',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(269,'2022-07-05 05:05:57',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(270,'2022-07-05 05:06:22',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(271,'2022-07-05 05:06:27',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(272,'2022-07-05 05:11:44',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(273,'2022-07-05 05:14:29',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(274,'2022-07-05 05:26:24',NULL,99,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(275,'2022-07-05 06:40:43',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Edge','KR','Daegu'),
	(276,'2022-07-05 06:44:21',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(277,'2022-07-05 07:01:04',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(278,'2022-07-05 07:04:10',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(279,'2022-07-05 07:15:12',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(280,'2022-07-05 07:21:17',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(281,'2022-07-05 07:22:54',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(282,'2022-07-05 07:25:51',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(283,'2022-07-05 07:27:47',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(284,'2022-07-05 07:28:10',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(285,'2022-07-05 07:29:37',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(286,'2022-07-05 07:31:50',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(287,'2022-07-05 07:32:22',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(288,'2022-07-05 07:32:36',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(289,'2022-07-05 07:34:44',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(290,'2022-07-05 07:35:35',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(291,'2022-07-05 07:36:17',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(292,'2022-07-05 07:37:15',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(293,'2022-07-05 07:37:27',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(294,'2022-07-05 07:48:13',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(295,'2022-07-05 08:16:16',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(296,'2022-07-05 08:27:13',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(297,'2022-07-05 08:30:12',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(298,'2022-07-05 08:30:36',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(299,'2022-07-05 08:48:58',NULL,112,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(300,'2022-07-05 08:49:23',NULL,112,'121.134.16.118','Android / Linux','Chrome','KR','Gangnam-gu'),
	(301,'2022-07-05 09:12:27',NULL,98,'223.38.47.47','iPhone / OS X','Safari','KR','Seoul'),
	(302,'2022-07-06 01:44:07',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(303,'2022-07-06 04:53:30',NULL,87,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(304,'2022-07-06 04:55:06',NULL,87,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(305,'2022-07-06 04:58:41',NULL,87,'210.182.168.10','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(306,'2022-07-06 08:11:03',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(307,'2022-07-06 09:11:45',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(308,'2022-07-06 09:21:45',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(309,'2022-07-06 09:22:30',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(310,'2022-07-06 09:22:46',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(311,'2022-07-06 09:24:27',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(312,'2022-07-06 09:24:49',NULL,86,'121.134.16.118','Apple Mac / OS X','Chrome','KR','Gangnam-gu'),
	(313,'2022-07-07 06:38:39',NULL,95,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(314,'2022-07-07 06:38:53',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(315,'2022-07-07 06:39:47',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(316,'2022-07-07 06:40:35',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(317,'2022-07-07 06:41:57',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(318,'2022-07-07 06:42:45',NULL,95,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(319,'2022-07-07 06:43:10',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(320,'2022-07-07 06:47:25',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(321,'2022-07-07 06:47:52',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(322,'2022-07-07 06:52:55',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(323,'2022-07-07 06:56:55',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(324,'2022-07-07 06:57:24',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(325,'2022-07-07 06:58:17',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(326,'2022-07-07 07:02:05',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(327,'2022-07-07 07:03:03',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(328,'2022-07-07 07:05:23',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(329,'2022-07-07 07:07:56',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(330,'2022-07-07 07:08:08',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(331,'2022-07-07 07:16:03',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(332,'2022-07-07 07:16:30',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(333,'2022-07-07 07:17:40',NULL,84,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(334,'2022-07-07 07:17:52',NULL,113,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(335,'2022-07-07 07:18:10',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(336,'2022-07-07 07:18:59',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(337,'2022-07-07 07:24:04',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(338,'2022-07-07 07:24:42',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(339,'2022-07-07 07:25:36',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(340,'2022-07-07 07:49:50',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(341,'2022-07-07 07:51:46',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(342,'2022-07-07 08:29:53',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(343,'2022-07-07 08:30:45',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(344,'2022-07-07 08:32:56',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(345,'2022-07-07 08:34:18',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(346,'2022-07-07 08:37:35',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(347,'2022-07-07 08:38:35',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(348,'2022-07-07 08:49:32',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(349,'2022-07-07 08:50:13',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(350,'2022-07-07 08:52:55',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(351,'2022-07-07 09:12:50',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(352,'2022-07-07 09:12:52',NULL,81,'180.64.75.100','Microsoft Windows / Windows 10.0','Chrome','KR','Anyang-si'),
	(353,'2022-07-07 09:14:10',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(354,'2022-07-08 00:47:41',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(355,'2022-07-08 03:14:28',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(356,'2022-07-08 03:14:44',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(357,'2022-07-08 03:21:01',NULL,81,'118.235.5.119','Microsoft Windows / Windows 10.0','Chrome','KR',''),
	(358,'2022-07-08 06:17:23',NULL,114,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(359,'2022-07-08 06:19:01',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(360,'2022-07-08 06:26:59',NULL,114,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(361,'2022-07-08 06:27:29',NULL,81,'175.201.254.159','Android / Linux','Chrome','KR','Daegu'),
	(362,'2022-07-08 06:53:10',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(363,'2022-07-08 06:59:34',NULL,99,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(364,'2022-07-08 07:55:24',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(365,'2022-07-08 08:33:26',NULL,81,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu'),
	(366,'2022-07-08 08:37:35',NULL,81,'175.201.254.159','Microsoft Windows / Windows 10.0','Chrome','KR','Daegu'),
	(367,'2022-07-08 08:40:08',NULL,111,'121.134.16.118','Microsoft Windows / Windows 10.0','Chrome','KR','Gangnam-gu');

/*!40000 ALTER TABLE `loginhistories` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table referrals
# ------------------------------------------------------------

DROP TABLE IF EXISTS `referrals`;

CREATE TABLE `referrals` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `referer_uid` int(11) unsigned NOT NULL,
  `referral_uid` int(11) unsigned NOT NULL,
  `level` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_users_referer` (`referer_uid`),
  KEY `FK_users_referral` (`referral_uid`),
  CONSTRAINT `FK_users_referer` FOREIGN KEY (`referer_uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_users_referral` FOREIGN KEY (`referral_uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `referrals` WRITE;
/*!40000 ALTER TABLE `referrals` DISABLE KEYS */;

INSERT INTO `referrals` (`id`, `createdat`, `updatedat`, `referer_uid`, `referral_uid`, `level`, `active`)
VALUES
	(10,'2022-06-28 07:17:35',NULL,82,84,NULL,NULL),
	(11,'2022-07-07 06:39:47',NULL,84,113,NULL,NULL),
	(12,'2022-07-07 07:18:59',NULL,81,114,NULL,NULL);

/*!40000 ALTER TABLE `referrals` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table settings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `settings`;

CREATE TABLE `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(300) DEFAULT NULL,
  `value` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;

INSERT INTO `settings` (`id`, `name`, `value`)
VALUES
	(1,'ADMINADDR','0xEED598eaEa3a78215Ae3FD0188C30243f48C23a5'),
	(2,'ADMINPK','57da53bb6cc6970f09956b8c1fa95eb9cf0fc6311a9751326029264ddaf29968');

/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table transactions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) unsigned NOT NULL,
  `amount` bigint(20) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `typestr` varchar(80) DEFAULT NULL,
  `status` tinyint(3) DEFAULT NULL,
  `verifier` int(11) DEFAULT NULL,
  `target_uid` int(11) unsigned DEFAULT NULL,
  `txhash` varchar(300) DEFAULT NULL,
  `localeAmount` bigint(20) DEFAULT NULL,
  `localeUnit` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `cardNum` varchar(100) DEFAULT NULL,
  `bankCode` varchar(100) DEFAULT NULL,
  `bankName` varchar(100) DEFAULT NULL,
  `checked` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `txhash` (`txhash`),
  KEY `FK_users_transactions_uid` (`uid`),
  CONSTRAINT `FK_users_transactions_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;

INSERT INTO `transactions` (`id`, `createdat`, `updatedat`, `uid`, `amount`, `unit`, `type`, `typestr`, `status`, `verifier`, `target_uid`, `txhash`, `localeAmount`, `localeUnit`, `name`, `cardNum`, `bankCode`, `bankName`, `checked`)
VALUES
	(62,'2022-07-05 04:19:52','2022-07-05 08:29:29',99,100000000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x4234060a4c35dc4845b01facab2935245842b33c6935878c4867e36c50614560',NULL,NULL,NULL,NULL,NULL,NULL,1),
	(63,'2022-07-05 08:24:50','2022-07-05 08:33:30',111,10000,'USDT',1,'DEPOSIT',0,NULL,NULL,'0x940e44b081403b0acd33cd84d6f995ae87f037abf25d978d292d98b59362093d',NULL,NULL,NULL,NULL,NULL,NULL,1),
	(64,'2022-07-05 08:27:27','2022-07-05 08:30:44',99,100000000,'USDT',0,'WITHDRAW',1,NULL,NULL,'0xb0e4673c52383f297734c17915097608f3babcf8c6e99b4b1220c136bdaaa67e',100000000,'USDT',NULL,NULL,NULL,NULL,1),
	(65,'2022-07-05 08:29:41','2022-07-05 08:35:51',99,100000000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0xc08352f71c0319f82041a46b9063c0821434a694756aa2ae564064c8b6d2c44b',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(66,'2022-07-05 08:30:56',NULL,99,100000000,'USDT',1,'DEPOSIT',0,NULL,NULL,'0x6cd876bc80fee2d8d8eb7c724922cbcea92b0ca8b0227734a2097fc607c6cac7',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(67,'2022-07-05 08:35:54','2022-07-05 08:35:55',99,100000000,'USDT',0,'WITHDRAW',1,NULL,NULL,'0xf22243bc424a2a2018bc29a4e9cd2ff1681f8a44f03b47ea412f31f0f6846438',100000000,'USDT',NULL,NULL,NULL,NULL,0),
	(68,'2022-07-05 08:36:10','2022-07-05 08:36:11',99,100000000,'USDT',0,'WITHDRAW',1,NULL,NULL,'0xa577a85f00e7a6a63935ae855fc55b20eb4530bb2e0c586ad023cfc06a21e6ba',100000000,'USDT',NULL,NULL,NULL,NULL,0),
	(69,'2022-07-05 08:37:15','2022-07-05 08:55:34',111,1000000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x481264d4dc47670e5377587e388f8b935f6255cea83ae2663ebe199efbd836a8',NULL,NULL,NULL,NULL,NULL,NULL,1),
	(70,'2022-07-05 08:37:49','2022-07-05 08:37:49',111,200000,'USDT',0,'WITHDRAW',1,NULL,NULL,'0xa45fd80c0d003e207139491d7469625be1528975aa6c3884a5369182feef7204',200000,'USDT',NULL,NULL,NULL,NULL,0),
	(71,'2022-07-05 09:50:08','2022-07-05 09:51:09',112,100000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x8943a3a6eedca46a774c35a02b8a2bcbf94724ba1dafccf38ceb3a5b29d99367',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(72,'2022-07-05 09:50:08','2022-07-05 09:51:09',112,100000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0xcc24b9f469bfa64a653f3cd5071ac4dc6d78c6d4602e58024eaca7f8e2fc4d66',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(77,'2022-07-05 09:50:13','2022-07-05 09:51:14',112,100000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x0654b5beedaffbd27f918b3d491e57179cf3a40e8343c00a91c8787c5611b244',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(78,'2022-07-05 09:50:13','2022-07-05 09:51:14',112,100000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x93c8829019b73718dc522b19376416de7ed959a46461b234761f797867920366',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(79,'2022-07-07 07:19:21','2022-07-08 08:14:40',112,NULL,NULL,2,'DEPOSIT',1,81,81,'0x761ebafcb94ce0dbfe03de80708ac7bf59ffc95ee248d1dec37168055a9c75ef',100000000,'CNY','','','','',1),
	(80,'2022-07-07 07:34:56','2022-07-08 08:11:14',114,NULL,NULL,2,'DEPOSIT',1,81,81,'0xdacccf0b4ee9a2e643b56a87901a60304e40bf3f5101ef896e9f550f7f252993',100000000,'CNY','test','123','123','123',1),
	(81,'2022-07-07 07:35:42','2022-07-08 08:34:28',114,NULL,NULL,2,'DEPOSIT',1,81,81,'0x42aee45334d4f7dfa2d6ce3056eb058480f23f626e85f6ed8e1923b3a7b3feba',100000000,'CNY','test','123','123','test',1),
	(82,'2022-07-07 08:30:33','2022-07-07 08:38:10',114,NULL,NULL,2,'DEPOSIT',0,NULL,81,NULL,100000000,'CNY','TestName','12345678','001','TestBank',1),
	(83,'2022-07-07 08:38:25','2022-07-08 06:01:29',114,NULL,NULL,2,'DEPOSIT',1,81,81,'0x0f24cd76aa78723800fa7558f75c4cfd0943184599736de67c558453db9bbb64',100000000,'CNY','testName','12345678','001','TestBank',1),
	(84,'2022-07-07 08:49:51','2022-07-08 06:17:26',114,NULL,NULL,2,'DEPOSIT',1,81,81,'0xcba86428bb7ad9cc2706583087f83a0381c2d61bb9a47d733116cbefb5d32a2d',100000000,'CNY','testName','12345678','001','testBank',1),
	(85,'2022-07-08 06:17:47','2022-07-08 06:57:32',114,NULL,NULL,2,'DEPOSIT',1,81,81,'0xc278074179052af15ffdd2a6bb2f717be14e8d0452dcc4c4edf01ee3c0b365d4',100000000,'CNY','testName','12345678','001','TestBank',1),
	(86,'2022-07-08 06:25:37','2022-07-08 06:26:39',81,100000000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x23df515c5b1d12bc35e7ff401fe422ee7ddffa27aa1f2048358130d04a48a0da',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(87,'2022-07-08 06:27:15',NULL,114,NULL,NULL,2,'DEPOSIT',0,NULL,81,NULL,100000000,'CNY','testName','123456','001','TestBank',0),
	(88,'2022-07-08 06:27:17',NULL,114,NULL,NULL,2,'DEPOSIT',0,NULL,81,NULL,100000000,'CNY','testName','123456','001','TestBank',0),
	(89,'2022-07-08 06:29:37',NULL,81,100000000,'USDT',1,'DEPOSIT',0,NULL,NULL,'0x90009df2bec6ed85a36de11d6213304b2e23385a6aa272ad2720d5bd65470c01',NULL,NULL,NULL,NULL,NULL,NULL,0),
	(92,'2022-07-08 06:45:14','2022-07-08 06:47:16',81,100000000,'USDT',1,'DEPOSIT',1,NULL,NULL,'0x94c9782d144972840dfa98f7f0bb8f03d0ce89dfe278a6792457465484b1d34d',NULL,NULL,NULL,NULL,NULL,NULL,0);

/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `email` varchar(200) DEFAULT NULL,
  `countryNum` varchar(11) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `oauth_type` int(11) DEFAULT NULL,
  `oauth_id` varchar(200) DEFAULT NULL,
  `referercode` varchar(100) DEFAULT 'MD5(3)',
  `uuid` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 0,
  `isadmin` int(3) unsigned DEFAULT 0,
  `isbranch` tinyint(1) DEFAULT 0,
  `mailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `phoneVerified` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `password` varchar(300) DEFAULT NULL,
  `profileimage` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `oauth` (`oauth_type`,`oauth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `createdat`, `updatedat`, `email`, `countryNum`, `phone`, `firstname`, `lastname`, `oauth_type`, `oauth_id`, `referercode`, `uuid`, `level`, `isadmin`, `isbranch`, `mailVerified`, `phoneVerified`, `active`, `password`, `profileimage`)
VALUES
	(81,'2022-06-28 05:39:33','2022-07-08 03:18:53','test0000@test.com',NULL,NULL,NULL,NULL,NULL,NULL,'43ec517d68',NULL,0,1,1,0,0,1,'Test0000',NULL),
	(82,'2022-06-28 06:24:35','2022-06-28 06:52:07','quwue@ajsiekw.com',NULL,NULL,NULL,NULL,NULL,NULL,'9778d5d219',NULL,0,1,0,0,0,1,'sjdbxhH1?73859',NULL),
	(84,'2022-06-28 07:17:35','2022-06-28 07:17:35','test0002@test.com',NULL,NULL,NULL,NULL,NULL,NULL,'68d30a9594',NULL,0,0,1,0,0,1,'Test0002',NULL),
	(86,'2022-06-28 09:38:39','2022-06-28 09:38:39','shpl9708@gmail.com',NULL,NULL,'Sanghun','Lee',0,'108301795378080166125','93db85ed90',NULL,0,0,0,0,0,1,NULL,'https://lh3.googleusercontent.com/a-/AOh14GhDVvx8r4rVDSwoowYJGRGsCIcEwpG0Bs7iKV0HZg=s96-c'),
	(87,'2022-06-29 02:36:52','2022-06-29 02:36:52','lovingkjk2@naver.com',NULL,NULL,NULL,NULL,NULL,NULL,'c7e1249ffc',NULL,0,0,0,0,0,1,'@Rlawhdrud83',NULL),
	(93,'2022-06-29 11:00:16','2022-06-29 11:00:16','qwerqwer@qwer.com',NULL,NULL,NULL,NULL,NULL,NULL,'98dce83da5',NULL,0,0,0,0,0,1,'qwer1234!@#QWE',NULL),
	(94,'2022-06-30 01:02:06','2022-06-30 01:02:06',NULL,'+82','0000000000',NULL,NULL,NULL,NULL,'f4b9ec30ad',NULL,0,0,0,0,0,1,'Test0000',NULL),
	(95,'2022-06-30 03:23:02','2022-06-30 03:23:02','test0001@test.com',NULL,NULL,NULL,NULL,NULL,NULL,'812b4ba287',NULL,0,0,0,0,0,1,'Test0001',NULL),
	(98,'2022-06-30 04:17:12','2022-06-30 04:17:12','litriggy@gmail.com',NULL,NULL,'상훈','이',0,'108305108799824112440','ed3d2c2199',NULL,0,0,0,0,0,1,NULL,'https://lh3.googleusercontent.com/a-/AOh14Gj9RsWaEXIz4tArNNIoe-zrS9PS2hNXNLa4i38F=s96-c'),
	(99,'2022-06-30 04:32:18','2022-06-30 04:32:19','bakujin.dev@gmail.com',NULL,NULL,'우진','박',0,'105040241919654193339','ac627ab1cc',NULL,0,0,0,0,0,1,NULL,'https://lh3.googleusercontent.com/a/AATXAJwJbcFKcMYTyzVcgS8bclHoNjtrlmhqHllNz3y9=s96-c'),
	(100,'2022-06-30 09:11:34','2022-06-30 09:11:34','asdf@asdf.com',NULL,NULL,NULL,NULL,NULL,NULL,'f899139df5',NULL,0,0,0,0,0,1,'asdfQWER123!@#',NULL),
	(101,'2022-06-30 09:29:06','2022-06-30 09:29:07','asdjfknk@jkansdkjf.com',NULL,NULL,NULL,NULL,NULL,NULL,'38b3eff8ba',NULL,0,0,0,0,0,1,'!234Qwerkvkm',NULL),
	(105,'2022-06-30 09:40:15','2022-06-30 09:40:15','qwerasdf@qwerasdf.com',NULL,NULL,NULL,NULL,NULL,NULL,'65b9eea6e1',NULL,0,0,0,0,0,1,'Qwer!2345',NULL),
	(108,'2022-06-30 09:47:16','2022-06-30 09:47:16','asdfwet@awetgadf.com',NULL,NULL,NULL,NULL,NULL,NULL,'a3c65c2974',NULL,0,0,0,0,0,1,'Q124214werq',NULL),
	(110,'2022-06-30 09:51:17','2022-06-30 09:51:17','1234regjan@jansfkjgas.com',NULL,NULL,NULL,NULL,NULL,NULL,'5f93f98352',NULL,0,0,0,0,0,1,'askjdfnaskjdfnQWQJNEJ123123',NULL),
	(111,'2022-07-04 01:23:22','2022-07-04 01:23:22','sein2958@gmail.com',NULL,NULL,'세인','황',0,'112474918997699588739','698d51a19d',NULL,0,0,0,0,0,1,NULL,'https://lh3.googleusercontent.com/a/AATXAJwtROH5ouPVgigDuoYX0lGlAqqYY_U6fAQe9fQo=s96-c'),
	(112,'2022-07-05 08:48:58','2022-07-05 08:48:58',NULL,'+82','1050650806',NULL,NULL,NULL,NULL,'7f6ffaa6bb',NULL,0,0,0,0,0,1,'IOImmoj1987',NULL),
	(113,'2022-07-07 06:39:47','2022-07-07 06:39:47','test0003@test.com',NULL,NULL,NULL,NULL,NULL,NULL,'73278a4a86',NULL,0,0,0,0,0,1,'Test0003',NULL),
	(114,'2022-07-07 07:18:59','2022-07-07 07:18:59','test0004@test.com',NULL,NULL,NULL,NULL,NULL,NULL,'5fd0b37cd7',NULL,0,0,1,0,0,1,'Test0004',NULL);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table userwallets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `userwallets`;

CREATE TABLE `userwallets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) unsigned NOT NULL,
  `walletaddress` varchar(300) DEFAULT NULL,
  `privatekey` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_users_wallet` (`uid`),
  CONSTRAINT `FK_users_wallet` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `userwallets` WRITE;
/*!40000 ALTER TABLE `userwallets` DISABLE KEYS */;

INSERT INTO `userwallets` (`id`, `createdat`, `updatedat`, `uid`, `walletaddress`, `privatekey`)
VALUES
	(2,'2022-06-28 05:39:33',NULL,81,'0xe8FB222c1e1B824e4e2FB60040bd8fDB2000dC48','0x173dbea0846c87c7d29bb3b78ee51a034c20b5c57297cdc15c2fb1e97a93069b'),
	(3,'2022-06-28 06:24:36',NULL,82,'0x382C1bc258FE0873EFdD6d6F4E47264C213c99BE','0x9f8d7a8b3d3f1483a2028ca8a5c636df6a499bc085ffe4a5e29462cd4f4fc3f4'),
	(5,'2022-06-28 07:17:35',NULL,84,'0x73b1eD802f10306720CBB1938faB78ef16e18fAE','0x2bd63000926d97fb0ea8dbc223d8895770e7106b374c19f490911d3ec82db853'),
	(6,'2022-06-28 09:43:42',NULL,86,'0x717616F9cd589F5d09F5B0213Af0FAA5F657c5Ed','0x06d800e72d3260815e4c69da23b82a477c4b657c8b07502cf975cbb549264ac4'),
	(9,'2022-06-29 02:36:53',NULL,87,'0xB1a552E0b260F24fD4c064a8A6e6C74f759180c2','0x626290374ddfe0bae7e6021bcd7387c53f6e29cd3e9b53334f5e83264c863805'),
	(29,'2022-06-29 11:00:17',NULL,93,'0xBF108B68E05f99FC1A748C4971a1e2936D4cB2cF','0x9e97b882b5515270c0a6478d5b0712b7776c22da3f96a7a36d1284b9a6c4ca43'),
	(30,'2022-06-30 01:02:06',NULL,94,'0x7C780D38B997dc1AB6b473A853211c7D83d2CB06','0xb1ba62720f6c47f669eb9c8a1ceb4721871afdd406498c2e450b442e6f7cd95d'),
	(31,'2022-06-30 03:23:02',NULL,95,'0x1F2AcbB711bd0e849e335a38fE3A7699b24ddE02','0x8d94fb9665a0eafc95c4ef8ea8ffe8bb2baa7959a4ff11c393119190cef951b1'),
	(34,'2022-06-30 04:17:13',NULL,98,'0x6c787bc76Ca43dc08178e3f74122A0447F1431b8','0xb781e1a115f0bea53207ed77644d849134754715e71331b3c73c52d7366444d6'),
	(35,'2022-06-30 04:32:19',NULL,99,'0xD1DeC4DDdAC305B68a6b260a5d203132413a4c10','0x1e347f7ea05d98ff633c1cca490f78846ca12078c7d8f1b7db5a6ff948571598'),
	(36,'2022-06-30 09:11:35',NULL,100,'0x0B1771381b3e5175a07cd810823544B1893E3638','0x8e3b2722c548862954c2e2c6f86fafcb1a5b79e9a50dc2a65237e2ec64e9b1fd'),
	(37,'2022-06-30 09:29:07',NULL,101,'0x12058AaC1Ff36E8a01DE5F74f784a271E59A2966','0x48187bcb93f1e991c73847bdebc03c56f19e1b45feeddfca803e055d01787a8e'),
	(38,'2022-06-30 09:29:07',NULL,101,'0x294015D2d3dE8C3723eAc1bc3666e3CBF62723F8','0x6948dfe4a19e8604b301b06696f6cafd7fa1497981be2199c2f0b32c4d02958b'),
	(39,'2022-06-30 09:40:15',NULL,105,'0xbA35AdB3cd140523D9F761f504C96eE25c89A0FE','0xb19a022ae9b7970eedea7e79eb1aa1278b2778e8bf3604981db50f04ea892b54'),
	(40,'2022-06-30 09:40:16',NULL,105,'0xD903cAF4485fC1bADc2675Dbd67Ab3464DCCa92f','0xddc9e9437cea43def4af9c1a74882a17f20313d2cce4b9098d3620952f661d64'),
	(43,'2022-06-30 09:51:18',NULL,110,'0x050a550F5B6103d1f3d81f832f62B7D20Dd3Fac2','0x858cfe79738d01e1f9ab97a9bd781902a28fa2b716ce40d6a9e46c4079e5ebf5'),
	(44,'2022-07-04 01:23:22',NULL,111,'0x60D28ed4c59A22C76B5C3eBF0277814156eFD47E','0x32e73889bd9a98a48076cc9a2c4b6481fa890864f74c52fed62947b4bf26582b'),
	(45,'2022-07-05 08:48:58',NULL,112,'0x9fcA842c84535253F3a8e7572d4D27051149617E','0xec5b36e8991aa2b133610785eebfff9bd15cae01e3703bfbd4ca9e428fc2b4b6'),
	(46,'2022-07-07 06:39:47',NULL,113,'0xd548724397E4f52c9f2e36B19376a9E9E17371f8','0x1db56aded29726d7cea5ed93984db5fe33a23dddc8e73d2c73f6a990bdf9f43c'),
	(47,'2022-07-07 07:18:59',NULL,114,'0x260902C6CeAB0e96E6b4029691c9c53d9Ea259D9','0x821f2d062db45876cdc726944042b8335c3e946a103004716bab842e7f3d8ea0');

/*!40000 ALTER TABLE `userwallets` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table verifycode
# ------------------------------------------------------------

DROP TABLE IF EXISTS `verifycode`;

CREATE TABLE `verifycode` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `createdat` datetime DEFAULT current_timestamp(),
  `updatedat` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `uid` int(11) unsigned NOT NULL,
  `code` int(11) DEFAULT NULL,
  `expiry` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
