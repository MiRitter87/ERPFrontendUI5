sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	return {
		/**
		 * Initializes the given ComboBox with items for gender selection.
		 */
		initializeGenderComboBox : function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, "MALE", "gender.male");
			this.addItemToComboBox(oComboBox, oResourceBundle, "FEMALE", "gender.female");
		},
		
		
		/**
		 * Adds an item to the given ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
		},
	};
});