// eslint-disable-next-line no-unused-vars
module.exports = (Discord, client, message) => {
	console.log('working bud!!');
	console.log(client.user);
	client.user.setPresence({ activity: { name: 'z!help' }, status: 'online' })
		.then(console.log)
		.catch(console.error);
};