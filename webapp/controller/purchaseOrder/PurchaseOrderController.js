sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item"
], function (Fragment, JSONModel, Item) {
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
			
			this.updatePriceTotal(oSelectedMaterialModel, oItemModel);
		},
		
		
		/**
		 * Updates the total price of the purchase order item based on the materials price per unit and the quantity ordered.
		 */
		updatePriceTotal : function (oSelectedMaterialModel, oItemModel) {
			var fPricePerUnit, fPriceTotal, iQuantity;
			
			//No material selected before quantity changed.
			if(oSelectedMaterialModel === undefined) {
				return;
			}
			
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
		 * The WebService provides dates as milliseconds since 01.01.1970.
	     * This function initializes the date properties as Date objects based on the given values.
		 */
		initializeDatesAsObject : function(oPurchaseOrders) {			
			for(var i = 0; i < oPurchaseOrders.length; i++) {
    			var oTempPurchaseOrder = oPurchaseOrders[i];
				var oDate;
    			
				if(oTempPurchaseOrder.orderDate != null) {
					oDate = new Date(oTempPurchaseOrder.orderDate);
					oTempPurchaseOrder.orderDate = oDate;					
				}
				
				if(oTempPurchaseOrder.requestedDeliveryDate != null) {
					oDate = new Date(oTempPurchaseOrder.requestedDeliveryDate);
					oTempPurchaseOrder.requestedDeliveryDate = oDate;					
				}
			}
		},
		
		
		/**
		 * Initializes the given ComboBox with items for purchase order detail status selection.
		 */
		initializeDetailStatusComboBox : function(oComboBox, oResourceBundle) {
			this.addItemToComboBox(oComboBox, oResourceBundle, "INVOICE_RECEIPT", "purchaseOrder.detailStatus.invoiceReceipt");
			this.addItemToComboBox(oComboBox, oResourceBundle, "GOODS_RECEIPT", "purchaseOrder.detailStatus.goodsReceipt");
			this.addItemToComboBox(oComboBox, oResourceBundle, "INVOICE_SETTLED", "purchaseOrder.detailStatus.invoiceSettled");
			this.addItemToComboBox(oComboBox, oResourceBundle, "CANCELED", "purchaseOrder.detailStatus.canceled");
		},
		
		
		/**
		 * Adds an item to the ComboBox.
		 */
		addItemToComboBox : function(oComboBox, oResourceBundle, sItemKey, sTextKey) {
			var oComboBoxItem = new Item();
			
			oComboBoxItem.setKey(sItemKey);
			oComboBoxItem.setText(oResourceBundle.getText(sTextKey));
			oComboBox.addItem(oComboBoxItem);
		},
		
		
		/**
		 * Clears the fields and CheckBox of the PopUp for item creation.
		 */
		clearItemPopUpFields : function (oController) {
			oController.byId("materialComboBox").setSelectedItem(null);
			oController.byId("itemUnitText").setText("");
			oController.byId("itemPriceTotalText").setText("");
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
		setIdOfNewItem : function (oPurchaseOrderModel, oController) {
			var iExistingItemCount;
			var oPurchaseOrderItemModel = oController.getView().getModel("newPurchaseOrderItem");
			
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
		 * Formatter of the purchase order total status text.
		 */
		totalStatusTextFormatter: function(aStatus, oResourceBundle) {
			if(aStatus == null || aStatus == undefined)
				return "";
			
			for(var i = 0; i < aStatus.length; i++) {
				var sStatus = aStatus[i];
				
				switch(sStatus) {
					case "OPEN":
						return oResourceBundle.getText("purchaseOrder.totalStatus.open");
					case "IN_PROCESS":
						return oResourceBundle.getText("purchaseOrder.totalStatus.inProcess");
					case "FINISHED":
						return oResourceBundle.getText("purchaseOrder.totalStatus.finished");
					case "CANCELED":
						return oResourceBundle.getText("purchaseOrder.totalStatus.canceled");
				}				
			}
		},
		
		
		/**
		 * Formatter of the purchase order total status state.
		 */
		totalStatusStateFormatter: function(aStatus) {
			if(aStatus == null || aStatus == undefined)
				return "Information";
			
			for(var i = 0; i < aStatus.length; i++) {
				var sStatus = aStatus[i];
			
				switch(sStatus) {
					case "OPEN":
						return "Information";
					case "IN_PROCESS":
						return "Information";
					case "FINISHED":
						return "Success";
					case "CANCELED":
						return "Error";
				}
			}
		},
		
		
		/**
		 * Determines the detail status text based on the given purchase order model.
		 */
		getDetailStatusText : function(aStatus, oResourceBundle) {
			var sDetailStatusText = "";
			var sSingleStatusText;
			
			for(var i = 0; i < aStatus.length; i++) {
				var sStatus = aStatus[i];
				sSingleStatusText = "";
				
				switch(sStatus) {
					case "GOODS_RECEIPT":
						sSingleStatusText = oResourceBundle.getText("purchaseOrder.detailStatus.goodsReceipt");
						break;
					case "INVOICE_RECEIPT":
						sSingleStatusText = oResourceBundle.getText("purchaseOrder.detailStatus.invoiceReceipt");
						break;
					case "INVOICE_SETTLED":
						sSingleStatusText = oResourceBundle.getText("purchaseOrder.detailStatus.invoiceSettled");
						break;
				}	
				
				if(sSingleStatusText == "")
					continue;
					
				if(sDetailStatusText != "")
					sDetailStatusText += ", ";
					
				sDetailStatusText += sSingleStatusText;			
			}
			
			return sDetailStatusText;
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
		 * Gets the purchase order data of the purchase order with the given ID.
		 */
		getPurchaseOrderById : function(iPurchaseOrderId, oPurchaseOrders) {
			//Get the selected purchase order from the array of all purchase orders according to the id.
			for(var i = 0; i < oPurchaseOrders.length; i++) {
    			var oTempPurchaseOrder = oPurchaseOrders[i];
    			
				if(oTempPurchaseOrder.id == iPurchaseOrderId) {
					return oTempPurchaseOrder;
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
		},
		
		
		/**
		 * Queries the purchase order WebService for all purchase orders.
		 */
		queryPurchaseOrdersByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sOrderStatusQuery) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/purchaseOrder");
			var sQueryUrl;
			
			if(sOrderStatusQuery == undefined || sOrderStatusQuery == null)
				sQueryUrl = sWebServiceBaseUrl + "/";
			else
			 	sQueryUrl= sWebServiceBaseUrl + "/" + "?orderStatusQuery=" + sOrderStatusQuery;
			
			jQuery.ajax({
				type : "GET", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController, bShowSuccessMessage);
				}
			});                                                                 
		},
		
		
		/**
		 * Updates changes of the purchase order data using the WebService.
		 */
		savePurchaseOrderByWebService : function(oPurchaseOrderModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/purchaseOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oPurchaseOrderModel.getJSON();
			
			//Use "PUT" to update an existing resource.
			jQuery.ajax({
				type : "PUT", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			}); 
		},
		
		
		/**
		 * Deletes the given purchase order using the WebService.
		 */
		deletePurchaseOrderByWebService : function(oPurchaseOrder, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/purchaseOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oPurchaseOrder.id;
			
			//Use "DELETE" to delete an existing resource.
			jQuery.ajax({
				type : "DELETE", 
				contentType : "application/json", 
				url : sQueryUrl, 
				dataType : "json", 
				success : function(data) {
					callbackFunction(data, oCallingController);
				}
			});
		}
	};
});