import WebSocket from 'ws';

const CHANNEL = 'handofblood';

const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

ws.on('open', () => {
	console.log('Connected to Twitch IRC');

	// Twitch allows anonymous login with "justinfan" usernames
	const username = 'justinfan' + Math.floor(Math.random() * 100000);

	ws.send('PASS SCHMOOPIIE'); // placeholder password for anonymous
	ws.send(`NICK ${username}`);
	ws.send(`JOIN #${CHANNEL}`);

	console.log(`Joined chat for #${CHANNEL} as ${username}`);
});

ws.on('message', (data) => {
	const message = data.toString();

	if (message.startsWith('PING')) {
		ws.send('PONG :tmi.twitch.tv');
		return;
	}

	const match = message.match(/^:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #\w+ :(.*)$/);
	if (match) {
		const [, user, text] = match;
		console.log(`${user}: ${text}`);
	} else {
		console.log(message);
	}
});

ws.on('close', () => console.log('Disconnected'));
