sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		/**
		 * Initializes the model of the bill of material item to which the UI controls are bound.
		 * Since the item creation fragment is being reused in several views, the name of the model is always the same.
		 */
		initializeBillOfMaterialItemModel : function (oController) {
			var oItemModel = new JSONModel();
			
			//Load and set item model
			oItemModel.loadData("model/billOfMaterial/billOfMaterialItemCreate.json");
			oController.getView().setModel(oItemModel, "newBillOfMaterialItem");	
		}
	};
});