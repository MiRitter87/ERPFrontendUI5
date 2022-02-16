sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/core/Item"
], function (Fragment, Item) {
	"use strict";
	return {
		/**
		 * Opens the fragment with the given name as PopUp.
		 */
		openFragmentAsPopUp : function (oController, sName) {
			var oView = oController.getView();
			
			//create dialog lazily
			if (!oController.pDialog) {
				oController.pDialog = Fragment.load({
					id: oView.getId(),
					name: sName,
					controller: oController
				}).then(function (oDialog) {
					//connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			oController.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},
		
		
		/**
		 * Gets the key of the selected item from a ComboBox.
		 * Returns null, if no item is selected.
		 */
		getSelectedCBItemKey : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			
			if(oSelectedItem == null)
				return null;
				
			return oSelectedItem.getKey();
		},
		
		
		/**
		 * Adds an item to a ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
		},
		
		
		/**
		 * Navigates to the startpage.
		 */
		navigateToStartpage : function(oRouter, oNavigationModel) {
			var sNavigationType = oNavigationModel.getProperty("/type");
			
			if(sNavigationType == "tree") {
				oRouter.navTo("startPageRoute");				
			}
			if(sNavigationType == "tile") {
				oRouter.navTo("startPageTilesRoute");				
			}
		}
	};
});