var connect = require('connect');
var serveStatic = require('serve-static');
console.log("Server listening on port 8080");
var server = connect();

server.use('/api/customers', function (req, res, next) {
	res.end(JSON.stringify([
		{ id: 0, name: 'Jeremy', total: 149 },
		{ id: 1, name: 'Yohan', total: 79 },
		{ id: 2, name: 'Guillaume', total: 299 }
	]));
});


server.use(serveStatic("../client")).listen(8080);