sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		/**
		 * Initializes the model of the production order item to which the UI controls are bound.
		 * Since the item creation fragment is being reused in several views, the name of the model is always the same.
		 */
		initializeProductionOrderItemModel : function (oController) {
			var oItemModel = new JSONModel();
			
			//Load and set item model
			oItemModel.loadData("model/productionOrder/productionOrderItemCreate.json");
			oController.getView().setModel(oItemModel, "newProductionOrderItem");	
		},
		
		
		/**
		 * Sets the ID of the new production order item based on the number of already existing items.
		 */
		setIdOfNewItem : function (oProductionOrderModel, oController) {
			var iExistingItemCount;
			var oProductionOrderItemModel = oController.getView().getModel("newProductionOrderItem");
			
			iExistingItemCount = oProductionOrderModel.oData.items.length;
			oProductionOrderItemModel.setProperty("/itemId", iExistingItemCount + 1);
		},
		
		
		/**
		 * Clears the fields and CheckBox of the PopUp for item creation.
		 */
		clearItemPopUpFields : function (oController) {
			oController.byId("materialComboBox").setSelectedItem(null);
			oController.byId("itemUnitText").setText("");
		},
	};
});