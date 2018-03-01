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
// test #1 unused variable (static)
var a; // PASS
// test #2 used variable, written but never read again (static)
var b;
b = 3; // PASS
// test #3 assign a value, never read (static)
var bb = 3; // PASS
// test #4-5 init a variable, one write assign, one write over write without read (dynamic), no further read (static)
var d;
d = 3;
d = 4; // static: PASS, dynamic: PASS
// test #6 init a variable (here a function), never use it (static)
var e = function() {
    console.log("test");
}; // PASS
// test #7-8 init an object, init a value in an object never use them (static) and (static)
var f = {
    ff: "test1"
}; // 7 PASS, 8 NOPASS
// test #9 init a new object, write a property in the object, never use this property (static)
var g = new Object();
g.gg = "test2"; // NOPASS
// test #10 init an array (object-like) and never use it (static)
var h = []; // PASS
// test #11 init an array, pass a value, never read it (static)
var i = [];
i[3] = 6; // NOPASS