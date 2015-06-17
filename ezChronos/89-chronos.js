<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
// Node-RED node file for ezChronos

module.exports = function(RED) {
    "use strict";
    var chronos = require("ez430");

    function ChronosPort(config) {
        RED.nodes.createNode(this,config);
        this.chronosport = config.chronosport;
        this.serialbaud = config.serialbaud;
    };
    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("chronos-port",ChronosPort);

    function ChronosNode(config) {
        RED.nodes.createNode(this,config);
        this.settings = config.chronos;
        this.config = RED.nodes.getNode(this.settings);

        if (this.config) {
            var node = this;
            try {
                node.chronos = new chronos(this.config);

                this.chronos.on('chronosData', function(b, x, y, z) {
                    var msg = { };
                    msg.payload = {'b':b, 'x':x, 'y':y, 'z':z};
                    node.send(msg);
                });

            } catch (err) { node.warn("can't open Chronos device."); }
            this.on("close", function() {
                node.chronos.close();
            });
        }
    };
    RED.nodes.registerType("chronos in",ChronosNode);
}
