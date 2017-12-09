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
// Author: Kai Hase, Nicolas Voigt

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

(function (sandbox) {
    function MyAnalysis () {
        /**
         * Executed at each variable read
         * @param {number} iid the static instruction ID
         * @param {string} name the variable name
         * @param {*} val the value stored in the variable
         * @param {boolean} isGlobal if the var is not declare using var (TODO: check the meaning)
         * @param {boolean} isScriptLocal if the var is declared global unsing var
         */
        this.read = function(iid, name, val, isGlobal, isScriptLocal) {};
        /**
         * Executed at each variable write
         * @param {number} iid the static instruction IID
         * @param {string} name the variable name
         * @param {*} val the value to store
         * @param {*} lhs the value stored before in the variable
         * @param {boolean} isGlobal if the var is not declare using var (TODO: check the meaning)
         * @param {boolean} isScriptLocal if the var is declared global unsing var
         */
        this.write = function(iid, name, val, lhs, isGlobal, isScriptLocal) {};
        /**
         * 
         * @param {number} iid the static instruction ID
         * @param {object} base the base object
         * @param {string|*} offset the property (name? or the property itself?)
         * @param {boolean} isComputed if the property is accessed using []
         * @param {boolean} isOpAssign True if the operation is of the form o.p op= e (TODO: check that)
         * @param {boolean} isMethodCall if the property is accessed using () (method call)
         */
        this.getFieldPre = function(iid, base, offset, isComputed, isOpAssign, isMethodCall) {};
        /**
         * 
         * @param {number} iid the static instruction ID
         * @param {object} base the base object
         * @param {string|*} offset the property (name? or the property itself?)
         * @param {*} val the value to be stored 
         * @param {boolean} isComputed if the property is written using []
         * @param {boolean} isOpAssign True if the operation is of the form o.p op= e (TODO: check that)
         */
        this.putFieldPre = function(iid, base, offset, val, isComputed, isOpAssign) {};
    }
    sandbox.analysis = new MyAnalysis();
})(J$);

// node $JALANGI_ROOT/src/js/commands/jalangi.js --inlineIID -- inlineSource --analysis ./checkDeadWrites.js $TESTFILE