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
var a = function() { var a; var aa = 3; a = 4}; // init function and two variables inside the function, no read
var b = new Object(); b.prototype.b = function () { var a; var aa = 3; a = 4}; // object assignment via prototypes