# Interactables
Plugin for omegga. Create stuff with codeblocks n... That.

## Codeblocks i guess:
### function:
Args: (name).

Begining of all code lines. At the moment functions can ONLY execute in 1 direction which is where players face when spawning by default.

### trigger:
Args: (mode number)(function name).

Activates functions. Mode 1 triggers can be executed in a code line, however they can't be triggered.

### message:
Args: (text).

Sends a message to the player. If your message doesn't fit in one codeblock you can extend them by stacking. Can also display variables by stacking 'setvariable' on top of it.

## kill:
Args: (none).

Kill the player.

### teleport:
Args: (x)(y)(z).

Teleport the player to the coords.

### rltp:
Args: (x)(y)(z).

Functions the same as teleport but teleports the player relative to his position.

### heal:
Args: (none).

Heals the player by 25 hp.

### delay:
Args: (ticks).

Delays all codeblocks after it. 1 second is 1000 ticks.

### broadcast:
Args: (text).

Same as message codeblock but it sends the message to all players.

### playsound:
Args: (id)(volume)(pitch)(duration) optional: (x)(y)(z).

Plays sound. If coords are not specified sound will be played at player's position. Duration is in ticks.

### repeat:
Args: (mode number)(amount).

Repeats codeblocks. Mode 0 blocks will act as a start of a loop. Mode 1 blocks will act as an end of a loop. If there is a "setvariable" codeblock on top of it it will repeat for the amount that the variable is set.

### door:
Args: (name).

Places a door.

### usedoor:
Args: (mode)(door name).

Open or closes doors. Mode 0 opens doors. Mode 1 closes doors. Mode 2 toggles doors.

### zone:
Args: (function name).

Activates functions whenever a player is inside of one. To resize the zone simply resize the brick itself.

### blacklist:
Args: (mode)(function name)

Prevents functions from running. Mode 0 disables functions. Mode 1 reenables them.

### setvariable:
Args: (amount)(variable name)

Sets variables to a value. If the variable doesn't exist it will create it.

### addvariable:
Args: (amount)(variable name)

Adds to the variable's value.

### multvariable:
Args: (amount)(variable name)

Multiplies the variable.

### divvariable:
Args: (amount)(variable name)

Divides the variable.

### remvariable:
Args: (variable name)

Deletes the variable.

### compare:
Args: (invert mode)(compare mode)

Compares 2 variables/values on top of it by using 'setvariable'. Setting invert mode to 1 will invert the output. Compare mode 0 checks if variables are equal. Compare mode 1 checks if the first variable greater than the second. If the variable doesn't exist it will take the amount from 'setvariable'. If the output is negative it will trigger codeblocks that are below by 2 bricks.

### weapon:
Args: (id)

Gives a weapon to the player.

## Planned features:
- [X] Doors.
- [X] Item spawning.
- [X] Zones.
- [ ] Minigame event triggers.
- [ ] Variables and condition blocks. (WIP)
- [X] Function blacklisting.
- [X] Message extention.
- [ ] Event cancellation.
