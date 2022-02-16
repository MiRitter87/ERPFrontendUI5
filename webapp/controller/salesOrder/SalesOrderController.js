sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"../MainController"
], function (JSONModel, MainController) {
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
		 * Deletes the given sales order item from the sales order model.
		 */
		deleteItemFromOrderModel : function(oSalesOrderItem, oSalesOrderModel) {
			var oSalesOrderModel, oSalesOrderItems;
			
			oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			
			for(var i = 0; i < oSalesOrderItems.length; i++) {
    			var oTempItem = oSalesOrderItems[i];
    			
				if(oTempItem.itemId == oSalesOrderItem.itemId) {
					oSalesOrderItems.splice(i, 1);
				}
			}
		},
		
		
		/**
		 * Updates the IDs of the sales order items incrementally.
	     * The item IDs range from 1 to n, where n is the number of items.
		 */
		updateItemIds : function(oSalesOrderModel) {
			var oSalesOrderItems, oSalesOrderModel;

			oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			
			for(var i = 0; i < oSalesOrderItems.length; i++) {
				var oTempItem = oSalesOrderItems[i];
				oTempItem.itemId = i+1;
			}
		},
		
		
		/**
		 * Updates the total price of the sales order item based on the materials price per unit and the quantity ordered.
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
		 * Formatter of the sales order status text.
		 */
		orderStatusTextFormatter: function(sStatus, oResourceBundle) {
			switch(sStatus) {
				case "OPEN":
					return oResourceBundle.getText("salesOrder.status.open");
				case "IN_PROCESS":
					return oResourceBundle.getText("salesOrder.status.inProcess");
				case "FINISHED":
					return oResourceBundle.getText("salesOrder.status.finished");
				case "CANCELED":
					return oResourceBundle.getText("salesOrder.status.canceled");
			}
		},
		
		
		/**
		 * Formatter of the sales order status state.
		 */
		orderStatusStateFormatter: function(sStatus) {
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
		},
		
		
		/**
		 * Gets the sales order data of the sales order with the given ID.
		 */
		getSalesOrderById : function(iSalesOrderId, oSalesOrders) {
			//Get the selected sales order from the array of all sales orders according to the id.
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
    			
				if(oTempSalesOrder.id == iSalesOrderId) {
					return oTempSalesOrder;
				}
			}
			
			return null;
		},
		
		
		/**
		 * Initializes the model of the sales order item to which the UI controls are bound.
		 * Since the item creation fragment is being reused in several views, the name of the model is always the same.
		 */
		initializeSalesOrderItemModel : function (oController) {
			var oItemModel = new JSONModel();
			
			//Load and set item model
			oItemModel.loadData("model/salesOrder/salesOrderItemCreate.json");
			oController.getView().setModel(oItemModel, "newSalesOrderItem");	
		},
		
		
		/**
		 * The WebService provides dates as milliseconds since 01.01.1970.
	     * This function initializes the date properties as Date objects based on the given values.
		 */
		initializeDatesAsObject : function(oSalesOrders) {			
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
				var oDate;
    			
				if(oTempSalesOrder.orderDate != null) {
					oDate = new Date(oTempSalesOrder.orderDate);
					oTempSalesOrder.orderDate = oDate;					
				}
				
				if(oTempSalesOrder.requestedDeliveryDate != null) {
					oDate = new Date(oTempSalesOrder.requestedDeliveryDate);
					oTempSalesOrder.requestedDeliveryDate = oDate;					
				}
			}
		},
		
		
		/**
		 * Initializes the given ComboBox with items for sales order status selection.
		 */
		initializeStatusComboBox : function(oComboBox, oResourceBundle) {
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "OPEN", "salesOrder.status.open");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "IN_PROCESS", "salesOrder.status.inProcess");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "FINISHED", "salesOrder.status.finished");
			MainController.addItemToComboBox(oComboBox, oResourceBundle, "CANCELED", "salesOrder.status.canceled");
		},
		
		
		/**
		 * Sets the ID of the new sales order item based on the number of already existing items.
		 */
		setIdOfNewItem : function (oSalesOrderModel, oController) {
			var iExistingItemCount;
			var oSalesOrderItemModel = oController.getView().getModel("newSalesOrderItem");
			
			iExistingItemCount = oSalesOrderModel.oData.items.length;
			oSalesOrderItemModel.setProperty("/itemId", iExistingItemCount + 1);
		},
		
		
		/**
		 * Checks if an item with the given material is already existing. Returns true, if item exists; false otherwise.
		 */
		isItemWithMaterialExisting : function (oSalesOrderItems, iMaterialId) {
			for(var i = 0; i < oSalesOrderItems.length; i++) {
    			var oTempItem = oSalesOrderItems[i];
    			
				if(oTempItem.materialId == iMaterialId) {
					return true;
				}
			}
			
			return false;
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
		 * Calls a WebService operation to create a sales order.
		 */
		createSalesOrderByWebService : function(oSalesOrderModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/salesOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oSalesOrderModel.getJSON();
			
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
		 * Queries the sales order WebService for all sales orders.
		 */
		querySalesOrdersByWebService : function(callbackFunction, oCallingController, bShowSuccessMessage, sOrderStatusQuery) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/salesOrder");
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
		 * Updates changes of the sales order data using the WebService.
		 */
		saveSalesOrderByWebService : function(oSalesOrderModel, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/salesOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var sJSONData = oSalesOrderModel.getJSON();
			
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
		 * Deletes the given sales order using the WebService.
		 */
		deleteSalesOrderByWebService : function(oSalesOrder, callbackFunction, oCallingController) {
			var sWebServiceBaseUrl = oCallingController.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/salesOrder");
			var sQueryUrl = sWebServiceBaseUrl + "/" + oSalesOrder.id;
			
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