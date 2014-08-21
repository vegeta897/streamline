streamline
==========

users place special units (gates) on the canvas that do different things to a constant stream of random pixels flowing through the canvas from all directions

users start by placing their main home gate. stream pixels that flow into this gate give the user money to buy special gates that manipulate the stream in different ways, with the main goal of guiding the stream into their home gate (or other receivers they own) stream pixels give you money to buy gates

pixels can be "processed" into different kinds of pixels by the player's gates. eg. make the pixel more valuable. these could then be stolen by a sneaky player

placing gates further away from home is more expensive, a gate is more expensive to place the more of them you have placed

"negative" stream pixels that you want to avoid

some player-colored stream pixels spawn that are only really valuable to that player... but another player can make interest off it by helping redirect it to that player. for any stream pixel that passes through one of your gates, you'll make some interest off it no matter who receives it

gates require energy pixels to operate. energy pixels are created by a power hub that shoots out energy pixels in 4 directions. an unpowered gate will not affect stream pixels. when a power pixel hits it, it becomes powered, and will process any more power pixels that hit it. but if a stream pixel hits it, it uses its charge to manipulate that pixel and then requires a power pixel again to recharge. energy pixels are property of the player (they match player color) and if player 1's unpowered gate gets powered by player 2, player 2 makes interest off any pixel that passes through it and gets received

gates must be upgraded in order to handle fast streams

perhaps have areas of the edges that are more likely to spawn pixels, and this changes slowly over time

to move or delete a gate, you send out a "transport pixel" from one of the screen edges, and it hits one of your gates and captures it, carrying it with it until it hits a "foundation" that you place, which then becomes the transported gate

receiver gates catch stream pixels for money and are wider, but require power and can only receive streams from one direction. also, the further from the home gate, the less money they earn

players only make money if they are logged in. player 2 witnessing player 1 receive a stream pixel will not increase player 1's money. player 1 has to witness it. all other functions of player 1's gates will simulate in player 2's view even if player 1 is not logged in

7:42 PM - Space Cow: you need to have explosions when two streams hit each other
7:43 PM - Space Cow: that create a chunk of fused, minable material that you have to fire a mining laser at!
7:49 PM - Space Cow: maybe the point of firing things at fused streams(are they solid matter or just energy?), is that they start to grow in size. the stationary larger object is more likely to be hit by more streams
7:49 PM - Space Cow: and it'll grow in size, threatening player structures, and snowballing out of control if players dont diminish it
**streams should probably not interact with eachother, because some may be missing for a client who just connected
or maybe they can... make the collision coords an object of stream pixel IDs.. can only be added to**

have a dropdown box where you can hotswap color schemes that will change the page css as well as game colors

*usability improvement:* show crosshairs/relevant lines for gate *nearest* to the cursor

moment	    8s
step		1m4s
phase		8m30s
cycle		1h8m
period		9h
chapter	    3d
eon		    24d
key		    6m11d