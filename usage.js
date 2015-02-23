var hose = require('cw-hose');

var src = new hose.Source({
	LogGroup: '',
	StartTime: new Date().getTime(),
	EndTime: null,
	LogStreamPrefix: '',
	PollInterval: 1000
});

src.on('logs', function(batch) {
	
});

src.on('error', function(error) {
	
});

src.Open();
