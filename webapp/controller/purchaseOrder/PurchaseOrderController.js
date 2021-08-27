sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Fragment, JSONModel) {
	"use strict";
	return {
		/**
		 * Handles the selection of an item in the material ComboBox of the "new item"-dialog.
		 */
		onMaterialSelectionChange : function (oControlEvent, oController, oItemModel, oMaterials) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oMaterial;
			var oSelectedMaterialModel = new JSONModel();
			
			if(oSelectedItem == null)
				return;
			
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
			
			this.updatePriceTotal(oSelectedMaterialModel, oItemModel);
		},
		
		
		/**
		 * Updates the total price of the purchase order item based on the materials price per unit and the quantity ordered.
		 */
		updatePriceTotal : function (oSelectedMaterialModel, oItemModel) {
			var fPricePerUnit, fPriceTotal, iQuantity;
			
			fPricePerUnit = oSelectedMaterialModel.getProperty("/pricePerUnit");
			iQuantity = oItemModel.getProperty("/quantity");
			fPriceTotal = parseFloat((fPricePerUnit * iQuantity).toFixed(2));	//Round to two decimal places
			
			oItemModel.setProperty("/priceTotal", fPriceTotal);
		},
		
		
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
		 * Clears the fields and CheckBox of the PopUp for item creation.
		 */
		clearItemPopUpFields : function (oController) {
			oController.byId("materialComboBox").setSelectedItem(null);
			oController.byId("itemUnitText").setText("");
			oController.byId("itemCurrencyText").setText("");
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
		 * Checks if an item with the given material is already existing. Returns true, if item exists; false otherwise.
		 */
		isItemWithMaterialExisting : function (oPurchaseOrderItems, iMaterialId) {
			for(var i = 0; i < oPurchaseOrderItems.length; i++) {
    			var oTempItem = oPurchaseOrderItems[i];
    			
				if(oTempItem.materialId == iMaterialId) {
					return true;
				}
			}
			
			return false;
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId, oMaterials) {
			var oMaterial = this.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.currency;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId, oMaterials) {
			var oMaterial = this.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.name;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId, oMaterials) {
			var oMaterial = this.getMaterialById(iMaterialId, oMaterials);
			
			if(oMaterial != null)	
				return oMaterial.unit;
			else
				return "";
		},
		
		
		/**
		 * Gets the material data of the material with the given ID.
		 */
		getMaterialById : function(iMaterialId, oMaterials) {
			for(var i = 0; i < oMaterials.oData.material.length; i++) {
    			var tempMaterial = oMaterials.oData.material[i];
    			
				if(tempMaterial.id == iMaterialId) {
					return tempMaterial;
				}
			}
			
			return null;
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
		
		
		/**
		 * Calls a WebService operation to create a purchase order.
		 */
		createPurchaseOrderByWebService : function(oPurchaseOrderModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/purchaseOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oPurchaseOrderModel.getJSON();
			
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
		}
	};
});