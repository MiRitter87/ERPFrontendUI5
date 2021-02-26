sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";
	return {
		/**
		 * Checks if a valid price is filled in.
		 */
		isPriceValid : function (sPriceInputString) {
			var fPricePerUnit = parseFloat(sPriceInputString);
			
			if(isNaN(fPricePerUnit)) {
				return false;
			}
			else {
				return true;
			}
		}
	};
});