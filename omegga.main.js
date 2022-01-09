const fs = require('fs');
const { brs } = OMEGGA_UTIL;

let brsfile = fs.readFileSync(__dirname + "/brs/Interactable.brs");
const intrbrick = brs.read(brsfile);
brsfile = fs.readFileSync(__dirname + "/brs/heal.brs");
const healbrick = brs.read(brsfile);
brsfile = fs.readFileSync(__dirname + "/brs/audio.brs");
const soundbrick = brs.read(brsfile);
brsfile = fs.readFileSync(__dirname + "/brs/weapon.brs");
const weaponbrick = brs.read(brsfile);
const soundlist = fs.readFileSync(__dirname + "/misc/Sound_list.txt", 'utf8');
const weaponlist = fs.readFileSync(__dirname + "/misc/Weapon_list.txt", 'utf8');
const brickfuncs = ["function","trigger","message","kill","teleport","tp","rltp","heal","door","usedoor","delay","broadcast","playsound","repeat","zone","blacklist","setvariable","addvariable","multvariable","divvariable","remvariable","compare","weapon","cancel","randomvariable"];
const brickfuncsshort = ["fn~","tr~","ms~","kl","tp~","tp~","rt~","hl","door~","ud~","dl~","br~","ps~","rp~","zn~","bl~","sv~","av~","mv~","dv~","rv~","cpr~","wp~","cl~","rng~"];
const colorlist = [19,53,15,13,43,43,42,17,0,9,11,14,20,33,12,11,65,66,66,66,65,68,37,12,66];
const collideoptions = [{ player: false, weapon: false, interaction: false, tool: true },{ player: true, weapon: true, interaction: true, tool: true }];
let funcstocancel = [];
let trusted = [];
let roles = "";
let currentlyexecuting = [];
let disable = false;
let frequency = 0;
let blacklist = [];
let variables = [];

//I make too many tasks for myself :D

class Interactables {

	constructor(omegga, config, store) {
		this.omegga = omegga;
		this.config = config;
		this.store = store;
		trusted = this.config.TrustedPlayers;
		roles = this.config.TrustedRole;
		frequency = this.config.UpdateFrequency;
		disable = this.config.DisableZones;
		if(!trusted) {
			trusted = [];
		}
	}

	async runfunctionsnstuff(brsobj,plyrpos,brickowner,name,sounds,weapons) {
		let funcname = brickowner.split("~")[2];
				let funcpos = [];
				let brickowner2 = "";
				let detected = false;
				for(var i2=0;i2<brsobj.brick_count;i2++) {
					brickowner2 = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1];
					if(brickowner2 !== 'undefined') {
						brickowner2 = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name;
						if(brickowner2 !== 'undefined') {
							if(brickowner2.indexOf("fn~") == 0 && brickowner2.substr(3,brickowner.length) == funcname) {
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
				currentlyexecuting.push(funcname);
				while(detected && !blacklist.includes(funcname) && !funcstocancel.includes(funcname)) {
					playerpos = await this.omegga.getPlayer(name).getPosition();
					detected = false;
					function delay(ms) {
						return new Promise(resolve => setTimeout(resolve, ms));
					}
					for(var i2=0;i2<brsobj.brick_count && !funcstocancel.includes(funcname);i2++) {
					if(brsobj.bricks[i2].position[0] == funcpos[0]+10 && brsobj.bricks[i2].position[1] == funcpos[1] && brsobj.bricks[i2].position[2] == funcpos[2]) {

						brickowner2 = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name;
						let description2 = brickowner2.split("~");
						if(description2[0] == "ms") {
							description2.shift();
							description2 = description2.join("_");
							let text = description2.split("_").join(" ");
							let funcpos2 = [funcpos[0]+10,funcpos[1]-10,funcpos[2]];
							let detected2 = true;
							while(detected2) {
							detected2 = false;
							for(var i3=0;i3<brsobj.brick_count;i3++) {
								if(brsobj.bricks[i3].position[0] == funcpos2[0] && brsobj.bricks[i3].position[1] == funcpos2[1] && brsobj.bricks[i3].position[2] == funcpos2[2]) {	
									const brickowner3 = brsobj.brick_owners[brsobj.bricks[i3].owner_index - 1].name;
									let description3 = brickowner3.split("~");
									if(description3[0] == "ms") {
										description3.shift();
										description3 = description3.join("_");
										text = text + description3.split("_").join(" ");
										detected2 = true;
									}
									if(description3[0] == "sv") {
										description3.shift(); description3.shift();
										for(var a=0;a<variables.length;a++) {
											if(variables[a].name == description3[0]) {
												const amount = variables[a].amount;
												a = variables.length;
												text = text + amount.toString();
											}
										}
										detected2 = true;
									}
								}
								
							}
							funcpos2 = [funcpos2[0],funcpos2[1]-10,funcpos2[2]];
							}
							this.omegga.whisper(name,text);
						}
						if(description2[0] == "br") {
							description2.shift();
							description2 = description2.join("_");
							let text = description2.split("_").join(" ");
							let funcpos2 = [funcpos[0]+10,funcpos[1]-10,funcpos[2]];
							let detected2 = true;
							while(detected2) {
							detected2 = false;
							for(var i3=0;i3<brsobj.brick_count;i3++) {
								if(brsobj.bricks[i3].position[0] == funcpos2[0] && brsobj.bricks[i3].position[1] == funcpos2[1] && brsobj.bricks[i3].position[2] == funcpos2[2]) {	
									const brickowner3 = brsobj.brick_owners[brsobj.bricks[i3].owner_index - 1].name;
									let description3 = brickowner3.split("~");
									if(description3[0] == "br") {
										description3.shift();
										description3 = description3.join("_");
										text = text + description3.split("_").join(" ");
										detected2 = true;
									}
									if(description3[0] == "sv") {
										description3.shift(); description3.shift();
										for(var a=0;a<variables.length;a++) {
											if(variables[a].name == description3[0]) {
												const amount = variables[a].amount;
												a = variables.length;
												text = text + amount.toString();
											}
										}
										detected2 = true;
									}
								}
								
							}
							funcpos2 = [funcpos2[0],funcpos2[1]-10,funcpos2[2]];
							}
							this.omegga.broadcast(text);
						}
						if(description2[0] == "cpr") {
							let funcpos2 = [funcpos[0]+10,funcpos[1]-10,funcpos[2]];
							let detected2 = true;
							let vartocompare = [];
							while(detected2) {
							detected2 = false;
							for(var i3=0;i3<brsobj.brick_count;i3++) {
								if(brsobj.bricks[i3].position[0] == funcpos2[0] && brsobj.bricks[i3].position[1] == funcpos2[1] && brsobj.bricks[i3].position[2] == funcpos2[2]) {	
									const brickowner3 = brsobj.brick_owners[brsobj.bricks[i3].owner_index - 1].name;
									let description3 = brickowner3.split("~");
									if(description3[0] == "sv") {
										for(var a=0;a<variables.length;a++) {
											if(variables[a].name == description3[2]) {
												const amount = variables[a].amount;
												a = variables.length;
												vartocompare.push(amount);
											}
											else {
												vartocompare.push(parseInt(description3[1],10));
											}
										}
										if(!vartocompare.length<2) {
											detected2 = true;
										}
									}
								}
								
							}
							funcpos2 = [funcpos2[0],funcpos2[1]-10,funcpos2[2]];
							}
							let bool = false;
							if(vartocompare[0] == vartocompare[1] && description2[2] == 0) {
								bool = true;
							}
							else if(vartocompare[0] > vartocompare[1] && description2[2] == 1) {
								bool = true;
							}
							if(description2[1] == 1) {
								bool = !bool;
							}
							if(!bool) {
								funcpos = [funcpos[0]-10, funcpos[1]+20, funcpos[2]];
							}
						}
						if(description2[0] == "kl") {
							this.omegga.writeln(`Chat.Command /TP "${name}" ${[100000000,0,0].join(" ")}`);
						}
						if(description2[0] == "tp") {
							const pos = description2[1].split(",");
							this.omegga.writeln(`Chat.Command /TP "${name}" ${pos.join(" ")}`);
						}
						if(description2[0] == "sv") {
							let alreadyexists = false;
							if(variables.length > 0) {
								if(variables.some(a => a.name == description2[2])) {
									alreadyexists = true;
								}
							}
							if(!alreadyexists) {
								const amount = parseInt(description2[1],10);
								const varname = description2[2];
								variables.push({name: varname, amount: amount});
							}
							else {
								for(var a=0;a<variables.length;a++) {
									if(variables[a].name == description2[2]) {
										const amount = parseInt(description2[1],10);
										variables[a] = {name: variables[a].name, amount: amount};
										a = variables.length;
									}
								}
							}
						}
						if(description2[0] == "rng") {
							function random(max) {
								return Math.floor(Math.random() * max);
							}
							let alreadyexists = false;
							if(variables.length > 0) {
								if(variables.some(a => a.name == description2[2])) {
									alreadyexists = true;
								}
							}
							if(alreadyexists) {
								for(var a=0;a<variables.length;a++) {
									if(variables[a].name == description2[2]) {
										const amount = random(parseInt(description2[1],10));
										variables[a] = {name: variables[a].name, amount: amount};
										a = variables.length;
									}
								}
							}
						}
						if(description2[0] == "av") {
							for(var a=0;a<variables.length;a++) {
								if(variables[a].name == description2[2]) {
									const amount = variables[a].amount + parseInt(description2[1],10);
									variables[a] = {name: variables[a].name, amount: amount};
									a = variables.length;
								}
							}
						}
						if(description2[0] == "mv") {
							for(var a=0;a<variables.length;a++) {
								if(variables[a].name == description2[2]) {
									const amount = variables[a].amount * parseInt(description2[1],10);
									variables[a] = {name: variables[a].name, amount: amount};
									a = variables.length;
								}
							}
						}
						if(description2[0] == "dv") {
							for(var a=0;a<variables.length;a++) {
								if(variables[a].name == description2[2]) {
									const amount = variables[a].amount / parseInt(description2[1],10);
									variables[a] = {name: variables[a].name, amount: amount};
									a = variables.length;
								}
							}
						}
						if(description2[0] == "rv") {
							for(var a=0;a<variables.length;a++) {
								if(variables[a].name == description2[1]) {
									variables.splice(a,1);
									a = variables.length;
								}
							}
						}
						if(description2[0] == "hl") {
							function removbrik(omegga) {
								omegga.clearBricks("00000000-0000-0000-0000-100000000000",{quiet: true});
							}
							const pos = [Math.round(playerpos[0]),Math.round(playerpos[1]),Math.round(playerpos[2])];
							let bricktoplace = {...healbrick,brick_owners:[{id: "00000000-0000-0000-0000-100000000000",name:"heal",bricks: 0}]};
							bricktoplace.bricks[0].position = pos;
							this.omegga.loadSaveData(bricktoplace, {quiet: true});
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
						if(description2[0] == "cl") {
							if(currentlyexecuting.includes(description2[1])) {
								funcstocancel.push(description2[1]);
							}
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
						if(description2[0] == "wp") {
							function removbrik(omegga) {
								omegga.clearBricks("00000000-0000-0000-0000-100000000002",{quiet: true});
							}
							const amount = weapons[weapons.length - 1];
							if(description2[1] < amount) {
								const weapon = weapons[description2[1]];
								let brick = {...weaponbrick,brick_owners:[{id: "00000000-0000-0000-0000-100000000002",name: description2.join("_"),bricks: 0}]};
								const pos = [Math.round(playerpos[0]),Math.round(playerpos[1]),Math.round(playerpos[2])];
								brick.bricks[0].position = pos;
								brick.bricks[0].components.BCD_ItemSpawn.PickupClass = weapon.substr(0,weapon.length-1);
								this.omegga.loadSaveData(brick,{quiet: true});
								setTimeout(() => removbrik(this.omegga), parseInt(description2[4], 1000));
							}
						}
						if(description2[0] == "rp") {
							if(description2[1] == "0") {
								looplist.push(funcpos);
								let variable  = parseInt(description2[2],10);
								for(var i3=0;i3<brsobj.brick_count;i3++) {
									if(brsobj.bricks[i3].position[0] == funcpos[0]+10 && brsobj.bricks[i3].position[1] == funcpos[1]-10 && brsobj.bricks[i3].position[2] == funcpos[2]) {
										const brickowner3 = brsobj.brick_owners[brsobj.bricks[i3].owner_index - 1].name;
										let description3 = brickowner3.split("~");
										if(description3[0] == "sv") {
											description3.shift(); description3.shift();
												for(var a=0;a<variables.length;a++) {
													if(variables[a].name == description3[0]) {
														const amount = variables[a].amount;
														a = variables.length;
														variable = amount;
													}
												}
										}
										i3 = brsobj.brick_count;
									}
								
								}
								looplist.push(variable - 1);
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
						if(description2[0] == "ud") {
							let doors = {...brsobj,bricks:[],brick_count: 0};
							for(let i3=0;i3<brsobj.brick_count;i3++) {
								brickowner2 = brsobj.brick_owners[brsobj.bricks[i3].owner_index - 1];
								if(brickowner2 !== 'undefined') {
									brickowner2 = brsobj.brick_owners[brsobj.bricks[i3].owner_index - 1].name;
									if(brickowner2 !== 'undefined') {
										if(brickowner2.indexOf("door~") == 0) {
											if(brickowner2.substr(5,brickowner.length) == description2[2]) {
												doors.bricks.push(brsobj.bricks[i3]);
												doors.brick_count = doors.brick_count + 1;
											}
										}
									}
								}
							}
							for(let i3=0;i3<doors.brick_count;i3++) {
								let door = doors.bricks[i3];
								if(door.visibility && (description2[1] == "0" || description2[1] == "2")) {
									doors.bricks[i3].visibility = false;
									doors.bricks[i3].collision = collideoptions[0];
								}
								else if(!door.visibility && (description2[1] == "1" || description2[1] == "2")) {
									doors.bricks[i3].visibility = true;
									doors.bricks[i3].collision = collideoptions[1];
								}
								if(i3 == 0) {
									this.omegga.clearBricks(doors.brick_owners[doors.bricks[i3].owner_index - 1].id,{quiet: true});
								}
							}
							if(doors.brick_count > 0) {
								function addbrik(omegga) {
									omegga.loadSaveData(doors,{quiet: true});
								}
								setTimeout(() => addbrik(this.omegga), 10);
							}
						}
						if(description2[0] == "bl") {
							if(description2[1] == 0 && !blacklist.includes(description2[0])) {
								blacklist.push(description2[2]);
								console.log(blacklist.indexOf(description2[2]));
							}
							if(description2[1] == 1){
								blacklist.splice(blacklist.indexOf(description2[2]),1);
								console.log(blacklist.indexOf(description2[2]));
							}
						}
						detected = true;
						funcpos = [funcpos[0]+10,funcpos[1],funcpos[2]];
					}
				}
			}
			currentlyexecuting.splice(currentlyexecuting.indexOf(funcname));
			if(funcstocancel.includes(funcname)) {
				funcstocancel.splice(funcstocancel.indexOf(funcname));
			}
			if(funcstocancel.length < 1) {
				funcstocancel = [];
			}
	}

	async init() {
	//trusted.push(this.omegga.host);
		console.warn("DO NOT FORGET TO CLEAR TEMP FILES FROM YOUR SAVES FOLDER.");
		console.log("Trust me you don't want to endup with 300k files like it happened to me. And this plugin generates a lot of them.");
		const sounds = Object.values(soundlist.split("\n"));
		const weapons = Object.values(weaponlist.split("\n"));
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
			if(typeof brsobj == 'undefined') {
				return;
			}
			//Object.values(brsobj.bricks[0]).forEach(element =>
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
									this.runfunctionsnstuff(brsobj,plyrpos,brickowner,name,sounds,weapons);
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
			if(trusted.length > 0) {
				if(!trusted.some(a => a.name == name)) {
					await this.omegga.whisper(name,"You are not trusted enouph to place codeblocks.");
					return;
				}
			}
			const rolelist = this.omegga.getPlayer(name).getRoles();
			if(!rolelist.includes(roles) && roles != "") {
				await this.omegga.whisper(name,"You are not trusted enouph to place codeblocks.");
				return;
			}
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
				if(description == "fn~" || description == "ms~" || description == "door~" || description == "br~" || description == "zn~" || description == "rv~" || description == "cl~") {
					if(disable && description == "zn~") {
						this.omegga.whisper(name,"Note: zones are disabled on this server.");
					}
					args.shift();
					description = description + args.join("_");
				}
				if(description == "tp~" || description == "rt~" || description == "ps~" || description == "rp~" || description == "cpr~") {
					args.shift();
					args.map(function (x) {
						return parseInt(x, 10);
					});
					args.forEach(element =>
					checkifnan(element));
					if(description !== "ps~" && description !== "rp~" && description !== "cpr~") {
						description = description + args.join(",");
					}
					else {
						description = description + args.join("~");
						if(description == "ps~" && args.length < 4) {
							isnan = true;
						}
					}
				}
				if(description == "tr~" || description == "ud~" || description == "bl~" || description == "sv~" || description == "av~" || description == "mv~" || description == "dv~" || description == "rng~") {
					description = description + parseInt(args[1],10) + "~";
					checkifnan(parseInt(args[1],10));
					args.shift(); args.shift();
					description = description + args.join("_");
				}
				if(description == "dl~" || description == "wp~") {
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
		this.omegga.on('cmd:clearblacklist', async name => {
			blacklist = [];
			this.omegga.whisper(name,"Blacklist cleared.");
		});
		this.omegga.on('cmd:clearvariables', async name => {
			variables = [];
			this.omegga.whisper(name,"Variables cleared.");
		});
		this.omegga.on('cmd:listvariables', async name => {
			this.omegga.whisper(name,"---VARIABLES---");
			Object.values(variables).forEach(element =>
			this.omegga.whisper(name,element.name + ": " + element.amount));
			this.omegga.whisper(name,"Pgup n' Pgdn to scroll.");
		});
		this.omegga.on('cmd:listblacklisted', async name => {
			this.omegga.whisper(name,"---BLACKLISTED---");
			this.omegga.whisper(name,blacklist);
			this.omegga.whisper(name,"Pgup n' Pgdn to scroll.");
		});
		this.omegga.on('cmd:stopall', async name => {
			currentlyexecuting.forEach(element =>
			funcstocancel.push(element));
			this.omegga.whisper(name,"All functions canceled.");
		});
		this.omegga.on('cmd:door', async (name, ...args) => {
			function random(min, max) {
				return Math.floor(Math.random() * (max + 1 - min) + min);
			}
			let description = "door~" + args[0];
			let doorbrs = await this.omegga.getPlayer(name).getTemplateBoundsData();
			if(doorbrs != null && args[0] != null) {
				const randomcode = random(100000000000,999999999999);
				doorbrs = {...doorbrs,brick_owners:[{id: "00000000-0000-0000-0000-"+randomcode.toString(),name: description,bricks: 0}]};
				this.omegga.getPlayer(name).loadDataAtGhostBrick(doorbrs);
				this.omegga.whisper(name,"Door created.");
			}
			else {
				if(args[0] == null) {
					this.omegga.whisper(name,"Door name is missing.");
				}
				else {
					this.omegga.whisper(name,"An error occured while place a door. Please try again.");
				}
			}
		});
		
		////this.omegga.on('cmd:test', async name => {
			////const minigames = await this.omegga.getMinigames();
			////this.omegga.whisper(name,minigames);
		////});
		if(!disable) {
			this.interval = setInterval(() => this.tickhandler(),frequency*1000);
		}
		return { registeredCommands: ['place','use','clearblacklist','clearvariables','listvariables','listblacklisted','door','stopall'] };
	}


	async tickhandler() {
		const sounds = Object.values(soundlist.split("\n"));
		const weapons = Object.values(weaponlist.split("\n"));
		const publicplayerloclist = await this.omegga.getAllPlayerPositions();
		const brsobj = await this.omegga.getSaveData();
		for(var i=0;i<publicplayerloclist.length;i++) {
			//In great memory of: allan_remove_this_file
			//      _
			//( -_-)/
			if(typeof brsobj !== 'undefined' && !publicplayerloclist[i].isDead) {
				const plyrpos = publicplayerloclist[i].pos;
				for(var i2=0;i2<brsobj.brick_count;i2++) {
					let brickowner = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1];
					if(typeof brickowner !== 'undefined') {
						brickowner = brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name;
						if(typeof brickowner !== 'undefined') {
						if(brickowner.indexOf("zn~") == 0) {
							const rotation = brsobj.bricks[i2].rotation;
							const brickpos = brsobj.bricks[i2].position;
							let size = brsobj.bricks[i2].size;
							if(rotation%2 == 1) {
								size = [size[1],size[0],size[2]];
							}
							if(plyrpos[0]+5 >= brickpos[0] - size[0] && plyrpos[0]-5 <= brickpos[0] + size[0] && plyrpos[1]+5 >= brickpos[1] - size[1] && plyrpos[1]-5 <= brickpos[1] + size[1] && plyrpos[2]+12 >= brickpos[2] - size[2] && plyrpos[2]-12 <= brickpos[2] + size[2]) {
									this.runfunctionsnstuff(brsobj,plyrpos,"zn~0~"+brickowner.split("~")[1],publicplayerloclist[i].player.name,sounds,weapons);
								}
							}
						}
					}
				}
			}
		}
	}
	

	async stop() {
		clearInterval(this.interval);
		this.omegga.removeAllListeners('cmd:use');
		this.omegga.removeAllListeners('cmd:place');
		this.omegga.removeAllListeners('cmd:clearblacklist');
		this.omegga.removeAllListeners('cmd:clearvariables');
		this.omegga.removeAllListeners('cmd:listvariables');
		this.omegga.removeAllListeners('cmd:listblacklisted');
		this.omegga.removeAllListeners('cmd:stopall');
		this.omegga.removeAllListeners('cmd:door');
	}
}
module.exports = Interactables;
