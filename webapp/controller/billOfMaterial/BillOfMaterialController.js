sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		/**
		 * Handles the selection of an item in the material ComboBox of the "new item"-dialog.
		 */
		onItemMaterialSelectionChange : function (oControlEvent, oController, oItemModel, oMaterials) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oMaterial;
			var oSelectedMaterialModel = new JSONModel();
			
			if(oSelectedItem == null) {
				oController.getView().setModel(null, "selectedItemMaterial");
				this.clearItemPopUpFields(oController);	
				return;
			}
			
			//Get the selected material from the array of all materials according to the id.
			for(var i = 0; i < oMaterials.oData.material.length; i++) {
    			var oTempMaterial = oMaterials.oData.material[i];
    			
				if(oTempMaterial.id == oSelectedItem.getKey()) {
					oMaterial = oTempMaterial;
				}
			}
			
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			oSelectedMaterialModel.setData(oMaterial);
			oController.getView().setModel(oSelectedMaterialModel, "selectedItemMaterial");
			
			//Update the material ID of the item model that is bound to the view.
			oItemModel.setProperty("/materialId", oMaterial.id);
		},
		
		
		/**
		 * Clears the fields and CheckBox of the PopUp for item creation.
		 */
		clearItemPopUpFields : function (oController) {
			oController.byId("itemMaterialComboBox").setSelectedItem(null);
			oController.byId("itemUnitText").setText("");
		},
		
		
		/**
		 * Initializes the model of the bill of material item to which the UI controls are bound.
		 * Since the item creation fragment is being reused in several views, the name of the model is always the same.
		 */
		initializeBillOfMaterialItemModel : function (oController) {
			var oItemModel = new JSONModel();
			
			//Load and set item model
			oItemModel.loadData("model/billOfMaterial/billOfMaterialItemCreate.json");
			oController.getView().setModel(oItemModel, "newBillOfMaterialItem");	
		},
		
		
		/**
		 * Sets the ID of the new bill of material item based on the number of already existing items.
		 */
		setIdOfNewItem : function (oBillOfMaterialModel, oController) {
			var iExistingItemCount;
			var oBillOfMaterialItemModel = oController.getView().getModel("newBillOfMaterialItem");
			
			iExistingItemCount = oBillOfMaterialModel.oData.items.length;
			oBillOfMaterialItemModel.setProperty("/itemId", iExistingItemCount + 1);
		},
		
		
		/**
		 * Checks if an item with the given material is already existing. Returns true, if item exists; false otherwise.
		 */
		isItemWithMaterialExisting : function (oBillOfMaterialItems, iMaterialId) {
			for(var i = 0; i < oBillOfMaterialItems.length; i++) {
    			var oTempItem = oBillOfMaterialItems[i];
    			
				if(oTempItem.materialId == iMaterialId) {
					return true;
				}
			}
			
			return false;
		}
	};
});