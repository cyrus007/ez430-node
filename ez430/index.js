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

var serialport = require('serialport'),
    SerialPort = serialport.SerialPort, // localize object constructor
    events = require('events'),
    fs = require('fs'),
    util = require('util');

var startAccessPoint = new Buffer([0xFF, 0x07, 0x03]),
    stopAccessPoint = new Buffer([0xFF, 0x09, 0x03]),
    accDataRequest = new Buffer([0xFF, 0x08, 0x07, 0x00, 0x00, 0x00, 0x00]);

var DEBOUNCE = 10000,   //wait for 10s between presses otherwise door may stop midway
    ACC_WAIT = 20;      //wait between accelerometer readings

function ez430(options) {
  'use strict';
  var sp, self = this;

  events.EventEmitter.call(this);
  //options = options || {};
  var devicePath = options.chronosport || '/dev/ttyACM0'; 
  var serialBaud = options.serialbaud || 115200; 

  try {
    fs.statSync(devicePath);
  } catch (e) {
    throw new Error('device not found');
  }
  sp = new SerialPort(devicePath, { baudRate:serialBaud }, function(){
    console.log('Chronos serial port at', devicePath, 'opened at', serialBaud, 'baud.');
  });

  this.close = function () {
    sp.write(stopAccessPoint);
    sp.close();
  };

  sp.on('open', function () {
    console.log('ez430: start ap..', startAccessPoint);

    sp.write(startAccessPoint);
    sp.write(accDataRequest);

    sp.on('data', function (data) {
      var timeout = 0, on,
          x, y, z, b = 0,
          buf = new Buffer(data);
      if (data.length >= 7) {
        b = buf.readInt8(3);
        x = buf.readInt8(5);
        y = buf.readInt8(4);
        z = buf.readInt8(6);
        on = (buf[3] === 1 || buf[3] === 18 || buf[3] === 34 || buf[3] === 50);
        if (on) {
          console.log('b:' + b + ', x:' + x + ', y:' + y + ', z:' + z);
          if (b === 1)  timeout = ACC_WAIT;
          else  timeout = DEBOUNCE;
          self.emit('chronosData', b, x, y, z);
        }
      } else {
        console.log((new Date()).getTime() + ' invalid data', buf);
      }
      setTimeout(function () {sp.write(accDataRequest);}, timeout);
    });
    sp.on('close', function (err) {
      console.log('port closed');
      self.emit('close');
    });
    sp.on('error', function (err) {
      console.log('error', err);
      sp.write(stopAccessPoint);
      self.emit('error', err);
    });
  });
}

util.inherits(ez430, events.EventEmitter);
module.exports = ez430;
