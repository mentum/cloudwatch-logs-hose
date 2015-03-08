![Icon](https://raw.github.com/mentum/cloudwatch-logs-hose/master/images/icon.png)
# cloudwatch-logs-hose
Transforms a CloudWatch Logs Group into a streaming hose of events

## Get it
```npm install cloudwatch-logs-hose```

## Usage

```js
var hose = require('cloudwatch-logs-hose');

var src = new hose.Source({
	LogGroup: '/aws/lambda/MINUS-49dda359e9abcd4e180f73bd8ba7e2f9',
	aws: { region: 'us-west-2' }
});

src.on('logs', function(batch) {
	for(var i in batch) console.log('Log: ', batch[i].message.trim());
});

src.on('error', function(error) {
	console.log('Error: ', error);
});

src.open();
```

## Available commands

- ```Source.open()``` opens the hose, polling starts
- ```Source.close()``` closes the hose, polling stops
- ```Source.on('logs', fn)``` adds an event handler when a batch of logs is pulled
- ```Source.on('error', fn)``` adds an event handler when an error occurs

## Available ```Source``` Parameters
- ```LogGroup``` *Mandatory* / The AWS CloudWatch Log Group to poll
- ```StartTime``` *Optional* / Default to ```now``` / unix timestamp from where the logs should be pulled
- ```EndTime``` *Optional* / Default to ```null``` / unix timestamp from where the pulling should stop
- ```LogStreamPrefix``` *Optional* / Defaults to ```''``` / the prefix of the log streams to watch. `''` will match all streams
- ```PollInterval``` / *Optional* / Default to ```1000``` / milliseconds between each polling
- ```aws``` / *Mandatory* / the AWS Configuration. See [this](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html) for more information

	LogGroup: '/aws/lambda/MINUS-49dda359e9abcd4e180f73bd8ba7e2f9', // Mandatory
	StartTime: new Date().getTime(), // Optional
	EndTime: null, // Optional
	LogStreamPrefix: '', // Optional
	PollInterval: 1000, // Optional
	aws: { region: 'us-west-2' } // Mandatory
