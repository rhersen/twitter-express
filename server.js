var express = require('express');
var request = require('request');
var parser = require('./parser');

var app = express();

app.get('/tweets', function (req, res) {
    request({
            uri: 'https://api.twitter.com/1.1/statuses/user_timeline.json' +
               '?user_id=1841700720' +
               '&exclude_replies=true' +
               '&include_rts=false' +
               '&count=200' +
               '&since_id=446228899090137087' +
               '',
            headers: {
                authorization: "Bearer " + "AAAAAAAAAAAAAAAAAAAAACMAXQAAAAAAYw3Z1oZKNFz52BtTRYdtkfa8Iwc%3DRJihktYblAngUJ9jMdbFBemI1PQO9eDNxbK7tANe8w3r36jH1D"
            }},
        function (error, response, body) {
            res.setHeader('Content-Type', 'application/json');
            res.send(body);
        });
});

app.use(express.static(__dirname + '/public'));

var port = 3747;
app.listen(port);
console.log('Listening on port ' + port);
