sap.ui.define([
	"../material/MaterialController",
	"sap/ui/model/json/JSONModel"
], function (MaterialController, JSONModel) {
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
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId, oMaterials) {
			var oMaterial = MaterialController.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.name;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId, oMaterials) {
			var oMaterial = MaterialController.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.unit;
			else
				return "";
		},
		
		
		/**
		 * Gets the bill of material data of the bill of material with the given ID.
		 */
		getBillOfMaterialById : function(iBillOfMaterialId, oBillOfMaterials) {
			//Get the selected bill of material from the array of all bill of materials according to the id.
			for(var i = 0; i < oBillOfMaterials.length; i++) {
    			var oTempBillOfMaterial = oBillOfMaterials[i];
    			
				if(oTempBillOfMaterial.id == iBillOfMaterialId) {
					return oTempBillOfMaterial;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Calls a WebService operation to create a bill of material.
		 */
		createBillOfMaterialByWebService : function(oBillOfMaterialModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/billOfMaterial");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oBillOfMaterialModel.getJSON();
			
			//Use "POST" to create a resource.
			jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		},
		
		
		/**
		 * Queries the bill of material WebService for all bill of materials.
		 */
		queryBillOfMaterialsByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/billOfMaterial");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		}
	};
});