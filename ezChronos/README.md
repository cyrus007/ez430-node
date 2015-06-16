node-red-contrib-ezChronos
=======================
A <a href="http://nodered.org" target="_new">Node-RED</a> node to capture data from ez430-chronos watch.

Install
-------

Run the following command in the root directory of your Node-RED install

        npm install node-red-contrib-ezchronos


Usage
-----

ezChronos post.

The **msg.payload** will contain 4 values if available. They are 1) button pressed code 2) accelerometer X value 3) Y value and 4) Z value in JSON object
e.g.
    { "b":value, "x":value, "y":value, "z":value }

