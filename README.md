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

Sends a message to the player.

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

Sends a message to all players.

### playsound:
Args: (id)(volume)(pitch)(duration) optional: (x)(y)(z).

Plays sound. If coords are not specified sound will be played at player's position. Duration is in ticks.

### repeat:
Args: (mode number)(amount).

Repeats codeblocks. Mode 0 blocks will act as a start of a loop. Mode 1 blocks will act as an end of a loop.
