sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";
	return {
		/**
		 * Handles the selection of an item in the material ComboBox of the "new item"-dialog.
		 */
		onMaterialSelectionChange : function (oControlEvent, oController, oItemModel, oMaterials) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oMaterial;
			var oSelectedMaterialModel = new JSONModel();
			
			if(oSelectedItem == null) {
				oController.getView().setModel(null, "selectedMaterial");
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
			oController.getView().setModel(oSelectedMaterialModel, "selectedMaterial");
			
			//Update the material ID of the item model that is bound to the view.
			oItemModel.setProperty("/materialId", oMaterial.id);
		},
		
		
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
		
		
		/**
		 * Checks if an item with the given material is already existing. Returns true, if item exists; false otherwise.
		 */
		isItemWithMaterialExisting : function (oProductionOrderItems, iMaterialId) {
			for(var i = 0; i < oProductionOrderItems.length; i++) {
    			var oTempItem = oProductionOrderItems[i];
    			
				if(oTempItem.materialId == iMaterialId) {
					return true;
				}
			}
			
			return false;
		},
		
		
		/**
		 * Deletes the given item from the production order model.
		 */
		deleteItemFromOrderModel : function(oProductionOrderItem, oProductionOrderModel) {
			var oProductionOrderItems;
			
			oProductionOrderItems = oProductionOrderModel.getProperty("/items");
			
			for(var i = 0; i < oProductionOrderItems.length; i++) {
    			var oTempItem = oProductionOrderItems[i];
    			
				if(oTempItem.itemId == oProductionOrderItem.itemId) {
					oProductionOrderItems.splice(i, 1);
				}
			}
		},
		
		
		/**
		 * Updates the IDs of the production order items incrementally.
	     * The item IDs range from 1 to n, where n is the number of items.
		 */
		updateItemIds : function(oProductionOrderModel) {
			var oProductionOrderItems;

			oProductionOrderItems = oProductionOrderModel.getProperty("/items");
			
			for(var i = 0; i < oProductionOrderItems.length; i++) {
				var oTempItem = oProductionOrderItems[i];
				oTempItem.itemId = i+1;
			}
		},
	};
});