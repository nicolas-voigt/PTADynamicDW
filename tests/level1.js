/*   This file is part of PTADynamicDW.
 *
 *   PTADynamicDW is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   PTADynamicDW is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with PTADynamicDW.  If not, see <http://www.gnu.org/licenses/>.
 */
// Level 1 tests
var a; // init no read no write
var b; b = 3; // init and assign, no write
var bb = 3; // init and assign, no write
var d; d = 3; d = 4; // init and assign x2, no read
var e = function() { console.log("test")}; // init and function assign, no read/execute
var f = {a: "test"} // init and object assign, no read
var g = new Object(); g.a = "test"; // init and write object, no read
var h = []; // init empty array
var i = []; i[3] = 6; // init array, write to array, no read