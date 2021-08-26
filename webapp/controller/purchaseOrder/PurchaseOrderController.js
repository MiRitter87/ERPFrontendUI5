sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Fragment, JSONModel) {
	"use strict";
	return {
		/**
		 * Initializes the model of the purchase order item to which the UI controls are bound.
		 * Since the item creation fragment is being reused in several views, the name of the model is always the same.
		 */
		initializePurchaseOrderItemModel : function (oController) {
			var oItemModel = new JSONModel();
			
			//Load and set item model
			oItemModel.loadData("model/purchaseOrder/purchaseOrderItemCreate.json");
			oController.getView().setModel(oItemModel, "newPurchaseOrderItem");	
		},
		
		
		/**
		 * Gets the ID of the selected business partner from a ComboBox.
		 */
		getSelectedPartnerId : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			
			if(oSelectedItem == null)
				return null;
				
			return oSelectedItem.getKey();
		},
		
		
		/**
		 * Sets the ID of the new purchase order item based on the number of already existing items.
		 */
		setIdOfNewItem : function (oPurchaseOrderModel, oPurchaseOrderItemModel) {
			var iExistingItemCount;
			
			iExistingItemCount = oPurchaseOrderModel.oData.items.length;
			oPurchaseOrderItemModel.setProperty("/itemId", iExistingItemCount + 1);
		},
		
		
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
	};
});