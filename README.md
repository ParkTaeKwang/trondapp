
## Tron API Server (express.js)

TronWeb API <-> nodejs <-> Contents 중계 역할을 하는 소스 .  
nodejs + express로 구현되어 있음 .  
test Demo 코드로 제작한것이고 실 운영시에는 꼭 https와 POST방식으로 운영하길 바람 .  

#### Reference

https://github.com/tronprotocol/tron-web
https://developers.tron.network/v3.0/reference#tronwebapi
https://shasta.tronscan.org/#/
https://medium.com/@kopi2642/25d38fced1a6

#### history

##### Development environment

    OS : Ubuntu 18.04(ubuntu-18.04.1-desktop-amd64.iso)

    MariaDB : mariadb  Ver 15.1 Distrib 10.1.34-MariaDB, for debian-linux-gnu (x86_64) using r eadline 5.2

    VM : VirtualBox-5.1.38-122592-Win.exe


##### Clone tron-web repository

```bash
cd ~

mkdir project

cd project

git clone https://github.com/tronprotocol/tron-web

cd tron-web/
```

##### install node.js and npm

```bash
apt install curl

curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -

node -v

npm -v
```

##### install yarn

```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

apt-get update && sudo apt-get install yarn

yarn -v
 ```

##### how to build (yarn)
```bash
cd tron-web

yarn

yarn build -d
 ```

##### how to create express project

```bash
yarn global add express

yarn global add express-generator
 ```

##### yarn symbolic link
```bash
cd ~

mkdir bin

cd bin

ln -s /usr/share/yarn/bin/yarn
  ```

##### how to create project (myapp)
```bash
cd ~

cd project

express --view=pug myapp

cd myapp

yarn install

yarn add tronweb

yarn add mysql

yarn start
  ```

##### how to install mariadb

```bash
apt-get install mariadb-server

apt-get install mariadb-server-core

apt-get install mariadb-client
  ```



##### database schema

```sql
CREATE TABLE `transactionscan` (
  `idx` int(11) NOT NULL AUTO_INCREMENT,
  `from_address` varchar(100) NOT NULL COMMENT '보내는 사람 주소',
  `to_address` varchar(100) NOT NULL COMMENT '받는 사람  주소',
  `amount` bigint(20) NOT NULL COMMENT '양',
  `txid` varchar(150) NOT NULL COMMENT '트랜젝션 id',
  `regdate` datetime default current_timestamp,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='트랜젝션 조회 테이블';
```

```sql
MariaDB [tkpark]> desc transactionscan;
+--------------+--------------+------+-----+-------------------+----------------+
| Field        | Type         | Null | Key | Default           | Extra          |
+--------------+--------------+------+-----+-------------------+----------------+
| idx          | int(11)      | NO   | PRI | NULL              | auto_increment |
| from_address | varchar(100) | NO   |     | NULL              |                |
| to_address   | varchar(100) | NO   |     | NULL              |                |
| amount       | bigint(20)   | NO   |     | NULL              |                |
| txid         | varchar(150) | NO   |     | NULL              |                |
| regdate      | datetime     | YES  |     | CURRENT_TIMESTAMP |                |
+--------------+--------------+------+-----+-------------------+----------------+
```

##### how to use

move to myapp directory
```bash
yarn start
```

##### url guide

계좌신청
http://192.168.0.118:3000/createAccount/

잔액조회 지갑주소
http://192.168.0.118:3000/getBalance/지갑주소

송금
http://192.168.0.118:3000/sendToken?PK=개인키&value=수량&toAddress=지갑주소

PK, value, toAddress

트렌잭션 조회
http://192.168.0.118:3000/transactionview/지갑주소

조회된 트랜 젝션은 tronscan으로 조회 가능
트랜젝션 조회는 현재 TronWeb API함수가 업데이트로 인해 동작을 하지 않아/
송금한 txid를 DB에 넣고 조회하는 형식으로 구현
