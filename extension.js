/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
const GLib = imports.gi.GLib;

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;


function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

function get_session_list() {

        var sessions = [];
        let [success, stdout, stderr] = GLib.spawn_command_line_sync("zellij list-sessions");

        if (success) {
            // Convert the stdout (which is in a ByteArray) to a string
            let outputString = bin2String(stdout);
            sessions = outputString.split("\n");

    
        // Now, outputString contains the stdout as a string
        } else {
            // Handle errors, if any
            log("Error executing the command: " + stderr);
        }
        log( sessions , sessions.length);
        return sessions   ;
}

function clean_name(name) {
    return name.replace(" (current)", "").replace(" ", "");
} 

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Zellij session indicator'));

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));

        let top = new PopupMenu.PopupMenuItem(_("Welll"));
        top.connect('activate', () => {
            Main.notify(_('Activated ' + "Welll"));
        });
        this.menu.addMenuItem(top);
        // log("YOYO", this.menu);

        // this.connect("activate", () => {
        //     // let sessions = get_session_list();
        //     // for (let session in sessions) {
        //     //     let name = sessions[session];
        //     //     let item = new PopupMenu.PopupMenuItem(_(name));
        //     //     item.connect('activate', () => {
        //     //         Main.notify(_('Activated ' + name));
        //     //     });
        //         // this.menu.addMenuItem(item);
        //     // }
        //     log("BUTTON WAZ CLICKED");
        // });
       
    }

    _onOpenStateChanged(menu,open) {
        super._onOpenStateChanged(menu,open);
        if (open) {
            log("BLUD gut got");
            this.menu.removeAll();
            let sessions = get_session_list();
            for (let session in sessions) {
                let name = sessions[session];
                if (name == "") {
                    continue;
                }
                let item = new PopupMenu.PopupMenuItem(_(name));
                item.connect('activate', () => {
                    let id = clean_name(name)
                    GLib.spawn_command_line_async("kitty -- zellij a " + id);
                    Main.notify(_('Activated ' + id));
                });
                this.menu.addMenuItem(item);
            }
        }
        log("BUTTON WAZ CLICKED");
    }

});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
