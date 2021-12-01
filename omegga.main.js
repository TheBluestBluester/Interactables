const fs = require('fs');
const { brs } = OMEGGA_UTIL;

let brsfile = fs.readFileSync(__dirname + "/brs/Interactable.brs");
const intrbrick = brs.read(brsfile);
brsfile = fs.readFileSync(__dirname + "/brs/heal.brs");
const healbrick = brs.read(brsfile);
brsfile = fs.readFileSync(__dirname + "/brs/audio.brs");
const soundbrick = brs.read(brsfile);
const soundlist = fs.readFileSync(__dirname + "/misc/Sound_list.txt", 'utf8');
const brickfuncs = ["function","trigger","message","kill","teleport","tp","rltp","heal","door","usedoor","delay","broadcast","playsound","repeat","zone"];
const brickfuncsshort = ["fn~","tr~","ms~","kl","tp~","tp~","rt~","hl","door~","ud~","dl~","br~","ps~","rp~","zn~"];
const colorlist = [19,53,15,13,43,43,42,17,0,9,11,14,20,33,12];

class Interactables {
	
	constructor(omegga, config, store) {
		this.omegga = omegga;
		this.config = config;
		this.store = store;
	}
	
	async runfunctionsnstuff(brsobj,plyrpos,brickowner,name,sounds) {
		let funcname = brickowner.split("~")[2];
				let funcpos = [];
				let brickowner2 = "";
				let detected = false;
				for(var i2=0;i2<brsobj.brick_count;i2++) {
					brickowner2 = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1];
					if(brickowner2 !== 'undefined') {
						brickowner2 = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name;
						if(brickowner2 !== 'undefined') {
							if(brickowner2.indexOf("fn~") == 0) {
								if(brickowner2.substr(3,brickowner.length) == funcname) {
									detected = true;
									funcpos = brsobj.bricks[i2].position;
									i2 = brsobj.brick_count;
								}
							}
						}
					}
				}
				let playerpos = await this.omegga.getPlayer(name).getPosition();
				if(!detected) {
					this.omegga.whisper(name,"The function that is bound to this trigger does not exist.");
				}
				let looplist = [];
				while(detected) {
					playerpos = await this.omegga.getPlayer(name).getPosition();
					detected = false;
					function delay(ms) {
						return new Promise(resolve => setTimeout(resolve, ms));
					}
					for(var i2=0;i2<brsobj.brick_count;i2++) {
					if(brsobj.bricks[i2].position[0] == funcpos[0]+10 && brsobj.bricks[i2].position[1] == funcpos[1] && brsobj.bricks[i2].position[2] == funcpos[2]) {

						brickowner2 = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name;
						let description2 = brickowner2.split("~");
						if(description2[0] == "ms") {
							description2.shift();
							description2 = description2.join("_");
							const text = description2.split("_");
							this.omegga.whisper(name,text.join(" "));
						}
						if(description2[0] == "br") {
							description2.shift();
							description2 = description2.join("_");
							const text = description2.split("_");
							this.omegga.broadcast(text.join(" "));
						}
						if(description2[0] == "kl") {
							this.omegga.writeln(`Chat.Command /TP "${name}" ${[100000000,0,0].join(" ")}`);
						}
						if(description2[0] == "tp") {
							const pos = description2[1].split(",");
							this.omegga.writeln(`Chat.Command /TP "${name}" ${pos.join(" ")}`);
						}
						if(description2[0] == "hl") {
							function removbrik(omegga) {
								omegga.clearBricks("00000000-0000-0000-0000-100000000000",{quiet: true});
							}
							const pos = [Math.round(playerpos[0]),Math.round(playerpos[1]),Math.round(playerpos[2])];
							let bricktoplace = {...healbrick,brick_owners:[{id: "00000000-0000-0000-0000-100000000000",name:"heal",bricks: 0}]};
							bricktoplace.bricks[0].position = pos;
							this.omegga.loadSaveData(bricktoplace, {quiet: true});
							setTimeout(() => removbrik(this.omegga), 100);
						}
						if(description2[0] == "rt") {
							let pos = description2[1].split(",");
							pos = pos.map(function (x) { 
								return parseInt(x, 10); 
							});
							pos = [pos[0]+playerpos[0],pos[1]+playerpos[1],pos[2]+playerpos[2]];
							this.omegga.writeln(`Chat.Command /TP "${name}" ${pos.join(" ")}`);
						}
						if(description2[0] == "dl") {
							await delay(parseInt(description2[1],10));
						}
						if(description2[0] == "tr") {
							if(description2[1] == 1) {
								this.runfunctionsnstuff(brsobj,plyrpos,description2.join("~"),name,sounds);
							}
						}
						if(description2[0] == "ps") {
							function removbrik(omegga) {
								omegga.clearBricks("00000000-0000-0000-0000-100000000001",{quiet: true});
							}
							const amount = sounds[sounds.length - 1];
							if(description2[1] < amount) {
								const sound = sounds[description2[1]];
								let brick = {...soundbrick,brick_owners:[{id: "00000000-0000-0000-0000-100000000001",name: description2.join("_"),bricks: 0}]};
								const pos = [Math.round(playerpos[0]),Math.round(playerpos[1]),Math.round(playerpos[2])];
								if(description2.length >= 8) {
									brick.bricks[0].position = [description2[5],description2[6],description2[7]];
								}	
								else {
									brick.bricks[0].position = pos;
								}
								brick.bricks[0].components.BCD_AudioEmitter.AudioDescriptor = sound.substr(0,sound.length-1);
								brick.bricks[0].components.BCD_AudioEmitter.VolumeMultiplier = parseFloat(description2[2], 10);
								brick.bricks[0].components.BCD_AudioEmitter.PitchMultiplier = parseFloat(description2[3], 10);
								this.omegga.loadSaveData(brick,{quiet: true});
								setTimeout(() => removbrik(this.omegga), parseInt(description2[4], 10));
							}
						}
						if(description2[0] == "rp") {
							if(description2[1] == "0") {
								looplist.push(funcpos);
								looplist.push(parseInt(description2[2], 10)-1);
							}
							else {
								if(looplist[looplist.length-1] > 0) {
									looplist[looplist.length-1] = looplist[looplist.length-1] - 1;
									funcpos = looplist[looplist.length-2];
								}
								else {
									looplist.pop();
									looplist.pop();
								}
							}
						}
						detected = true;
						funcpos = [funcpos[0]+10,funcpos[1],funcpos[2]];
					}
				}
			}
	}
	
	async init() {
		const sounds = Object.values(soundlist.split("\n"));
		this.omegga.on('cmd:use', async name => {
			let foundtriggers = false;
			let hasargs = false;
			let isdead = false;
			const players = await this.omegga.getAllPlayerPositions();
			for(let i2=0;i2<players.length;i2++) {
				const plr = players[i2];
				if(plr !== 'undefined') {
					if(plr.player.name == name) {
						i2 = players.length;
						if(plr.isDead) {
							isdead = true;
						}
					}
				}
			}
			const brsobj = await this.omegga.getSaveData();
			//Object.values(brsobj.bricks[3].components).forEach(element => 
			//console.log(element));
			const plyrpos = await this.omegga.getPlayer(name).getPosition();
			for(var i=0;i<brsobj.brick_count;i++) {
				let brickowner = brsobj.brick_owners[brsobj.bricks[i].owner_index - 1];
				if(typeof brickowner !== 'undefined') {
					brickowner = brsobj.brick_owners[brsobj.bricks[i].owner_index - 1].name;
					if(typeof brickowner !== 'undefined') {
					if(brickowner.indexOf("tr~") == 0) {
						const brickpos = [brsobj.bricks[i].position[0],brsobj.bricks[i].position[1],brsobj.bricks[i].position[2]];
						if(brickpos[0]<plyrpos[0]+25 && brickpos[0]>plyrpos[0]-25 && brickpos[1]<plyrpos[1]+25 && brickpos[1]>plyrpos[1]-25 && brickpos[2]<plyrpos[2]+36 && brickpos[2]>plyrpos[2]-28) {
								const valuecheck = brickowner.split("~");
								if(!isdead && valuecheck[1] == "0") {
									this.runfunctionsnstuff(brsobj,plyrpos,brickowner,name,sounds);
								}
								foundtriggers = true;
							}
						}
					}
				}
			}
			if(!foundtriggers) {
				this.omegga.whisper(name,"There are no triggers in range.");
			}
			if(isdead) {
				this.omegga.whisper(name,"You can't use anything while dead.");
			}
			
		});
		this.omegga.on('cmd:place', async (name, ...args) => {
			function random(min, max) {
				return Math.floor(Math.random() * (max + 1 - min) + min);
			}
			let isnan = false;
			let pos = await this.omegga.getPlayer(name).getPosition();
			pos = [Math.round(pos[0]),Math.round(pos[1]),Math.round(pos[2])]
			const color = colorlist[brickfuncs.indexOf(args[0])];
			args = args.map(String);
			function checkifnan(item) {
				if(isNaN(item)) {
					isnan = true;
				}
			}
			if(brickfuncs.includes(args[0])) {
				let description = brickfuncsshort[brickfuncs.indexOf(args[0])];
				if(description == "fn~" || description == "ms~" || description == "door~" || description == "br~" || description == "zn~") {
					args.shift();
					description = description + args.join("_");
				}
				if(description == "tp~" || description == "rt~" || description == "ps~" || description == "rp~") {
					args.shift();
					args.map(function (x) { 
						return parseInt(x, 10); 
					});
					args.forEach(element => 
					checkifnan(element));
					if(description !== "ps~" && description !== "rp~") {
						description = description + args.join(",");
					}
					else {
						description = description + args.join("~");
						if(description == "ps~" && args.length < 4) {
							isnan = true;
						}
					}
				}
				if(description == "tr~" || description == "ud~") {
					description = description + parseInt(args[1],10) + "~";
					checkifnan(parseInt(args[1],10));
					args.shift(); args.shift();
					description = description + args.join("_");
				}
				if(description == "dl~") {
					checkifnan(parseInt(args[1],10));
					description = description + parseInt(args[1],10);
				}
				const randomcode = random(100000000000,999999999999);
				let brick = {...intrbrick,brick_owners:[{id: "00000000-0000-0000-0000-"+randomcode.toString(),name: description,bricks: 0}]};
				brick.bricks[0].position = [0,0,0];
				brick.bricks[0].color = color;
				if(!isnan) {
					this.omegga.getPlayer(name).loadDataAtGhostBrick(brick);
					this.omegga.whisper(name,"Set succesfully: "+description);
				}
				else {
					this.omegga.whisper(name,"One of the arguments must be a number.");
				}
			}
			else {
				this.omegga.whisper(name,args[0]+" doesn't exist.");
			}
		});
		this.omegga.on('cmd:codehelp', async (name, ...args) => {
			if(args.length > 0) {
				if(args[0] == "function") {
					this.omegga.whisper(name,"args: (name)");
					this.omegga.whisper(name,"Used by triggers to execute code. Code is always executed north (aka where player faces on spawning).");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "trigger") {
					this.omegga.whisper(name,"args: (mode) (function name)");
					this.omegga.whisper(name,"Executes the specified function. To use the trigger do /use near it. Triggers with mode set to 1 will act as a code block. Howveres you will nolomger be ab;e to use /use on it.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "message") {
					this.omegga.whisper(name,"args: (message)");
					this.omegga.whisper(name,"Sends a message to the player.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "kill") {
					this.omegga.whisper(name,"args: (none)");
					this.omegga.whisper(name,"Kills the player.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "teleport" || args[0] == "tp") {
					this.omegga.whisper(name,"args: (x) (y) (z)");
					this.omegga.whisper(name,"Teleports the player to set coordinets.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "rltp") {
					this.omegga.whisper(name,"args: (x) (y) (z)");
					this.omegga.whisper(name,"Teleports the player relative to player's current position.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "heal") {
					this.omegga.whisper(name,"args: (none)");
					this.omegga.whisper(name,"Heals the player by 25 hp.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "door" || args[0] == "usedoor" || args[0] == "zone") {
					this.omegga.whisper(name,"args: (none)");
					this.omegga.whisper(name,"This is not functional yet.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "delay") {
					this.omegga.whisper(name,"args: (amount)");
					this.omegga.whisper(name,"Delays all code blocks after it by an amount. A second is 1000 ticks.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "broadcast") {
					this.omegga.whisper(name,"args: (message)");
					this.omegga.whisper(name,"Send a message to all players.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "playsound") {
					this.omegga.whisper(name,"args: (id) (volume) (pitch) (duration)");
					this.omegga.whisper(name,"Plays sound.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else if(args[0] == "repeat") {
					this.omegga.whisper(name,"args: (mode) (number)");
					this.omegga.whisper(name,"Repeats code blocks. Setting mode to 0 will mark this as a start of the repeat loop. Setting mode to 1 will mark the block as the end.");
					this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
				}
				else {
					this.omegga.whisper(name,args[0]+" block doesn't exist.");
				}
			}
			else {
				this.omegga.whisper(name,"Blocks:");
				Object.values(brickfuncs).forEach(element => 
				this.omegga.whisper(name,element));
				this.omegga.whisper(name,"Use PgUp or PgDn to scroll up or down.");
			}
		});
		//this.interval = setInterval(() => this.tickhandler(),500);
		return { registeredCommands: ['place','use','codehelp'] };
	}
	
	
	async tickhandler() {
		const sounds = Object.values(soundlist.split("\n"));
		const publicplayerloclist = await this.omegga.getAllPlayerPositions();
		for(var i=0;i<publicplayerloclist.length;i++) {
			const brsobj = await this.omegga.getSaveData();
			const plyrpos = publicplayerloclist[i].pos;
			for(var i2=0;i2<brsobj.brick_count;i2++) {
				let brickowner = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1];
				if(typeof brickowner !== 'undefined') {
					brickowner = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name;
					if(typeof brickowner !== 'undefined') {
					if(brickowner.indexOf("zn~") == 0) {
						const brickpos = brsobj.bricks[i2].position;
						const size = brsobj.bricks[i2].size;
						if(plyrpos[0] > brickpos[0] && plyrpos[0] < brickpos[0] + size[0]*2 && plyrpos[1] > brickpos[1] && plyrpos[1] < brickpos[1] + size[1]*2 && plyrpos[2]+5 > brickpos[2] && plyrpos[2] < brickpos[2] + size[2]*2) {
								this.runfunctionsnstuff(brsobj,plyrpos,"zn~0~"+brickowner.split("~")[1],publicplayerloclist[i].player.name,sounds);
							}
						}
					}
				}
			}
		}
	}
	
	
	async stop() {
		//clearInterval(this.interval);
		this.omegga.removeAllListeners('cmd:use');
		this.omegga.removeAllListeners('cmd:place');
		this.omegga.removeAllListeners('cmd:codehelp');
	}
}
module.exports = Interactables;
