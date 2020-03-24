function Player(discordUser, name = discordUser.username)  {
	this.name = name;
	this.discord = discordUser;
	this.role = null;
	this.roleState = null;
	this.state = {
		alive: true,
	};

	this.selectP = {
		isSelecting: false,
		options: [],
		onSelect: () => {},
		onSelectTimeout: null
	}
}

Player.prototype.select = function(options, duration = 30, defaultIndex = 0) {
	return new Promise(resolve => {
		this.selectP.isSelecting = true;
		this.selectP.options = options;
		this.selectP.onSelect = (index) => {
			resolve(index);
			this.selectP.isSelecting = false;
			if (this.selectP.onSelectTimeout) {
				clearTimeout(this.selectP.onSelectTimeout);
			}
		};

		this.selectP.onSelectTimeout = setTimeout(() => {
			this.sendDM(`Hết giờ, chọn mặc định ${defaultIndex}`);
			this.selectP.onSelect(defaultIndex);
		}, duration * 1000);
	});
}

Player.prototype.resolveSelectIfExist = function(message) {
	if (!this.selectP.isSelecting) {
		return false;
	}

	const selected = Number(message);
	if (Number.isNaN(selected)) return;
	if (selected >= this.selectP.options.length) return;

	this.selectP.onSelect(selected);
	return true;
}

Player.prototype.sendDM = function(text) {
	this.discord.send(text);
}

Player.prototype.getNameAndRole = function() {
	return `${this.name}[${this.role.name}]`;
}

module.exports = Player;
