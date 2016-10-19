/*** TriggeredUpdate Z-Way HA module *******************************************

Version: 2.0.5
(c) Z-Wave.Me, 2014
-----------------------------------------------------------------------------
Author: Niels Roche <nir@zwave.eu>
Description:
    Bind actions on one device to other devices or scenes
******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function TriggeredUpdate (id, controller) {
    // Call superconstructor first (AutomationModule)
    TriggeredUpdate.super_.call(this, id, controller);
}

inherits(TriggeredUpdate, AutomationModule);

_module = TriggeredUpdate;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

TriggeredUpdate.prototype.init = function (config) {
    TriggeredUpdate.super_.prototype.init.call(this, config);

    var self = this,
        ifElement = self.config.sourceDevice[self.config.sourceDevice.filterIf];

    this.handlerLevel = function (sDev) {
        var that = self,
            value = sDev.get("metrics:level");

        if(value === ifElement.status || sDev.get('deviceType') === 'toggleButton'){
            self.config.targets.forEach(function(el) {
                var type = el.filterThen,
                    id = el[type].target,
                    action = el[type].action,
                    lvl = el[type].status,
                    delay = el[type].delay,
                    vDev = that.controller.devices.get(id);
                
                if (vDev) {
                    if (vDev.get("deviceType") === type && type === "switchMultilevel") {
                        if (action === "delay") {
                            if (delay === 0) {
                                vDev.performCommand("update");
                            } else {
                                setTimeout(function() { vDev.performCommand("update"); }, (delay * 1000));
                            }
                        } else {
                            vDev.performCommand("exact", { level: lvl });
                        }
                    } else if (vDev.get("deviceType") === "toggleButton" && type === "scene") {
                        if (delay !== 0) {
                            setTimeout(function() { vDev.performCommand("on"); }, (delay * 1000));
                        } else {
                            vDev.performCommand("on");
                        }
                    } else if (vDev.get("deviceType") === type) {
                        if (action === "delay") {
                            if (delay === 0) {
                                vDev.performCommand("update");
                            } else {
                                setTimeout(function() { vDev.performCommand("update"); }, (delay * 1000));
                            }
                        } else {
                            vDev.performCommand(lvl);
                        }
                    }
                }
            });
        }
    };

    // Setup metric update event listener
    if(ifElement && ifElement.device){
        self.controller.devices.on(ifElement.device, 'change:metrics:level', self.handlerLevel);
    }
};

TriggeredUpdate.prototype.stop = function () {
    var self = this;
    
    // remove event listener
    self.controller.devices.off(self.config.sourceDevice[self.config.sourceDevice.filterIf].device,'change:metrics:level', self.handlerLevel);

    TriggeredUpdate.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------
