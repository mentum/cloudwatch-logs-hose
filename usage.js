var hose = require('./index');

var src = new hose.Source({
	LogGroup: '/aws/lambda/MINUS-49dda359e9abcd4e180f73bd8ba7e2f9', // Mandatory
	StartTime: new Date().getTime(), // Optional
	EndTime: null, // Optional
	LogStreamPrefix: '', // Optional
	PollInterval: 1000, // Optional
	aws: { region: 'us-west-2' } // Mandatory
});

src.on('logs', function(batch) {
	for(var i in batch) console.log('Log: ', batch[i].message.trim());
});

src.on('error', function(error) {
	console.log('Error: ', error);
});

src.open();

setTimeout(function() {
	// close the hose after 1 min
	src.close(); 
}, 60 * 1000);
