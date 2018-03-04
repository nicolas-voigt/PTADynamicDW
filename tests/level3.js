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
// Level 3 concentrate on loops
var a = true;
var b = 1, c = "test", d = {};
console.log("use b, c and d" + b + c + d);
if (a) {
    b = 2; // write on c
    c = "Written"; // write on d
    // d is not overwritten here
}
if (!a) {
    // this if is always false
    d = undefined; // set d to undefined
}